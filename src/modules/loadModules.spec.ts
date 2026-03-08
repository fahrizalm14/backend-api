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
  assert.ok(modules.some((mod) => mod.prefix === '/auth'));
  assert.ok(modules.some((mod) => mod.prefix === '/projects'));
  assert.equal(loggerMessages.length, 0);
});

test('loadConfiguredModules mencatat error bila loader tidak ditemukan', async () => {
  const originalProjectsLoader = availableModules.projects;
  (
    availableModules as unknown as Record<string, unknown>
  ).projects = undefined;

  const loggerMessages: string[] = [];
  const modules = await loadConfiguredModules('public-api', {
    info() {},
    error(message: string) {
      loggerMessages.push(message);
    },
  } as never);

  assert.equal(modules.length, 1);
  assert.ok(loggerMessages.some((message) => message.includes('Module loader not found')));

  (
    availableModules as unknown as Record<string, unknown>
  ).projects = originalProjectsLoader;
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
