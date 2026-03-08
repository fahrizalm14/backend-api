import { strict as assert } from 'node:assert';
import test from 'node:test';

import jwt from 'jsonwebtoken';

import { env } from '../../../config/env';
import { extractBearerToken, verifyJwt } from './jwt';

test('extractBearerToken mengembalikan token saat format valid', () => {
  const token = extractBearerToken('Bearer abc.def.ghi');
  assert.equal(token, 'abc.def.ghi');
});

test('extractBearerToken mengembalikan null saat format invalid', () => {
  assert.equal(extractBearerToken('Basic xxx'), null);
  assert.equal(extractBearerToken(undefined), null);
});

test('verifyJwt memverifikasi token valid', () => {
  const token = jwt.sign({ sub: 'u1', role: 'user' }, env.JWT_SECRET);
  const payload = verifyJwt(token);

  assert.equal(payload.sub, 'u1');
});
