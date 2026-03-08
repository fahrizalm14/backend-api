import type {
  GlobalMiddleware,
  HttpServer,
  ModuleDefinition,
} from '@/core/http/types';
import type { Logger } from '@/shared/utils/logger';

type CleanupCallback = () => Promise<void> | void;

export interface AppOptions {
  server: HttpServer;
  logger: Logger;
  port: number;
  host: string;
}

export class App {
  private readonly middlewares: GlobalMiddleware[] = [];
  private readonly modules: ModuleDefinition[] = [];
  private readonly cleanupCallbacks: CleanupCallback[] = [];

  constructor(private readonly options: AppOptions) {
    this.registerCleanup(async () => {
      await this.options.server.stop();
    });
  }

  registerMiddleware(middleware: GlobalMiddleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  registerModule(module: ModuleDefinition): this {
    this.modules.push(module);
    return this;
  }

  registerCleanup(callback: CleanupCallback): this {
    this.cleanupCallbacks.push(callback);
    return this;
  }

  private registerShutdownHooks(): void {
    const shutdown = async () => {
      for (const callback of this.cleanupCallbacks) {
        await callback();
      }
      process.exit(0);
    };

    process.once('SIGINT', () => {
      this.options.logger.info('Received SIGINT, shutting down...');
      void shutdown();
    });

    process.once('SIGTERM', () => {
      this.options.logger.info('Received SIGTERM, shutting down...');
      void shutdown();
    });
  }

  async start(): Promise<void> {
    for (const middleware of this.middlewares) {
      this.options.server.registerGlobalMiddleware(middleware);
    }

    for (const module of this.modules) {
      this.options.server.register(module);
    }

    this.registerShutdownHooks();
    await this.options.server.start(this.options.port, this.options.host);
    this.options.logger.info('Application ready');
  }
}
