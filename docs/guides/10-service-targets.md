---
title: Service Targets
---

# Edit or Add Service Targets

Nama service tidak wajib `public-api`, `internal-api`, atau `worker`.
Kamu bisa rename atau tambah target baru sesuai kebutuhan.

## Konsep Singkat

- `DEPLOYMENT_TARGET` menentukan service yang dijalankan.
- Mapping service -> file env ada di `src/config/envTargetRules.ts`.
- Daftar service + module + port ada di `src/config/deployment.config.ts`.

## Ubah Nama Service Existing

Contoh: ganti `public-api` menjadi `gateway`.

1. Ubah key target di `src/config/deployment.config.ts`.
2. Ubah `EnvTargetName` + `envFileMap` di `src/config/envTargetRules.ts`.
3. Rename file env:
   - dari `env/public-api.env` ke `env/gateway.env`
   - dari `env/public-api.env.example` ke `env/gateway.env.example`
4. Ubah script `package.json` yang set `DEPLOYMENT_TARGET`.
5. Update docs/openapi bila base service endpoint berubah.

### Contoh Siap Pakai: `public-api` -> `gateway`

1. Ubah target di `src/config/deployment.config.ts`:

```ts
export const deploymentTargets = defineDeploymentTargets({
  gateway: {
    port: 2001,
    modules: ['auth', 'projects'],
  },
  'internal-api': {
    port: 2002,
    modules: [],
  },
  worker: {
    port: 2020,
    modules: [],
  },
});
```

2. Ubah type + map env di `src/config/envTargetRules.ts`:

```ts
export type EnvTargetName = 'gateway' | 'internal-api' | 'worker';

export const envFileMap: Record<EnvTargetName, string> = {
  gateway: 'env/gateway.env',
  'internal-api': 'env/internal-api.env',
  worker: 'env/worker.env',
};
```

3. Rename file env:

```bash
mv env/public-api.env env/gateway.env
mv env/public-api.env.example env/gateway.env.example
```

4. Ubah script dev di `package.json`:

```json
{
  "scripts": {
    "dev:gateway": "DEPLOYMENT_TARGET=gateway tsx watch src/main.ts"
  }
}
```

5. Jalankan verifikasi:

```bash
pnpm typecheck
pnpm test
```

## Tambah Service Baru

Contoh: tambah service `billing-api`.

1. Tambah target di `src/config/deployment.config.ts`:
   - set `port`
   - set `modules` yang ingin dipakai
2. Tambah nama target di `EnvTargetName` pada `src/config/envTargetRules.ts`.
3. Tambah mapping file env di `envFileMap` pada file yang sama:
   - `billing-api` -> `env/billing-api.env`
4. Buat file env:
   - `env/billing-api.env`
   - `env/billing-api.env.example`
5. (Opsional) Tambah script dev di `package.json`:
   - `dev:billing`: `DEPLOYMENT_TARGET=billing-api tsx watch src/main.ts`
6. Jika service perlu modul baru, ikuti standar modul di `AGENTS.md`.

## Required Env Per Service

Validasi required env ditentukan di `envTargetRules` (`requiredVars`).
Jadi tiap service bisa punya requirement berbeda.

Contoh:

- `gateway` butuh `JWT_SECRET` dan `DATABASE_URL`
- `worker` tidak butuh `JWT_SECRET`

## Validasi Setelah Perubahan

Jalankan:

```bash
pnpm typecheck
pnpm test
```

Jika startup gagal, cek:

- nilai `DEPLOYMENT_TARGET`
- file env service tersedia
- required vars service sudah terisi
