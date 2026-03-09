---
title: Get Started
---

# Get Started

Panduan cepat untuk menjalankan backend.

## 1. Clone Repository

```bash
git clone https://github.com/fahrizalm14/backend-api.git
cd backend-api
```

## 2. Prasyarat

- Node.js 20+
- pnpm 9+

## 3. Install Dependency

```bash
pnpm install
```

## 4. Jalankan Backend

```bash
cp env/public-api.env.example env/public-api.env
pnpm dev:public
```

Catatan:

- Development/Test membaca env dari file service di folder `env/`.
- Production membaca env dari root `.env`.

## 5. Quality Check

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
```
