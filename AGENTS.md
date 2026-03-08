# AGENTS Guide

Panduan ini berisi aturan implementasi untuk agent/contributor saat menambah atau mengubah fitur di repo ini.

## 1. Arsitektur dan Alur Request

Gunakan alur berikut secara konsisten:
1. Request masuk ke HTTP adapter (`ExpressHttpServer` atau `FastifyHttpServer`).
2. Route memanggil controller.
3. Controller melakukan parsing, validasi, dan ekstraksi auth.
4. Controller meneruskan ke service.
5. Service menjalankan business logic + ownership guard.
6. Service memanggil repository untuk akses data.
7. Response sukses selalu format `{ message, data }`.
8. Error diproses global error handler menjadi `{ message }`.

## 2. Kontrak Response API

### 2.1 Success

```json
{
  "message": "...",
  "data": {}
}
```

### 2.2 Paginated

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

List kosong tetap `200`.

### 2.3 Error

```json
{
  "message": "..."
}
```

Status error utama: `400`, `401`, `403`, `404`, `500`.

## 3. Prinsip Layering

### 3.1 Controller

Controller hanya untuk:
- Parsing request (`params`, `query`, `body`)
- Validasi Zod
- Ekstraksi user ID (`requireUserId`)
- Mapping response HTTP

Jangan taruh business logic kompleks di controller.

### 3.2 Service

Service adalah pusat business logic:
- Business rules
- Ownership guard
- Orkestrasi antar repository/service eksternal

### 3.3 Repository

Repository khusus data access:
- Query/read-write data
- Menjaga user scoping di query

## 4. Dependency Injection

Gunakan `tsyringe` untuk semua modul.

Pola wajib:
1. Definisikan interface + token `Symbol` di `*.interface.ts`.
2. Register implementasi di `*.container.ts`.
3. Inject dependency lewat constructor `@inject(...)`.
4. Resolve controller di `*.routes.ts`.

## 5. Auth dan RBAC

- Auth menggunakan JWT Bearer token.
- Payload JWT tersedia di `ctx.auth`.
- Route yang butuh login harus `requiresAuth: true`.
- Untuk role-based access, gunakan `requiredRoles` di route definition.
- Service tetap wajib verifikasi ownership meskipun auth sudah valid.
- Login Google menggunakan endpoint `POST /v1/auth/google/login` dan data user disimpan di Prisma model `User` + `GoogleAccount`.

## 6. Menambah Modul Baru

Checklist minimum:
1. Buat folder `src/modules/<module-name>/`.
2. Buat file:
   - `<module>.routes.ts`
   - `<module>.controller.ts`
   - `<module>.service.ts`
   - `<module>.interface.ts`
   - `<module>.validation.ts`
   - `<module>.repository.ts`
   - `<module>.container.ts`
3. Daftarkan module loader di `src/config/deployment.config.ts`.
4. Pastikan format response mengikuti kontrak.
5. Pastikan ownership guard ada di service/repository.

## 7. Standar Kode

- Gunakan bahasa Inggris untuk pesan API/error.
- Validasi payload/query wajib dengan Zod.
- Hindari logika auth langsung di route handler.
- Hindari business logic di controller.
- Buat fungsi kecil dan fokus.
- Gunakan penamaan file konsisten per modul.

## 8. Testing

Minimal yang harus dijaga:
- Unit test service (business rule + ownership rule)
- Unit test controller (validasi + mapping response)
- Integration test endpoint penting (auth, error, pagination)

Area test yang sudah ada:
- `src/config/*.spec.ts`
- `src/core/**/*.spec.ts`
- `src/modules/loadModules.spec.ts`
- `src/modules/projects/*.spec.ts`
- `src/shared/utils/**/*.spec.ts`

## 9. Struktur Folder (Referensi)

```text
backend-api/
├─ env/
├─ prisma/
├─ src/
│  ├─ config/
│  ├─ core/
│  ├─ modules/
│  ├─ shared/
│  ├─ main.ts
│  └─ types.d.ts
├─ package.json
├─ tsconfig.json
└─ tsup.config.ts
```
