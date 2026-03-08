import { strict as assert } from 'node:assert';
import test from 'node:test';

import { env } from './env';

test('env memiliki default dan shape valid', () => {
  assert.ok(Number.isFinite(env.PORT));
  assert.ok(env.PORT > 0);
  assert.equal(typeof env.HOST, 'string');
  assert.equal(typeof env.DEPLOYMENT_TARGET, 'string');
  assert.ok(env.HTTP_SERVER === 'express' || env.HTTP_SERVER === 'fastify');
  assert.equal(typeof env.JWT_SECRET, 'string');
});
