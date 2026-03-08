import { container } from 'tsyringe';

import { ModuleBuildResult, RouteDefinition } from '@/core/http/types';
import { ProjectsController } from '@/modules/projects/projects.controller';
import '@/modules/projects/projects.container';

const controller = container.resolve(ProjectsController);

const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/',
    requiresAuth: true,
    handler: async (ctx) => controller.list(ctx),
  },
  {
    method: 'POST',
    path: '/',
    requiresAuth: true,
    handler: async (ctx) => controller.create(ctx),
  },
  {
    method: 'GET',
    path: '/:projectId',
    requiresAuth: true,
    handler: async (ctx) => controller.detail(ctx),
  },
  {
    method: 'PATCH',
    path: '/:projectId',
    requiresAuth: true,
    handler: async (ctx) => controller.update(ctx),
  },
  {
    method: 'DELETE',
    path: '/:projectId',
    requiresAuth: true,
    handler: async (ctx) => controller.remove(ctx),
  },
];

export default function createProjectsModule(): ModuleBuildResult {
  return { routes };
}
