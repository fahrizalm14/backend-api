import { strict as assert } from 'node:assert';
import test from 'node:test';

import { createGlobalMiddlewares } from './createMiddlewares';

test('createGlobalMiddlewares menyediakan middleware express dan fastify', () => {
  const middlewares = createGlobalMiddlewares();

  assert.equal(middlewares.length, 1);
  assert.equal(typeof middlewares[0].express, 'function');
  assert.equal(typeof middlewares[0].fastify, 'function');
});
