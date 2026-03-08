import { strict as assert } from 'node:assert';
import test from 'node:test';

import { AppError } from '../../core/errors/AppError';
import {
  CreateProjectDto,
  IProjectsRepository,
  UpdateProjectDto,
} from './projects.interface';
import { ProjectsService } from './projects.service';

function createServiceWithRepository(repository: IProjectsRepository) {
  return new ProjectsService(repository);
}

test('ProjectsService.listProjects memanggil repository dengan pagination', async () => {
  const repository: IProjectsRepository = {
    listByUser: async () => ({
      data: [],
      meta: { total: 0, page: 2, limit: 5, totalPages: 1 },
    }),
    create: async (_userId: string, payload: CreateProjectDto) => ({
      id: 'p1',
      userId: 'u1',
      name: payload.name,
      description: payload.description ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    findById: async () => null,
    update: async () => null,
    delete: async () => false,
  };

  let captured: { userId: string; page: number; limit: number } = {
    userId: '',
    page: 0,
    limit: 0,
  };
  repository.listByUser = async (userId, pagination) => {
    captured = { userId, page: pagination.page, limit: pagination.limit };
    return {
      data: [],
      meta: { total: 0, page: pagination.page, limit: pagination.limit, totalPages: 1 },
    };
  };

  const service = createServiceWithRepository(repository);
  const result = await service.listProjects('u1', 2, 5);

  assert.equal(captured.userId, 'u1');
  assert.equal(captured.page, 2);
  assert.equal(captured.limit, 5);
  assert.equal(result.meta.page, 2);
});

test('ProjectsService.getProject melempar 404 saat project tidak ditemukan', async () => {
  const repository: IProjectsRepository = {
    listByUser: async () => ({
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
    }),
    create: async () => {
      throw new Error('not used');
    },
    findById: async () => null,
    update: async () => null,
    delete: async () => false,
  };

  const service = createServiceWithRepository(repository);

  await assert.rejects(
    () => service.getProject('u1', 'p404'),
    (error: unknown) =>
      error instanceof AppError &&
      error.statusCode === 404 &&
      error.message === 'Project not found',
  );
});

test('ProjectsService.updateProject mengembalikan project saat valid', async () => {
  const updatedPayload: UpdateProjectDto = { name: 'Nama Baru' };

  const repository: IProjectsRepository = {
    listByUser: async () => ({
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
    }),
    create: async () => {
      throw new Error('not used');
    },
    findById: async () => ({
      id: 'p1',
      userId: 'u1',
      name: 'Lama',
      description: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    update: async (_userId, _projectId, payload) => ({
      id: 'p1',
      userId: 'u1',
      name: payload.name ?? 'Lama',
      description: payload.description ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    delete: async () => false,
  };

  const service = createServiceWithRepository(repository);
  const result = await service.updateProject('u1', 'p1', updatedPayload);

  assert.equal(result.name, 'Nama Baru');
});
