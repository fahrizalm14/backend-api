---
title: Operations and Deployment
---

# Operations and Deployment

## Environment Strategy

Gunakan env file berdasarkan mode runtime:

- Development/Test: `env/<service>.env`
- Production: root `.env`

Contoh file service:

- `env/public-api.env.example`
- `env/internal-api.env.example`
- `env/worker.env.example`

Mapping service -> env file dikelola di `src/config/envTargetRules.ts`.

## Production Baseline

- `JWT_SECRET` harus secret yang kuat.
- `DATABASE_URL` harus mengarah ke DB production.
- Batasi origin dengan `CORS_ALLOWED_ORIGINS`.
- Jalankan migrasi Prisma sebelum start service.
- Untuk `public-api`, minimal env wajib: `JWT_SECRET` dan `DATABASE_URL`.

## Start Sequence

```bash
pnpm build
pnpm start
```

`DEPLOYMENT_TARGET` menentukan service yang aktif saat runtime.

## Health Check

Gunakan endpoint:

- `GET /health`
