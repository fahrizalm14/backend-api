import { strict as assert } from 'node:assert';
import test from 'node:test';

import { AppError } from '../errors/AppError';
import { BaseController } from './BaseController';
import { RouteContext } from './types';

class TestController extends BaseController {
  exposeOk() {
    return this.ok({ ok: true }, 'Success');
  }

  exposeCreated() {
    return this.created({ created: true }, 'Created');
  }

  exposeRequireUserId(ctx: RouteContext) {
    return this.requireUserId(ctx);
  }
}

const buildContext = (auth?: RouteContext['auth']): RouteContext =>
  ({
    framework: 'express',
    params: {},
    query: {},
    body: {},
    auth,
    raw: {} as RouteContext['raw'],
    reply: {} as RouteContext['reply'],
  }) as RouteContext;

test('BaseController.ok mengembalikan status 200', () => {
  const controller = new TestController();
  const result = controller.exposeOk();

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { message: 'Success', data: { ok: true } });
});

test('BaseController.created mengembalikan status 201', () => {
  const controller = new TestController();
  const result = controller.exposeCreated();

  assert.equal(result.status, 201);
  assert.deepEqual(result.body, {
    message: 'Created',
    data: { created: true },
  });
});

test('BaseController.requireUserId melempar 401 bila auth invalid', () => {
  const controller = new TestController();

  assert.throws(
    () => controller.exposeRequireUserId(buildContext(undefined)),
    (error: unknown) =>
      error instanceof AppError &&
      error.statusCode === 401 &&
      error.message === 'Invalid or expired token',
  );
});
