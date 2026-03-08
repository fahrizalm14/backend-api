---
title: Overview
slug: /
---

# Backend API Overview

Repository ini adalah template backend API berbasis TypeScript dengan arsitektur modular, DI (`tsyringe`), dan dukungan multi deployment target.

## Tujuan

- Menjaga kontrak API yang konsisten untuk frontend.
- Memisahkan tanggung jawab per layer (controller, service, repository).
- Menyediakan baseline auth (manual + Google), RBAC, dan struktur microservice sederhana.

## Deployment Targets

Target didefinisikan di `src/config/deployment.config.ts`:

- `public-api`: modul `auth` dan `projects`
- `internal-api`: placeholder internal
- `worker`: placeholder worker/health

Setiap target dapat dijalankan sebagai proses terpisah via `DEPLOYMENT_TARGET`.

## HTTP Provider

Provider HTTP dapat dipilih via environment:

- `express` (default)
- `fastify`

Factory server ada di `src/core/http/createHttpServer.ts`.
