# Repository Guidelines

## Project Structure & Module Organization

This repository contains a TypeScript Express backend and a Vue 3 frontend. Backend source lives in `src/`; feature APIs are grouped under `src/Module/<Feature>/` with `Controller/`, `Service/`, `DTO/`, `Schema/`, optional `middleware/`, and co-located `__tests__/`. Pure prompt-engine logic lives in `src/agent/`; its HTTP wrapper belongs in `src/Module/agent/`. Shared utilities are in `src/utils/`, config in `src/config/`, queue workers in `src/MessageQueue/`, docs in `Docs/`, and frontend code in `frontend/src/`.

## Build, Test, and Development Commands

Use `pnpm install` from the repository root. Key backend commands:

- `pnpm dev`: run the Express app and email queue worker with nodemon.
- `pnpm build`: compile TypeScript into `dist/` using `tsconfig.build.json`.
- `pnpm start`: run the compiled app and queue worker.
- `pnpm lint`: run ESLint across the repository.
- `pnpm test`: run Jest tests serially.
- `pnpm test:e2e`: run Vitest endpoint/unit tests once.
- `pnpm gen:app`: regenerate generated app/import configuration.

Frontend commands run from `frontend/`, for example `pnpm --dir frontend dev`, `pnpm --dir frontend build`, and `pnpm --dir frontend typecheck`.

## Coding Style & Naming Conventions

Use TypeScript with strict project settings and path aliases such as `@/gen-import`. Prefer existing module patterns. Controllers should be one exported request handler per endpoint, service classes should follow names like `BasedUserService`, and DTO files should export both Zod schemas and inferred types. Route cross-module imports through generated exports where this project already does so. Existing code uses single quotes, no semicolons, and indentation consistent with surrounding files.

## Testing Guidelines

Tests live in `__tests__/` directories near the code under test. Vitest includes `*.endpoint.test.ts` and `*.unit.test.ts` under `src/**/__tests__/`; endpoint tests use Supertest and `src/__tests__/helpers/test-app.ts`. Add focused tests for changed behavior, especially controllers, auth, token logic, and prompt-engine scripts. Run `pnpm test:e2e` for Vitest coverage and `pnpm test` when touching Jest-covered code.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commit prefixes such as `fix:`, `feat:`, and `chore:`. Keep messages imperative and scoped to one change, for example `fix: update refresh token reset logic`. Pull requests should include a short summary, test results, linked issue when applicable, and screenshots or recordings for frontend changes.

## Security & Configuration Tips

Do not commit `.env` files, secrets, tokens, or generated logs. Copy environment examples locally and keep startup-sensitive imports intact: dotenv/config loading must happen before modules that read environment values. For auth changes, preserve existing cookie, PASETO, and middleware conventions.

## Permissions

Global rule:

- Ask the user first before making any code change.
- Show the intended change for review when possible.
- Wait for the user to accept or reject the change before editing project code.

### Allow

- Read tracked project files needed for the task.
- Read source code under `src/`, configuration under `config/`, and docs such as `README.md`, `CLAUDE.md`, and this file.
- Create new source or documentation files when they are required for the requested change.
- Edit application code, route files, models, middleware, utilities, tests, and markdown documentation.
- Update `package.json` when the task explicitly requires script or dependency changes.
- Run safe repo-local commands such as `rg`, `ls`, `sed`, `git status`, `pnpm lint`, and `pnpm test`.

### Deny

- Do not read, print, or copy secrets from `.env`, `.env.dev`, or any credential file.
- Do not modify `.env`, `.env.dev`, or other secret-bearing files unless the user explicitly asks.
- Do not modify `node_modules/`, generated caches, or log files.
- Do not change `pnpm-lock.yaml` unless dependency work is part of the task.
- Do not delete files, rename major directories, or rewrite large parts of the codebase without explicit approval.
- Do not run destructive git or shell commands such as `git reset --hard`, `git checkout --`, or broad `rm` operations.
- Do not alter deployment/infrastructure files (`Dockerfile`, `docker-compose.yml`, `ecosystem.config.cjs`) unless the task explicitly requires it.
