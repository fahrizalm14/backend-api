---
title: Middleware Guide
---

# Middleware Guide

Middleware didukung di 3 level: global, module, dan endpoint.

## Global Middleware

Daftarkan di `src/core/http/createMiddlewares.ts`.

- Berlaku untuk semua module dan route.
- Cocok untuk CORS, security header, request tracing global.

## Module Middleware

Didaftarkan pada `ModuleBuildResult.middlewares` di `*.routes.ts` module.

- Berlaku untuk seluruh route dalam 1 module.
- Cocok untuk guard/policy khusus domain module.

## Endpoint Middleware

Didaftarkan pada `RouteDefinition.middlewares`.

- `expressRoute`: middleware route level untuk Express
- `fastifyRoute`: middleware route level untuk Fastify

## Contoh Endpoint Middleware

```ts
{
  method: 'GET',
  path: '/me',
  middlewares: [
    {
      expressRoute: (_req, _res, next) => next(),
      fastifyRoute: async (_request, _reply) => {},
    },
  ],
  handler: async (ctx) => controller.me(ctx),
}
```
