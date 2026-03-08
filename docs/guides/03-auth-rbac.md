---
title: Auth and RBAC
---

# Authentication and RBAC

## Supported Auth Flows

- Manual register/login (`email` + `password`)
- Google login (`idToken`)
- Refresh session (rotation + reuse detection)

## Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/logout-all` (auth)
- `GET /auth/me`
- `GET /auth/admin/ping` (role: `admin`)

## Token Model (Simple)

- **Access token** (JWT):
  - dipakai di header `Authorization: Bearer <token>`
  - expired lebih cepat (lebih aman jika token bocor)
- **Refresh token**:
  - disimpan di cookie `HttpOnly` (tidak bisa dibaca JavaScript)
  - dipakai hanya untuk minta access token baru
  - setiap refresh akan di-rotate (token lama dicabut)

Jika refresh token lama dipakai ulang (indikasi token dicuri), semua session user akan dicabut dan user harus login ulang.

## JWT Claims

Access token membawa claim utama:

- `sub` (user id)
- `email`
- `role` (`admin` / `member`)

Verifikasi token dilakukan di HTTP adapter sebelum handler dijalankan.

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

## Cara Pakai di UI (Bahasa Simple)

### 1. Login

Kirim request login biasa:

```ts
const res = await fetch('/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'user@mail.com',
    password: 'password123',
  }),
});

const json = await res.json();
const accessToken = json.data.accessToken;
```

- Simpan `accessToken` di memory aplikasi (state/store), bukan `localStorage` jika memungkinkan.
- Refresh token otomatis tersimpan di cookie dari response `Set-Cookie`.

### 2. Call API yang butuh auth

```ts
const res = await fetch('/v1/auth/me', {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
  credentials: 'include',
});
```

### 3. Jika access token expired

Panggil refresh:

```ts
const refreshRes = await fetch('/v1/auth/refresh', {
  method: 'POST',
  credentials: 'include',
});

if (refreshRes.ok) {
  const refreshJson = await refreshRes.json();
  accessToken = refreshJson.data.accessToken;
} else {
  // refresh gagal -> paksa user login lagi
}
```

### 4. Logout device ini saja

```ts
await fetch('/v1/auth/logout', {
  method: 'POST',
  credentials: 'include',
});
```

Ini mencabut session refresh token saat ini.

### 5. Logout semua device

```ts
await fetch('/v1/auth/logout-all', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
  credentials: 'include',
});
```

Ini mencabut semua session user di semua device.

## Catatan Integrasi UI

- Untuk aplikasi beda origin (mis. API `api.domain.com`, UI `app.domain.com`), request harus `credentials: 'include'`.
- Pastikan konfigurasi CORS server mengizinkan origin UI yang dipakai.
