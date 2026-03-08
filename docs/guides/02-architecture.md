---
title: Architecture
---

# Architecture

## Request Flow

1. Request masuk melalui adapter (`ExpressHttpServer` / `FastifyHttpServer`).
2. Route module memanggil controller.
3. Controller validasi input dan ekstraksi auth context.
4. Service menjalankan business logic.
5. Repository menjalankan akses data.
6. Error ditangani oleh global error handler.

## Layer Responsibilities

### Controller

- Parsing request (`params`, `query`, `body`)
- Validasi input (Zod)
- Mapping response

### Service

- Business rules
- Ownership validation
- Orkestrasi antar dependency

### Repository

- Data access
- Query dengan scope user bila perlu

## Dependency Injection

Pattern standar:

1. Definisikan interface/token di `*.interface.ts`
2. Register implementation di `*.container.ts`
3. Inject via constructor
4. Resolve di `*.routes.ts`

## Error Contract

- Success: `{ message, data }`
- Error: `{ message }`

Status code utama: `400`, `401`, `403`, `404`, `500`.
