import cors from 'cors';

import { GlobalMiddleware } from '@/core/http/types';
import { registerFastifyCors } from '@/core/http/FastifyHttpServer';

export function createGlobalMiddlewares(): GlobalMiddleware[] {
  return [
    {
      express: cors({ origin: true }),
      fastify: registerFastifyCors,
    },
  ];
}
