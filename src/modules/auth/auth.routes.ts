import { container } from 'tsyringe';

import { createRateLimitMiddleware } from '@/core/http/rateLimit';
import { ModuleBuildResult, RouteDefinition } from '@/core/http/types';
import { AuthController } from '@/modules/auth/auth.controller';
import '@/modules/auth/auth.container';

const controller = container.resolve(AuthController);
const authPublicRateLimit = createRateLimitMiddleware({
  keyPrefix: 'auth-public',
  windowMs: 60_000,
  maxRequests: 10,
  message: 'Too many authentication attempts, please try again later.',
});

const routes: RouteDefinition[] = [
  {
    method: 'POST',
    path: '/register',
    middlewares: [authPublicRateLimit],
    handler: async (ctx) => controller.register(ctx),
  },
  {
    method: 'POST',
    path: '/login',
    middlewares: [authPublicRateLimit],
    handler: async (ctx) => controller.login(ctx),
  },
  {
    method: 'POST',
    path: '/google/login',
    middlewares: [authPublicRateLimit],
    handler: async (ctx) => controller.googleLogin(ctx),
  },
  {
    method: 'POST',
    path: '/refresh',
    middlewares: [authPublicRateLimit],
    handler: async (ctx) => controller.refresh(ctx),
  },
  {
    method: 'POST',
    path: '/logout',
    handler: async (ctx) => controller.logout(ctx),
  },
  {
    method: 'POST',
    path: '/logout-all',
    requiresAuth: true,
    handler: async (ctx) => controller.logoutAll(ctx),
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
