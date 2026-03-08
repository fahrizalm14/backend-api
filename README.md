# BACKEND API

Template backend API berbasis TypeScript yang mempunyai pola controller tipis, service sebagai pusat business logic, repository sebagai layer akses data, serta kontrak response yang konsisten untuk frontend.

## 1. Tujuan

Repository ini disiapkan sebagai baseline untuk membuat service baru dengan standar yang sama seperti aplikasi sumber:
- Kontrak API konsisten dan FE-compatible
- Struktur modul yang terprediksi
- Error handling terpusat
- Pola auth dan ownership yang aman
- Mudah diperluas untuk Express/Fastify, DB, worker, dan modul tambahan

### 1.1 Dukungan Arsitektur Microservice

Template ini didesain agar **satu repo** bisa menjalankan beberapa target microservice.

Pola penggunaannya:
- Tiap microservice didefinisikan sebagai `deployment target` di `src/config/deployment.config.ts`
- Runtime memilih target lewat `DEPLOYMENT_TARGET`
- Tiap target punya modul dan port sendiri
- Tiap target bisa dijalankan sebagai proses/deployment terpisah
- Kontrak API, error format, dan layering tetap konsisten lintas service

Target bawaan saat ini:
- `public-api` (HTTP aktif, modul `projects`, default port `2001`)
- `internal-api` (HTTP aktif, placeholder untuk modul internal, default port `2002`)
- `worker` (HTTP aktif untuk health check, tanpa route bisnis, default port `2020`)

## 2. Teknologi Utama

- Node.js (disarankan v20+)
- TypeScript
- Express
- Fastify
- Zod
- tsyringe (dependency injection)
- JSON Web Token (`jsonwebtoken`)
- tsup (build)
- tsx (development runtime)

## 3. Arsitektur Tingkat Tinggi

Alur request:
1. Request masuk ke HTTP adapter (`ExpressHttpServer` atau `FastifyHttpServer`)
2. Route memanggil method controller
3. Controller melakukan parsing/validasi/auth extraction
4. Controller meneruskan ke service
5. Service menjalankan business logic + ownership guard
6. Service memanggil repository untuk data access
7. Controller mengembalikan response standar `{ message, data }`
8. Error akan ditangani oleh error handler global menjadi `{ message }`

Catatan microservice:
- Pertahankan struktur `core/` yang sama untuk seluruh target.
- Pisahkan domain modul per target di `deployment.config.ts`.
- Jalankan deployment terpisah per target agar scaling independen.

## 4. Kontrak Response API

### 4.1 Success Response

Semua success response menggunakan format:

```json
{
  "message": "...",
  "data": {}
}
```

### 4.2 Paginated Response

Untuk endpoint list dengan pagination:

