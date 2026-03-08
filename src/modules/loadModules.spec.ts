import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import test from 'node:test';

import { availableModules, deploymentTargets } from '../config/deployment.config';
import { loadConfiguredModules } from './loadModules';

test('loadConfiguredModules memuat module sesuai deployment target', async () => {
  const loggerMessages: string[] = [];

  const modules = await loadConfiguredModules('public-api', {
    info() {},
    error(message: string) {
      loggerMessages.push(message);
    },
  } as never);

  assert.equal(modules.length, 2);
  assert.ok(modules.some((mod) => mod.prefix === '/v1/auth'));
  assert.ok(modules.some((mod) => mod.prefix === '/v1/projects'));
  assert.equal(loggerMessages.length, 0);
});

test('loadConfiguredModules mencatat error bila loader tidak ditemukan', async () => {
  const originalEntries = [...deploymentTargets['public-api'].modules];
  deploymentTargets['public-api'].modules = ['unknown-module' as never];

  const originalLoader = availableModules['unknown-module'];

  const loggerMessages: string[] = [];
  const modules = await loadConfiguredModules('public-api', {
    info() {},
    error(message: string) {
      loggerMessages.push(message);
    },
  } as never);

  assert.equal(modules.length, 0);
  assert.ok(loggerMessages.some((message) => message.includes('Module loader not found')));

  if (originalLoader) {
    availableModules['unknown-module'] = originalLoader;
  } else {
    delete availableModules['unknown-module'];
  }
  deploymentTargets['public-api'].modules = originalEntries;
});

test('loadConfiguredModules fallback ke public-api saat target tidak ditemukan', async () => {
  const loggerMessages: string[] = [];

  const modules = await loadConfiguredModules('does-not-exist', {
    info() {},
    error(message: string) {
      loggerMessages.push(message);
    },
  } as never);

  assert.equal(modules.length, 2);
  assert.ok(
    loggerMessages.some((message) =>
      message.includes('DEPLOYMENT_TARGET "does-not-exist" not found'),
    ),
  );
});
