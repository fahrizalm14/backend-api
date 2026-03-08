import { strict as assert } from 'node:assert';
import test from 'node:test';

import {
  createProjectSchema,
  listProjectsQuerySchema,
  updateProjectSchema,
} from './projects.validation';

test('createProjectSchema valid untuk payload minimal', () => {
  const result = createProjectSchema.safeParse({ name: 'Project A' });
  assert.equal(result.success, true);
});

test('updateProjectSchema invalid jika tidak ada field update', () => {
  const result = updateProjectSchema.safeParse({});
  assert.equal(result.success, false);
});

test('listProjectsQuerySchema coercion berjalan untuk query string', () => {
  const result = listProjectsQuerySchema.parse({ page: '2', limit: '5' });
  assert.equal(result.page, 2);
  assert.equal(result.limit, 5);
});
