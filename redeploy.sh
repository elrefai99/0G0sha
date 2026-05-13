#!/usr/bin/env bash
set -euo pipefail

# Quick redeploy — pull latest code, rebuild, restart
# Usage: sudo bash docker/redeploy.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
BRANCH="${BRANCH:-main}"

cd "$APP_DIR"

echo -e "${CYAN}[1/4]${NC} Pulling latest code..."
git fetch origin && git reset --hard "origin/${BRANCH}"

echo -e "${CYAN}[2/4]${NC} Building image..."
docker compose -f docker/docker-compose.yml build

echo -e "${CYAN}[3/4]${NC} Rolling restart..."
docker compose -f docker/docker-compose.yml up -d

echo -e "${CYAN}[4/4]${NC} Waiting for health..."
sleep 5
if curl -sf http://localhost/api/health | grep -q '"ok"'; then
    echo -e "${GREEN}Deploy complete — Gosha is healthy!${NC}"
else
    echo -e "${RED}Health check failed — check logs:${NC}"
    echo "  docker compose -f docker/docker-compose.yml logs --tail=50 app"
    exit 1
fi
