import cors from 'cors';

import { env } from '@/config/env';
import { GlobalMiddleware } from '@/core/http/types';
import { registerFastifyCors } from '@/core/http/FastifyHttpServer';

export function createGlobalMiddlewares(): GlobalMiddleware[] {
  const allowedOrigins = env.CORS_ALLOWED_ORIGINS;
  const expressOrigin: cors.CorsOptions['origin'] =
    allowedOrigins.length === 0
      ? true
      : (requestOrigin, callback) => {
          callback(null, !requestOrigin || allowedOrigins.includes(requestOrigin));
        };

  return [
    {
      express: cors({ origin: expressOrigin }),
      fastify: (instance) => registerFastifyCors(instance, allowedOrigins),
    },
  ];
}
