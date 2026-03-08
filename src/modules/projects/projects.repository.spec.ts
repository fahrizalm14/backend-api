import { strict as assert } from 'node:assert';
import test from 'node:test';

import { ProjectsRepository } from './projects.repository';

test('ProjectsRepository create + listByUser hanya mengembalikan data milik user', async () => {
  const repository = new ProjectsRepository();

  await repository.create('u1', { name: 'Project 1' });
  await repository.create('u2', { name: 'Project 2' });

  const result = await repository.listByUser('u1', { page: 1, limit: 10 });
  assert.equal(result.data.length, 1);
  assert.equal(result.data[0].userId, 'u1');
});

test('ProjectsRepository update mengembalikan null bila project tidak ditemukan', async () => {
  const repository = new ProjectsRepository();

  const result = await repository.update('u1', 'missing', { name: 'Updated' });
  assert.equal(result, null);
});

test('ProjectsRepository delete menghapus project milik user yang sesuai', async () => {
  const repository = new ProjectsRepository();

  const created = await repository.create('u1', { name: 'Project Delete' });
  const deleted = await repository.delete('u1', created.id);

  assert.equal(deleted, true);

  const result = await repository.listByUser('u1', { page: 1, limit: 10 });
  assert.equal(result.data.length, 0);
});