```json
{
  "message": "...",
  "data": {
    "data": [],
    "meta": {
      "total": 0,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

Catatan: list kosong tetap `200`, bukan error.

### 4.3 Error Response

Semua error response:

```json
{
  "message": "..."
}
```

HTTP status yang digunakan: `400`, `401`, `403`, `404`, `500`.

## 5. Struktur Folder

```text
backend-api/
├─ env/
│  ├─ public-api.env.example
│  ├─ internal-api.env.example
│  └─ worker.env.example
├─ src/
│  ├─ config/
│  │  ├─ env.ts
│  │  └─ deployment.config.ts
│  ├─ core/
│  │  ├─ App.ts
│  │  ├─ errors/
│  │  │  └─ AppError.ts
│  │  ├─ http/
│  │  │  ├─ BaseController.ts
│  │  │  ├─ ExpressHttpServer.ts
│  │  │  ├─ FastifyHttpServer.ts
│  │  │  ├─ createHttpServer.ts
│  │  │  ├─ createMiddlewares.ts
│  │  │  ├─ response.ts
│  │  │  └─ types.ts
│  │  └─ middleware/
│  │     └─ errorHandler.ts
│  ├─ modules/
│  │  ├─ loadModules.ts
│  │  └─ projects/
│  │     ├─ projects.container.ts
│  │     ├─ projects.controller.ts
│  │     ├─ projects.interface.ts
│  │     ├─ projects.repository.ts
│  │     ├─ projects.routes.ts
│  │     ├─ projects.service.ts
│  │     └─ projects.validation.ts
│  ├─ shared/
│  │  └─ utils/
│  │     ├─ logger.ts
│  │     └─ tokens/jwt.ts
│  ├─ main.ts
│  └─ types.d.ts
├─ package.json
├─ tsconfig.json
└─ tsup.config.ts
```

## 6. Prinsip Layering

### 6.1 Controller

Tanggung jawab controller:
- Parsing request (`params`, `query`, `body`)
- Validasi dengan Zod
- Ekstraksi user ID dari token (`requireUserId`)
- Mapping response HTTP

Controller tidak boleh berisi business logic kompleks.

### 6.2 Service

Tanggung jawab service:
- Seluruh business logic
- Ownership guard (contoh: `requireProject(userId, projectId)`)
- Orkestrasi antar repository/service eksternal

### 6.3 Repository

Tanggung jawab repository:
- Query/read-write data
- Menjaga user scoping di level query (`where: { id, userId }` untuk implementasi DB)

### 6.4 Dependency Injection (DI)

Framework ini memakai `tsyringe` untuk menjaga komponen tetap loosely-coupled.

Alur DI:
1. Definisikan contract (interface) + token (`Symbol`) di `*.interface.ts`
2. Registrasikan implementasi ke container di `*.container.ts`
3. Inject dependency lewat constructor `@inject(...)`
4. Resolve instance dari container di `*.routes.ts`

Contoh pola pada module `projects`:

Token contract:

```ts
export const PROJECTS_REPOSITORY_TOKEN = Symbol('PROJECTS_REPOSITORY_TOKEN');
```

Registrasi implementasi:

```ts
container.registerSingleton(PROJECTS_REPOSITORY_TOKEN, ProjectsRepository);
```

Injection di service:

```ts
constructor(
  @inject(PROJECTS_REPOSITORY_TOKEN)
  private readonly repository: IProjectsRepository,
) {}
```

Resolve controller di routes:

```ts
const controller = container.resolve(ProjectsController);
```

Manfaat pola ini:
- Mock dependency lebih mudah saat unit test
- Implementasi repository bisa diganti (in-memory, Prisma, API eksternal) tanpa ubah service
- Batas tanggung jawab antar layer lebih jelas

## 7. Authentication & Authorization

- Auth menggunakan JWT Bearer token
- Token diparsing oleh HTTP adapter
- Payload JWT disuntik ke `ctx.auth`
- Controller memanggil `this.requireUserId(ctx)` sebelum akses resource user-scoped
- Service tetap wajib verifikasi ownership meskipun controller sudah validasi auth

## 8. Menjalankan Proyek

### 8.1 Prasyarat

- Node.js v20+
- pnpm

### 8.2 Instalasi

```bash
pnpm install
cp env/public-api.env.example .env
```

Alternatif target lain:

```bash
cp env/internal-api.env.example .env
cp env/worker.env.example .env
```

Pilih target deployment dan provider HTTP di `.env`:

```bash
DEPLOYMENT_TARGET=public-api
HTTP_SERVER=express # default
HTTP_SERVER=fastify
```

### 8.3 Menjalankan Mode Development

Script default saat ini:

```json
{
  "dev": "concurrently \"npm run dev:public\" \"npm run dev:internal\" \"npm run dev:worker\"",
  "dev:public": "DEPLOYMENT_TARGET=public-api tsx watch src/main.ts",
  "dev:internal": "DEPLOYMENT_TARGET=internal-api tsx watch src/main.ts",
  "dev:worker": "DEPLOYMENT_TARGET=worker tsx watch src/main.ts"
}
```

Menjalankan semua target sekaligus:

```bash
pnpm dev
```

Menjalankan target tertentu saja:

```bash
pnpm dev:public
pnpm dev:internal
pnpm dev:worker
```

### 8.4 Build dan Start

```bash
pnpm build
pnpm start
```

Catatan:
- `pnpm start` menjalankan hasil build (`dist/main.js`) dan target ditentukan oleh `DEPLOYMENT_TARGET` di environment.
- Kamu bebas mengubah/mengurangi target `public-api`, `internal-api`, `worker` di `src/config/deployment.config.ts` sesuai kebutuhan service.
- Script `dev`, `dev:public`, `dev:internal`, `dev:worker`, dan `start` di `package.json` juga bisa diatur ulang sesuai pola deploy tim (misal hanya 1-2 target saja).

### 8.5 Type Check

```bash
pnpm typecheck
```

### 8.6 Menjalankan Unit Test

```bash
pnpm test
```

## 9. Variabel Environment

Contoh minimum (`.env`):

```env
PORT=2001
HOST=0.0.0.0
DEPLOYMENT_TARGET=public-api
HTTP_SERVER=express
JWT_SECRET=replace-me
```

Penjelasan:
- `PORT`: port HTTP service
- `HOST`: host bind server
- `DEPLOYMENT_TARGET`: target microservice yang dijalankan (`public-api`, `internal-api`, `worker`)
- `HTTP_SERVER`: provider HTTP (`express` atau `fastify`)
- `JWT_SECRET`: secret verifikasi JWT
- `JWT_EXPIRES_IN`: masa berlaku access token internal (contoh `7d`)
- `DATABASE_URL`: koneksi database untuk Prisma (model auth: `User`, `GoogleAccount`)
- `GOOGLE_CLIENT_ID`: client ID OAuth Google yang dipakai validasi `idToken`

## 10. Endpoint Bawaan

### 10.1 Health Check

- `GET /v1/health`
- Response: status service dan uptime

### 10.2 Projects Module (Contoh)

- `GET /v1/projects` (auth)
- `POST /v1/projects` (auth)
- `GET /v1/projects/:projectId` (auth)
- `PATCH /v1/projects/:projectId` (auth)
- `DELETE /v1/projects/:projectId` (auth)

### 10.3 Auth Module

- `POST /v1/auth/google/login` (public) body: `{ "idToken": "..." }`
- `GET /v1/auth/me` (auth)
- `GET /v1/auth/admin/ping` (auth + role `admin`)
- Data login Google dipersist ke model Prisma `User` dan `GoogleAccount`

## 11. Menambah Modul Baru

Checklist minimum untuk modul baru:
1. Buat folder `src/modules/<module-name>/`
2. Tambahkan file:
   - `<module>.routes.ts`
   - `<module>.controller.ts`
   - `<module>.service.ts`
   - `<module>.interface.ts`
   - `<module>.validation.ts`
   - `<module>.repository.ts` (atau prisma repository)
   - `<module>.container.ts`
3. Daftarkan module loader di `src/config/deployment.config.ts`
4. Pastikan response format mengikuti kontrak
5. Pastikan ownership guard ada di service + repository

## 12. Error Handling

Gunakan `AppError` untuk error terkontrol:

```ts
throw new AppError(404, 'Project not found');
```

Error yang tidak dikenal akan otomatis menjadi `500` dengan pesan generik.

## 13. Standar Kode

- Gunakan bahasa Inggris untuk pesan API dan error
- Validasi payload/query wajib dengan Zod
- Hindari logika auth langsung di route handler
- Hindari logic bisnis di controller
- Jaga fungsi tetap kecil dan fokus
- Gunakan nama file konsisten per modul

## 14. Pengujian yang Direkomendasikan

Minimal test coverage yang disarankan:
- Unit test service (business rule + ownership rule)
- Unit test controller (validasi + mapping response)
- Integration test endpoint penting (auth, error, pagination)

Unit test yang sudah tersedia saat ini:
- `src/config/*.spec.ts`
- `src/core/**/*.spec.ts`
- `src/modules/loadModules.spec.ts`
- `src/modules/projects/*.spec.ts`
- `src/shared/utils/**/*.spec.ts`

## 15. Roadmap Pengembangan (Opsional)

Jika ingin setara lebih dekat ke aplikasi sumber, pertimbangkan:
- Tambah modul domain tambahan per deployment target
- Tambah Prisma repository implementasi
- Tambah queue worker
- Tambah request logging terstruktur (pino)
- Tambah OpenAPI generation
- Tambah CI pipeline (lint, test, typecheck, build)

## 16. Troubleshooting

- `401 Token not found`: header `Authorization` belum berformat `Bearer <token>`
- `401 Invalid token`: secret JWT tidak sesuai atau token expired
- `400 Invalid payload/query`: input tidak lolos schema Zod
- Server tidak jalan: cek `PORT`, `HOST`, dan konflik port

## 17. Lisensi

Belum ditentukan. Sesuaikan dengan kebijakan organisasi sebelum penggunaan produksi.
