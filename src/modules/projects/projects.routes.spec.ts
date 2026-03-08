import { strict as assert } from 'node:assert';
import test from 'node:test';

import createProjectsModule from './projects.routes';

test('projects.routes mendaftarkan route utama dengan auth', () => {
  const moduleDef = createProjectsModule();
  const routeGetList = moduleDef.routes.find(
    (route) => route.method === 'GET' && route.path === '/',
  );

  assert.ok(routeGetList);
  assert.equal(routeGetList?.requiresAuth, true);
  assert.equal(moduleDef.routes.length, 5);
});
