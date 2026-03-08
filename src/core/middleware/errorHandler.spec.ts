import { strict as assert } from 'node:assert';
import test from 'node:test';

import { AppError } from '../errors/AppError';
import { createExpressErrorHandler, createFastifyErrorHandler } from './errorHandler';

const logger = {
  info() {},
  error() {},
};

test('createExpressErrorHandler mengembalikan status AppError yang sesuai', () => {
  const handler = createExpressErrorHandler(logger as never);

  let statusCode = 0;
  let payload: unknown;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(body: unknown) {
      payload = body;
      return this;
    },
  };

  handler(new AppError(404, 'Project not found'), {} as never, res as never, () => {});

  assert.equal(statusCode, 404);
  assert.deepEqual(payload, { message: 'Project not found' });
});

test('createExpressErrorHandler memetakan unknown error ke 500', () => {
  const handler = createExpressErrorHandler(logger as never);

  let statusCode = 0;
  let payload: unknown;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(body: unknown) {
      payload = body;
      return this;
    },
  };

  handler(new Error('boom'), {} as never, res as never, () => {});

  assert.equal(statusCode, 500);
  assert.deepEqual(payload, {
    message: 'An unexpected internal server error occurred.',
  });
});

test('createFastifyErrorHandler mengembalikan status AppError yang sesuai', () => {
  const handler = createFastifyErrorHandler(logger as never);

  let statusCode = 0;
  let payload: unknown;
  const reply = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    send(body: unknown) {
      payload = body;
      return this;
    },
  };

  handler(new AppError(401, 'Invalid token') as never, {} as never, reply as never);

  assert.equal(statusCode, 401);
  assert.deepEqual(payload, { message: 'Invalid token' });
});
