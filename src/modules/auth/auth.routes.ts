import { container } from 'tsyringe';

import { ModuleBuildResult, RouteDefinition } from '@/core/http/types';
import { AuthController } from '@/modules/auth/auth.controller';
import '@/modules/auth/auth.container';

const controller = container.resolve(AuthController);

const routes: RouteDefinition[] = [
  {
    method: 'POST',
    path: '/google/login',
    handler: async (ctx) => controller.googleLogin(ctx),
  },
  {
    method: 'GET',
    path: '/me',
    requiresAuth: true,
    handler: async (ctx) => controller.me(ctx),
  },
  {
    method: 'GET',
    path: '/admin/ping',
    requiresAuth: true,
    requiredRoles: ['admin'],
    handler: async () => controller.adminPing(),
  },
];

export default function createAuthModule(): ModuleBuildResult {
  return { routes };
}
