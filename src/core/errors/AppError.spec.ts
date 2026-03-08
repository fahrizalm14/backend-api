import { strict as assert } from 'node:assert';
import test from 'node:test';

import { AppError } from './AppError';

test('AppError menyimpan statusCode dan message', () => {
  const error = new AppError(404, 'Not found');

  assert.equal(error.name, 'AppError');
  assert.equal(error.statusCode, 404);
  assert.equal(error.message, 'Not found');
});
