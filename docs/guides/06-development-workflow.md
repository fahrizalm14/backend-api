---
title: Development Workflow
---

# Development Workflow

## Local Setup

```bash
pnpm install
cp env/public-api.env.example env/public-api.env
cp env/internal-api.env.example env/internal-api.env
cp env/worker.env.example env/worker.env
```

Mode env:

- Development/Test: load `env/<service>.env` sesuai `DEPLOYMENT_TARGET`
- Production: load root `.env`

## Commands

```bash
pnpm dev:public
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm check
```

## Prisma

```bash
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:migrate:deploy
```

## Branch and PR Standard

- Gunakan branch feature per scope perubahan.
- Pastikan `pnpm check` lulus sebelum PR.
- Sertakan perubahan OpenAPI jika kontrak API berubah.
- Sertakan update docs jika behavior/konfigurasi berubah.
