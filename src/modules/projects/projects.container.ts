import { container } from 'tsyringe';

import {
  PROJECTS_REPOSITORY_TOKEN,
} from '@/modules/projects/projects.interface';
import { ProjectsRepository } from '@/modules/projects/projects.repository';

container.registerSingleton(PROJECTS_REPOSITORY_TOKEN, ProjectsRepository);
