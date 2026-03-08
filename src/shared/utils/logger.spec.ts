import test from 'node:test';

import { Logger } from './logger';

test('Logger.info dan Logger.error dapat dipanggil tanpa throw', () => {
  const logger = new Logger();
  logger.info('info message');
  logger.error('error message');
});
