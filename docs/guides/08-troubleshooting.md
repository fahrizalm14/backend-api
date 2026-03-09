---
title: Troubleshooting
---

# Troubleshooting

## Common Errors

### 401 Token not found

Header `Authorization` tidak dalam format `Bearer <token>`.

### 401 Invalid token

Token invalid/expired atau `JWT_SECRET` tidak sesuai.

### 403 Forbidden

Role user tidak memenuhi `requiredRoles` pada endpoint.

### 400 Invalid payload/query

Input tidak lolos validasi schema (Zod).

### Startup error: missing env file

- Development/Test: pastikan file `env/<service>.env` ada sesuai `DEPLOYMENT_TARGET`.
- Production: pastikan root `.env` tersedia.

### Startup error: missing required env

Untuk `public-api`, pastikan minimal:

- `JWT_SECRET`
- `DATABASE_URL`

## Build and Type Errors

Jalankan berurutan:

```bash
pnpm typecheck
pnpm lint
pnpm test
```

## CORS Rejection

Periksa `CORS_ALLOWED_ORIGINS`. Jika diisi, origin lain akan ditolak.
