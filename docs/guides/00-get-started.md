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
cp env/public-api.env.example .env
pnpm dev:public
```

## 5. Quality Check

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
```
