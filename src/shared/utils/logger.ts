import { injectable } from 'tsyringe';

@injectable()
export class Logger {
  info(message: string, extra?: unknown): void {
    // eslint-disable-next-line no-console
    console.log(`[INFO] ${message}`, extra ?? '');
  }

  error(message: string, error?: Error): void {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, error ?? '');
  }
}
