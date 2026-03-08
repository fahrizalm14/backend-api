import { strict as assert } from 'node:assert';
import test from 'node:test';

import { ExpressHttpServer } from './ExpressHttpServer';
import { FastifyHttpServer } from './FastifyHttpServer';
import { createHttpServer } from './createHttpServer';
import { Logger } from '../../shared/utils/logger';

test('createHttpServer mengembalikan ExpressHttpServer untuk provider express', () => {
  const logger = new Logger();
  const server = createHttpServer('express', logger);

  assert.ok(server instanceof ExpressHttpServer);
});

test('createHttpServer mengembalikan FastifyHttpServer untuk provider fastify', () => {
  const logger = new Logger();
  const server = createHttpServer('fastify', logger);

  assert.ok(server instanceof FastifyHttpServer);
});
