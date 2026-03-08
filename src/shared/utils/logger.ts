import { injectable } from 'tsyringe';

@injectable()
export class Logger {
  info(message: string, extra?: unknown): void {
    console.log(`[INFO] ${message}`, extra ?? '');
  }

  error(message: string, error?: Error): void {
    console.error(`[ERROR] ${message}`, error ?? '');
  }
}
