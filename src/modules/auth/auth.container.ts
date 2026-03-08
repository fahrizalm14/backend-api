import { container } from 'tsyringe';

import { AUTH_REPOSITORY_TOKEN } from '@/modules/auth/auth.interface';
import { AuthRepository } from '@/modules/auth/auth.repository';

container.registerSingleton(AUTH_REPOSITORY_TOKEN, AuthRepository);
