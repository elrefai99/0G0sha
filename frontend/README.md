# 0Gosha Frontend

Vue 3 + Vite + UnoCSS console for the 0Gosha API.

## Run

```bash
pnpm install
pnpm --filter @0gosha/frontend dev
```

The Vite dev server proxies `/api` and `/v0` to `VITE_API_PROXY_TARGET` from `.env`.

## Build

```bash
pnpm --filter @0gosha/frontend build
```
