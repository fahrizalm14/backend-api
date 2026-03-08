import { ExpressHttpServer } from '@/core/http/ExpressHttpServer';
import { FastifyHttpServer } from '@/core/http/FastifyHttpServer';
import { HttpServer } from '@/core/http/types';
import {
  createExpressErrorHandler,
  createFastifyErrorHandler,
} from '@/core/middleware/errorHandler';
import { Logger } from '@/shared/utils/logger';

export function createHttpServer(
  provider: 'express' | 'fastify',
  logger: Logger,
): HttpServer {
  if (provider === 'fastify') {
    const server = new FastifyHttpServer(logger);
    server.setErrorHandler(createFastifyErrorHandler(logger));
    return server;
  }

  const server = new ExpressHttpServer(logger);
  server.setErrorHandler(createExpressErrorHandler(logger));
  return server;
}
