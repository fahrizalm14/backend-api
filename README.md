# BACKEND API

Template backend API TypeScript untuk multi deployment target (`public-api`, `internal-api`, `worker`) dengan HTTP adapter Express/Fastify.

Panduan implementasi untuk agent/contributor ada di [AGENTS.md](./AGENTS.md).

## 1. Menjalankan Proyek

### 1.1 Prasyarat

- Node.js v20+
- pnpm

### 1.2 Instalasi

```bash
pnpm install
cp env/public-api.env.example .env
```

Alternatif target lain:

```bash
cp env/internal-api.env.example .env
cp env/worker.env.example .env
```

### 1.3 Development

Jalankan semua target:

```bash
pnpm dev
```

Jalankan target tertentu:

```bash
pnpm dev:public
pnpm dev:internal
pnpm dev:worker
```

### 1.4 Build dan Start

```bash
pnpm build
pnpm start
```

`pnpm start` menjalankan `dist/main.js` dan target ditentukan oleh `DEPLOYMENT_TARGET` di environment.

### 1.5 Type Check dan Test

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
```

## 2. Environment Variables

### 2.1 `public-api`

```env
DEPLOYMENT_TARGET=public-api
PORT=2001
JWT_SECRET=replace-me
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/backend_api
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

`CORS_ALLOWED_ORIGINS` opsional. Jika diisi, hanya origin dalam daftar yang diizinkan. Jika kosong, semua origin diizinkan.

### 2.2 `internal-api`

```env
DEPLOYMENT_TARGET=internal-api
PORT=2002
```

### 2.3 `worker`

```env
DEPLOYMENT_TARGET=worker
PORT=2020
```

## 3. Endpoint Bawaan

### 3.1 Health Check

- `GET /v1/health`

### 3.2 Projects (contoh modul)

- `GET /v1/projects` (auth)
- `POST /v1/projects` (auth)
- `GET /v1/projects/:projectId` (auth)
- `PATCH /v1/projects/:projectId` (auth)
- `DELETE /v1/projects/:projectId` (auth)

### 3.3 Auth

- `POST /v1/auth/register` (public, email + password)
- `POST /v1/auth/login` (public, email + password)
- `POST /v1/auth/google/login` (public)
- `GET /v1/auth/me` (auth)
- `GET /v1/auth/admin/ping` (auth + role `admin`)

## 4. Troubleshooting

- `401 Token not found`: header `Authorization` belum `Bearer <token>`
- `401 Invalid token`: secret JWT tidak sesuai atau token expired
- `400 Invalid payload/query`: input tidak lolos validasi
- Server tidak jalan: cek `PORT` dan konflik port

## 5. Menambahkan Middleware

Middleware bisa dipasang di 3 level: global, per-module, dan per-endpoint.

### 5.1 Global Middleware

Tambahkan di `src/core/http/createMiddlewares.ts` lewat `createGlobalMiddlewares()`.
Middleware ini berlaku ke semua endpoint.

### 5.2 Middleware Per Module

Di file module routes (`*.routes.ts`), return `middlewares` di `ModuleBuildResult`.

```ts
import type { HttpMiddleware, ModuleBuildResult } from '@/core/http/types';

const middlewares: HttpMiddleware[] = [
  {
    express: (req, _res, next) => next(),
    fastify: async (instance) => {
      instance.addHook('onRequest', async () => {});
    },
  },
];

export default function createExampleModule(): ModuleBuildResult {
  return {
    middlewares,
    routes,
  };
}
```

### 5.3 Middleware Per Endpoint

Tambahkan `middlewares` pada `RouteDefinition`.

```ts
{
  method: 'GET',
  path: '/me',
  middlewares: [
    {
      expressRoute: (req, _res, next) => next(),
      fastifyRoute: async (request, _reply) => {},
    },
  ],
  handler: async (ctx) => controller.me(ctx),
}
```

- `expressRoute` / `fastifyRoute`: khusus endpoint tersebut.
- `express` / `fastify`: tetap bisa dipakai untuk level module.

## 6. API Docs

- OpenAPI spec: `docs/openapi.yaml`
- HTML docs (Swagger UI / Try it out): `docs/index.html`

Contoh buka lokal:

```bash
npx serve docs
```

Lalu akses `http://localhost:3000`.

## 7. Lisensi

Belum ditentukan. Sesuaikan kebijakan organisasi sebelum produksi.
