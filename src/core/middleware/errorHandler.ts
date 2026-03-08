import type { ErrorRequestHandler } from 'express';
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

import { AppError } from '@/core/errors/AppError';
import { Logger } from '@/shared/utils/logger';

const INTERNAL_ERROR_MESSAGE = 'An unexpected internal server error occurred.';

export const createExpressErrorHandler =
  (logger: Logger): ErrorRequestHandler =>
  (err, _req, res, _next) => {
    if (err instanceof AppError) {
      logger.error(`[API Error] ${err.statusCode} - ${err.message}`, err);
      res.status(err.statusCode).json({ message: err.message });
      return;
    }

    const error = err instanceof Error ? err : new Error('Unknown error');
    logger.error('Unexpected error', error);
    res.status(500).json({ message: INTERNAL_ERROR_MESSAGE });
  };

export const createFastifyErrorHandler =
  (logger: Logger) =>
  (error: FastifyError, _request: FastifyRequest, reply: FastifyReply): void => {
    if (error instanceof AppError) {
      logger.error(`[API Error] ${error.statusCode} - ${error.message}`, error);
      void reply.status(error.statusCode).send({ message: error.message });
      return;
    }

    logger.error('Unexpected error', error);
    void reply.status(500).send({ message: INTERNAL_ERROR_MESSAGE });
  };
