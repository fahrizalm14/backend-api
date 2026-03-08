---
title: Auth and RBAC
---

# Authentication and RBAC

## Supported Auth Flows

- Manual register/login (`email` + `password`)
- Google login (`idToken`)

## Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google/login`
- `GET /auth/me`
- `GET /auth/admin/ping` (role: `admin`)

## JWT Claims

Token internal membawa claim utama:

- `sub` (user id)
- `email`
- `role` (`admin` / `member`)

Verifikasi token dilakukan di adapter HTTP sebelum handler dijalankan.

## RBAC

RBAC dikonfigurasi di route definition dengan `requiredRoles`.

Contoh:

```ts
{
  method: 'GET',
  path: '/admin/ping',
  requiresAuth: true,
  requiredRoles: ['admin'],
  handler: async () => controller.adminPing(),
}
```

Jika role tidak cocok, API mengembalikan `403 Forbidden`.
