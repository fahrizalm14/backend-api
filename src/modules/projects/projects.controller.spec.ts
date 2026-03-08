import { strict as assert } from 'node:assert';
import test from 'node:test';

import { AppError } from '../../core/errors/AppError';
import { RouteContext } from '../../core/http/types';
import { ProjectsController } from './projects.controller';

function buildContext(partial: Partial<RouteContext>): RouteContext {
  return {
    framework: 'express',
    params: {},
    query: {},
    body: {},
    auth: { sub: 'u1' },
    raw: {} as RouteContext['raw'],
    reply: {} as RouteContext['reply'],
    ...partial,
  } as RouteContext;
}

test('ProjectsController.list mengembalikan response FE-compatible', async () => {
  const service = {
    listProjects: async () => ({
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
    }),
  };

  const controller = new ProjectsController(service as never);
  const result = await controller.list(buildContext({ query: { page: '1', limit: '10' } }));

  const body = result.body as { message: string; data: { data: unknown[] } };
  assert.equal(result.status, 200);
  assert.equal(body.message, 'Projects retrieved successfully');
  assert.deepEqual(body.data.data, []);
});

test('ProjectsController.create melempar 400 saat payload tidak valid', async () => {
  const service = {
    createProject: async () => ({ id: 'p1' }),
  };

  const controller = new ProjectsController(service as never);

  await assert.rejects(
    () => controller.create(buildContext({ body: { description: 'tanpa nama' } })),
    (error: unknown) => error instanceof AppError && error.statusCode === 400,
  );
});

test('ProjectsController.detail melempar 401 saat token tidak ada', async () => {
  const service = {
    getProject: async () => ({ id: 'p1' }),
  };

  const controller = new ProjectsController(service as never);

  await assert.rejects(
    () =>
      controller.detail(
        buildContext({
          auth: undefined,
          params: { projectId: 'p1' },
        }),
      ),
    (error: unknown) =>
      error instanceof AppError &&
      error.statusCode === 401 &&
      error.message === 'Invalid or expired token',
  );
});
