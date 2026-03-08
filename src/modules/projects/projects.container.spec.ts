import { strict as assert } from 'node:assert';
import test from 'node:test';
import { container } from 'tsyringe';

import {
  PROJECTS_REPOSITORY_TOKEN,
} from './projects.interface';
import { ProjectsRepository } from './projects.repository';
import './projects.container';

test('projects.container meregistrasikan PROJECTS_REPOSITORY_TOKEN', () => {
  const resolved = container.resolve(PROJECTS_REPOSITORY_TOKEN);
  assert.ok(resolved instanceof ProjectsRepository);
});
