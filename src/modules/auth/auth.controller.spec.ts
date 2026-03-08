import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import test from 'node:test';

import { AppError } from '@/core/errors/AppError';
import { RouteContext } from '@/core/http/types';
import { AuthController } from '@/modules/auth/auth.controller';

function buildContext(partial: Partial<RouteContext>): RouteContext {
  return {
    framework: 'express',
    params: {},
    query: {},
    body: {},
    auth: { sub: 'u1' },
    raw: {
      headers: {},
      ip: '127.0.0.1',
    } as RouteContext['raw'],
    reply: {} as RouteContext['reply'],
    ...partial,
  } as RouteContext;
}

test('AuthController.login sets refresh token cookie header', async () => {
  const service = {
    loginManual: async () => ({
      auth: {
        accessToken: 'access-token',
        tokenType: 'Bearer' as const,
        expiresIn: '15m',
        user: {
          id: 'u1',
          email: 'user@mail.com',
          role: 'member' as const,
          name: 'User',
          avatarUrl: null,
        },
      },
      refreshToken: 'refresh-token',
    }),
  };

  const controller = new AuthController(service as never);
  const result = await controller.login(
    buildContext({
      body: { email: 'user@mail.com', password: 'password123' },
    }),
  );

  assert.equal(result.status, 200);
  assert.equal(typeof result.headers?.['Set-Cookie'], 'string');
});

test('AuthController.refresh throws 401 when refresh cookie is missing', async () => {
  const service = {
    refreshSession: async () => ({
      auth: {
        accessToken: 'access-token',
        tokenType: 'Bearer' as const,
        expiresIn: '15m',
        user: {
          id: 'u1',
          email: 'user@mail.com',
          role: 'member' as const,
          name: 'User',
          avatarUrl: null,
        },
      },
      refreshToken: 'refresh-token',
    }),
  };

  const controller = new AuthController(service as never);

  await assert.rejects(
    () => controller.refresh(buildContext({})),
    (error: unknown) =>
      error instanceof AppError &&
      error.statusCode === 401 &&
      error.message === 'Refresh token not found',
  );
});
