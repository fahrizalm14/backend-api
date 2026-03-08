import fastifyCors from '@fastify/cors';
import Fastify, {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from 'fastify';

import { AppError } from '@/core/errors/AppError';
import {
  GlobalMiddleware,
  HttpServer,
  ModuleDefinition,
  RouteDefinition,
} from '@/core/http/types';
import { extractBearerToken, verifyJwt } from '@/shared/utils/tokens/jwt';
import { Logger } from '@/shared/utils/logger';
import { isAppRole } from '@/shared/auth/roles';

export class FastifyHttpServer implements HttpServer {
  private readonly app: FastifyInstance;
  private readonly modules: ModuleDefinition[] = [];
  private readonly globalMiddlewares: GlobalMiddleware['fastify'][] = [];

  constructor(private readonly logger: Logger) {
    this.app = Fastify({ logger: false });
  }

  register(module: ModuleDefinition): void {
    this.modules.push(module);
  }

  registerGlobalMiddleware(middleware: GlobalMiddleware): void {
    if (middleware.fastify) {
      this.globalMiddlewares.push(middleware.fastify);
    }
  }

  setErrorHandler(handler: unknown): void {
    if (typeof handler === 'function') {
      this.app.setErrorHandler(handler as (error: FastifyError) => void);
    }
  }

  private buildRouteHandler(route: RouteDefinition) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const auth = route.requiresAuth
        ? this.resolveAuthorization(request.headers.authorization)
        : undefined;
      if (route.requiredRoles?.length) {
        const role = auth?.role;
        if (!isAppRole(role) || !route.requiredRoles.includes(role)) {
          throw new AppError(403, 'Forbidden');
        }
      }

      const result = await route.handler({
        framework: 'fastify',
        params: request.params as Record<string, string>,
        query: request.query as Record<string, unknown>,
        body: request.body,
        auth,
        raw: request,
        reply,
      });

      if (result?.raw) {
        return;
      }

      if (result?.headers) {
        for (const [header, value] of Object.entries(result.headers)) {
          reply.header(header, value);
        }
      }

      if (result?.body === undefined) {
        void reply.status(result?.status ?? 200).send();
        return;
      }

      void reply.status(result?.status ?? 200).send(result.body);
    };
  }

  private registerRoute(instance: FastifyInstance, route: RouteDefinition): void {
    instance.route({
      method: route.method,
      url: route.path,
      handler: this.buildRouteHandler(route),
    });
  }

  private mountModule(module: ModuleDefinition): void {
    this.app.register(
      async (instance) => {
        for (const route of module.routes) {
          this.registerRoute(instance, route);
        }
      },
      { prefix: module.prefix },
    );

    this.logger.info(`Module loaded at ${module.prefix}`);
  }

  async start(port: number, host: string): Promise<void> {
    for (const middleware of this.globalMiddlewares) {
      await middleware(this.app);
    }

    for (const module of this.modules) {
      this.mountModule(module);
    }

    await this.app.ready();
    await this.app.listen({ port, host });
    this.logger.info(`Server listening on http://${host}:${port}`);
  }

  async stop(): Promise<void> {
    await this.app.close();
  }

  private resolveAuthorization(header?: string | string[]) {
    const raw = Array.isArray(header) ? header[0] : header;
    const token = extractBearerToken(raw);
    if (!token) {
      throw new AppError(401, 'Token not found');
    }

    try {
      return verifyJwt(token);
    } catch {
      throw new AppError(401, 'Invalid token');
    }
  }
}

export async function registerFastifyCors(
  instance: FastifyInstance,
  allowedOrigins: string[] = [],
) {
  const origin =
    allowedOrigins.length === 0
      ? true
      : (
          requestOrigin: string | undefined,
          cb: (error: Error | null, allow: boolean) => void,
        ) => {
          cb(null, !requestOrigin || allowedOrigins.includes(requestOrigin));
        };
  await instance.register(fastifyCors, { origin });
}
