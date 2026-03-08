import { strict as assert } from 'node:assert';
import test from 'node:test';

import { createRouteResponse } from './response';

test('createRouteResponse menghasilkan body FE-compatible', () => {
  const result = createRouteResponse({
    message: 'OK',
    data: { id: '1' },
  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, {
    message: 'OK',
    data: { id: '1' },
  });
});

test('createRouteResponse memakai statusCode custom', () => {
  const result = createRouteResponse({
    message: 'Created',
    data: { id: '2' },
    statusCode: 201,
  });

  assert.equal(result.status, 201);
});
