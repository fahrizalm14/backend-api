import 'reflect-metadata';
import { container } from 'tsyringe';

import { resolveDeploymentTarget } from '@/config/deployment.config';
import { env } from '@/config/env';
import { App } from '@/core/App';
import { createGlobalMiddlewares } from '@/core/http/createMiddlewares';
import { createHttpServer } from '@/core/http/createHttpServer';
import { createRouteResponse } from '@/core/http/response';
import { loadConfiguredModules } from '@/modules/loadModules';
import { Logger } from '@/shared/utils/logger';

async function main() {
  const logger = container.resolve(Logger);
  const resolvedTarget = resolveDeploymentTarget(env.DEPLOYMENT_TARGET);
  const targetName = resolvedTarget.targetName;
  const target = resolvedTarget.target;

  logger.info(`Starting target: ${targetName}`);

  const port = process.env.PORT ? env.PORT : target.port;
  const server = createHttpServer(env.HTTP_SERVER, logger);
  const app = new App({
    server,
    logger,
    port,
    host: env.HOST,
  });

  for (const middleware of createGlobalMiddlewares()) {
    app.registerMiddleware(middleware);
  }

  app.registerModule({
    prefix: '',
    routes: [
      {
        method: 'GET',
        path: '/v1/health',
        handler: async () =>
          createRouteResponse({
            message: 'Service is healthy',
            data: {
              uptime: process.uptime(),
            },
          }),
      },
    ],
  });

  const modules = await loadConfiguredModules(targetName, logger);
  modules.forEach((mod) => app.registerModule(mod));

  await app.start();
}

main().catch((error) => {
  console.error('Failed to start application', error);
  process.exit(1);
});
