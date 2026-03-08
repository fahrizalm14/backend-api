import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import test from 'node:test';

import createAuthModule from '@/modules/auth/auth.routes';

test('auth.routes registers refresh and logout endpoints', () => {
  const moduleDef = createAuthModule();

  const refreshRoute = moduleDef.routes.find(
    (route) => route.method === 'POST' && route.path === '/refresh',
  );
  const logoutRoute = moduleDef.routes.find(
    (route) => route.method === 'POST' && route.path === '/logout',
  );
  const logoutAllRoute = moduleDef.routes.find(
    (route) => route.method === 'POST' && route.path === '/logout-all',
  );

  assert.ok(refreshRoute);
  assert.ok(logoutRoute);
  assert.ok(logoutAllRoute);
  assert.equal(logoutAllRoute?.requiresAuth, true);
});
