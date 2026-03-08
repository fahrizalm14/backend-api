import { strict as assert } from 'node:assert';
import test from 'node:test';

import { App } from './App';
import type { GlobalMiddleware, HttpServer, ModuleDefinition } from './http/types';

function createServerMock() {
  const middlewares: GlobalMiddleware[] = [];
  const modules: ModuleDefinition[] = [];

  const server: HttpServer = {
    register(module) {
      modules.push(module);
    },
    registerGlobalMiddleware(middleware) {
      middlewares.push(middleware);
    },
    setErrorHandler() {},
    async start() {},
    async stop() {},
  };

  return { server, middlewares, modules };
}

test('App.start mendaftarkan middleware dan module ke server', async () => {
  const { server, middlewares, modules } = createServerMock();
  const logs: string[] = [];

  const app = new App({
    server,
    port: 3000,
    host: '127.0.0.1',
    logger: {
      info(message: string) {
        logs.push(message);
      },
      error() {},
    },
  });

  const middleware: GlobalMiddleware = { express: (_req, _res, next) => next() };
  const moduleDef: ModuleDefinition = {
    prefix: '/v1/test',
    routes: [],
  };

  app.registerMiddleware(middleware).registerModule(moduleDef);
  await app.start();

  assert.equal(middlewares.length, 1);
  assert.equal(modules.length, 1);
  assert.equal(modules[0].prefix, '/v1/test');
  assert.ok(logs.includes('Application ready'));
});
