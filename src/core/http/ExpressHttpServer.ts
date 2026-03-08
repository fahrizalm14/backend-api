import express, { ErrorRequestHandler, RequestHandler } from 'express';
import type http from 'http';

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

export class ExpressHttpServer implements HttpServer {
  private readonly app = express();
  private readonly modules: ModuleDefinition[] = [];
  private readonly globalMiddlewares: RequestHandler[] = [];
  private readonly errorHandlers: ErrorRequestHandler[] = [];
  private server?: http.Server;

  constructor(private readonly logger: Logger) {
    this.app.disable('x-powered-by');
    this.app.use(express.json({ limit: '1mb' }));
  }

  register(module: ModuleDefinition): void {
    this.modules.push(module);
  }

  registerGlobalMiddleware(middleware: GlobalMiddleware): void {
    if (middleware.express) {
      this.globalMiddlewares.push(middleware.express);
    }
  }

  setErrorHandler(handler: unknown): void {
    if (typeof handler === 'function') {
      this.errorHandlers.push(handler as ErrorRequestHandler);
    }
  }

  private registerRoute(router: express.Router, route: RouteDefinition): void {
    const method = route.method.toLowerCase() as keyof express.Router;

    const wrapped: RequestHandler = async (req, res, next) => {
      try {
        const auth = route.requiresAuth
          ? this.resolveAuthorization(req.headers.authorization)
          : undefined;
        if (route.requiredRoles?.length) {
          const role = auth?.role;
          if (!isAppRole(role) || !route.requiredRoles.includes(role)) {
            throw new AppError(403, 'Forbidden');
          }
        }

        const result = await route.handler({
          framework: 'express',
          params: Object.fromEntries(
            Object.entries(req.params).map(([key, value]) => [
              key,
              Array.isArray(value) ? value[0] : value,
            ]),
          ) as Record<string, string>,
          query: req.query as Record<string, unknown>,
          body: req.body,
          auth,
          raw: req,
          reply: res,
        });

        if (result?.raw) {
          return;
        }

        if (result?.headers) {
          for (const [header, value] of Object.entries(result.headers)) {
            res.setHeader(header, value);
          }
        }

        if (result?.body === undefined) {
          res.sendStatus(result?.status ?? 200);
          return;
        }

        res.status(result?.status ?? 200).json(result.body);
      } catch (error) {
        next(error);
      }
    };

    const routeMiddlewares = (route.middlewares ?? [])
      .map((middleware) => middleware.expressRoute ?? middleware.express)
      .filter((middleware): middleware is RequestHandler => Boolean(middleware));

    (router[method] as (path: string, ...handlers: RequestHandler[]) => void)(
      route.path,
      ...routeMiddlewares,
      wrapped,
    );
  }

  private mountModule(module: ModuleDefinition): void {
    const router = express.Router();
    if (module.middlewares?.length) {
      for (const middleware of module.middlewares) {
        if (middleware.express) {
          router.use(middleware.express);
        }
      }
    }
    for (const route of module.routes) {
      this.registerRoute(router, route);
    }
    this.app.use(module.prefix, router);
    this.logger.info(`Module loaded at ${module.prefix}`);
  }

  async start(port: number, host: string): Promise<void> {
    for (const middleware of this.globalMiddlewares) {
      this.app.use(middleware);
    }

    for (const module of this.modules) {
      this.mountModule(module);
    }

    for (const handler of this.errorHandlers) {
      this.app.use(handler);
    }

    await new Promise<void>((resolve) => {
      this.server = this.app.listen(port, host, () => resolve());
    });

    this.logger.info(`Server listening on http://${host}:${port}`);
  }

  async stop(): Promise<void> {
    if (!this.server) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      this.server?.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
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
