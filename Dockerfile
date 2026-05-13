# ── Stage 1: Build ──────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies first (layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build

# ── Stage 2: Production runtime ────────────────────────────
FROM node:22-slim AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate \
     && npm install -g pm2 \
     && apt-get update && apt-get install -y --no-install-recommends wget \
     && rm -rf /var/lib/apt/lists/*

# Copy built output + production deps
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./

# Copy runtime assets
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/cdn ./cdn

# PM2 ecosystem config
COPY docker/ecosystem.config.cjs ./ecosystem.config.cjs

# Create logs directory
RUN mkdir -p /app/logs

# Non-root user
RUN groupadd --gid 1001 gosha \
     && useradd --uid 1001 --gid gosha --shell /bin/bash --create-home gosha \
     && chown -R gosha:gosha /app

USER gosha

EXPOSE 9999

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
     CMD wget -qO- http://localhost:9999/api/health || exit 1

CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]
