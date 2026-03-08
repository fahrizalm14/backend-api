---
title: Operations and Deployment
---

# Operations and Deployment

## Environment Strategy

Gunakan env file per service:

- `env/public-api.env.example`
- `env/internal-api.env.example`
- `env/worker.env.example`

## Production Baseline

- `JWT_SECRET` harus secret yang kuat.
- `DATABASE_URL` harus mengarah ke DB production.
- Batasi origin dengan `CORS_ALLOWED_ORIGINS`.
- Jalankan migrasi Prisma sebelum start service.

## Start Sequence

```bash
pnpm build
pnpm start
```

`DEPLOYMENT_TARGET` menentukan service yang aktif saat runtime.

## Health Check

Gunakan endpoint:

- `GET /health`
