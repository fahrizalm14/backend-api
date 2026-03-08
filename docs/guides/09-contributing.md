---
title: Contributing
---

# Contributing

Panduan singkat kontribusi untuk menjaga konsistensi arsitektur dan kualitas kode.

## Workflow

1. Buat branch fitur dari `main`.
2. Implementasi perubahan mengikuti layering `route -> controller -> service -> repository`.
3. Pastikan kontrak response API tetap konsisten:
   - success: `{ message, data }`
   - error: `{ message }`
4. Jalankan quality check sebelum commit:
   - `pnpm typecheck`
   - `pnpm lint`
   - `pnpm format:check`
   - `pnpm test`
5. Buat pull request dengan deskripsi perubahan, dampak, dan cara uji.

## Coding Rules

- Gunakan Zod untuk validasi request.
- Hindari business logic di controller.
- Service menangani business rule dan ownership guard.
- Repository fokus ke data access.
- Gunakan Dependency Injection `tsyringe` (`*.interface.ts`, `*.container.ts`, `@inject`).

## Auth and Security

- Route private wajib `requiresAuth: true`.
- RBAC gunakan `requiredRoles` pada definisi route.
- Tetap lakukan verifikasi ownership di service/repository.

## Module Checklist

Saat menambah module baru di `src/modules/<module-name>/`, minimal sediakan:

- `<module>.routes.ts`
- `<module>.controller.ts`
- `<module>.service.ts`
- `<module>.interface.ts`
- `<module>.validation.ts`
- `<module>.repository.ts`
- `<module>.container.ts`

Lalu daftarkan module di `src/config/deployment.config.ts`.
