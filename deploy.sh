#!/usr/bin/env bash
set -euo pipefail

# ─── Colors ────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}[INFO]${NC}  $1"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
fail()  { echo -e "${RED}[FAIL]${NC}  $1"; exit 1; }

DOMAIN="${DOMAIN:-api.0gosha.com}"
EMAIL="${EMAIL:-elrefai99@gmail.com}"
APP_DIR="${APP_DIR:-/opt/gosha}"
REPO="${REPO:-https://github.com/elrefai99/0Gosha.git}"
BRANCH="${BRANCH:-main}"

# ─── Pre-flight checks ────────────────────────────────────
[[ $EUID -ne 0 ]] && fail "Run as root: sudo bash deploy.sh"

info "Oracle Cloud Always Free — Gosha Deployment"
echo -e "  Domain:  ${CYAN}${DOMAIN}${NC}"
echo -e "  Email:   ${CYAN}${EMAIL}${NC}"
echo -e "  App dir: ${CYAN}${APP_DIR}${NC}"
echo ""

read -rp "Continue? [y/N] " confirm
[[ "$confirm" != "y" && "$confirm" != "Y" ]] && exit 0

# ─── Step 1: System packages ──────────────────────────────
info "Updating system packages..."
apt-get update -y && apt-get upgrade -y
apt-get install -y \
    ca-certificates curl gnupg lsb-release \
    git ufw fail2ban unzip wget

ok "System packages installed"

# ─── Step 2: Docker (official repo) ───────────────────────
if ! command -v docker &>/dev/null; then
    info "Installing Docker..."
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
        gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
        https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
        tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable docker
    ok "Docker installed"
else
    ok "Docker already installed"
fi

# ─── Step 3: Firewall (UFW) ───────────────────────────────
info "Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ok "Firewall configured (SSH + HTTP + HTTPS)"

# ─── Step 4: Fail2ban ─────────────────────────────────────
info "Enabling fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban
ok "Fail2ban active"

# ─── Step 5: Clone / update repo ──────────────────────────
if [ -d "$APP_DIR" ]; then
    info "Updating existing repo..."
    cd "$APP_DIR"
    git fetch origin
    git reset --hard "origin/${BRANCH}"
else
    info "Cloning repo..."
    git clone -b "$BRANCH" "$REPO" "$APP_DIR"
    cd "$APP_DIR"
fi
ok "Source code ready at ${APP_DIR}"

# ─── Step 6: .env check ───────────────────────────────────
if [ ! -f "$APP_DIR/.env" ]; then
    warn ".env file not found!"
    echo "  Copy .env.example → .env and fill in production values:"
    echo "    cp ${APP_DIR}/.env.example ${APP_DIR}/.env"
    echo "    nano ${APP_DIR}/.env"
    echo ""
    echo "  Required: MONGO_URI, REDIS_CACHE_LIVE, ACCESS_PRIVATE_KEY,"
    echo "  ACCESS_PUBLICE_KEY, REFRESH_PRIVATE_KEY, REFRESH_PUBLIC_KEY,"
    echo "  STRIPE_*, PAYMOB_*, CLOUDINARY_*, EMAIL_*"
    echo ""
    fail "Create .env first, then re-run this script."
fi
ok ".env file found"

# ─── Step 7: SSL certificate (first time) ─────────────────
if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    info "Obtaining SSL certificate..."

    # Temporary nginx for ACME challenge
    docker compose -f docker/docker-compose.yml down 2>/dev/null || true

    # Create temp nginx conf for certbot
    mkdir -p /tmp/certbot-nginx
    cat > /tmp/certbot-nginx/default.conf << 'TMPNGINX'
server {
    listen 80;
    server_name _;
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    location / {
        return 444;
    }
}
TMPNGINX

    docker run -d --name certbot-nginx \
        -p 80:80 \
        -v /tmp/certbot-nginx/default.conf:/etc/nginx/conf.d/default.conf:ro \
        -v gosha_certbot_www:/var/www/certbot \
        nginx:alpine

    # Run certbot
    docker run --rm \
        -v gosha_certbot_certs:/etc/letsencrypt \
        -v gosha_certbot_www:/var/www/certbot \
        certbot/certbot:arm64v8-latest \
        certonly --webroot -w /var/www/certbot \
        -d "$DOMAIN" --email "$EMAIL" --agree-tos --no-eff-email

    docker stop certbot-nginx && docker rm certbot-nginx
    rm -rf /tmp/certbot-nginx

    ok "SSL certificate obtained for ${DOMAIN}"
else
    ok "SSL certificate already exists"
fi

# ─── Step 8: Build & deploy ───────────────────────────────
info "Building Docker images..."
cd "$APP_DIR"
docker compose -f docker/docker-compose.yml build --no-cache

info "Starting services..."
docker compose -f docker/docker-compose.yml up -d

# Wait for healthy
info "Waiting for health check..."
for i in $(seq 1 30); do
    if docker compose -f docker/docker-compose.yml exec -T nginx \
        wget -qO- http://localhost/api/health 2>/dev/null | grep -q '"ok"'; then
        ok "Gosha is healthy!"
        break
    fi
    if [ "$i" -eq 30 ]; then
        fail "Health check failed after 30 attempts"
    fi
    sleep 2
done

# ─── Step 9: Certbot renewal cron ─────────────────────────
CRON_CMD="0 3 * * * cd ${APP_DIR} && docker compose -f docker/docker-compose.yml exec -T certbot certbot renew --quiet && docker compose -f docker/docker-compose.yml exec -T nginx nginx -s reload"
(crontab -l 2>/dev/null | grep -v "certbot renew"; echo "$CRON_CMD") | crontab -
ok "Certbot auto-renewal cron installed (daily 3AM)"

# ─── Done ──────────────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Gosha deployed successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "  API:     ${CYAN}https://${DOMAIN}${NC}"
echo -e "  Health:  ${CYAN}https://${DOMAIN}/api/health${NC}"
echo -e "  Swagger: ${CYAN}https://${DOMAIN}/api-docs${NC}"
echo ""
echo -e "  Useful commands:"
echo -e "    ${YELLOW}docker compose -f docker/docker-compose.yml logs -f app${NC}     # App logs"
echo -e "    ${YELLOW}docker compose -f docker/docker-compose.yml ps${NC}               # Status"
echo -e "    ${YELLOW}docker compose -f docker/docker-compose.yml restart app${NC}      # Restart app"
echo -e "    ${YELLOW}docker exec gosha-app pm2 monit${NC}                              # PM2 monitor"
echo -e "    ${YELLOW}docker exec gosha-app pm2 logs${NC}                               # PM2 logs"
echo ""
