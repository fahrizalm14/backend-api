import { strict as assert } from 'node:assert';
import test from 'node:test';

import {
  envFileMap,
  envTargetRules,
  getEnvFileForTarget,
  resolveEnvTargetName,
} from '@/config/envTargetRules';

test('resolveEnvTargetName fallback ke public-api untuk value unknown', () => {
  assert.equal(resolveEnvTargetName(undefined), 'public-api');
  assert.equal(resolveEnvTargetName('unknown-target'), 'public-api');
  assert.equal(resolveEnvTargetName('internal-api'), 'internal-api');
});

test('envTargetRules memiliki required vars untuk public-api', () => {
  assert.ok(envTargetRules['public-api'].requiredVars.includes('JWT_SECRET'));
  assert.ok(envTargetRules['public-api'].requiredVars.includes('DATABASE_URL'));
});

test('envFileMap menyimpan setup target->file dalam satu tempat', () => {
  const file = getEnvFileForTarget('public-api');
  assert.equal(file, envFileMap['public-api']);
  assert.ok(file.endsWith('.env'));
});
