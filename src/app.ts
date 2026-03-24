import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { BackupController } from './modules/backup/backup.controller';
import type { BackupService } from './modules/backup/backup.service';

interface AppDependencies {
  backupService: BackupService;
}

export class App {
  private readonly koa: Koa;

  constructor(deps: AppDependencies) {
    this.koa = new Koa();
    this.setupMiddleware();
    this.setupRoutes(deps);
  }

  private setupMiddleware(): void {
    this.koa.use(async (ctx, next) => {
      try {
        await next();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal Server Error';
        ctx.status = (err as Record<string, number>).status || 500;
        ctx.body = { error: message };
        console.error('[HTTP]', err);
      }
    });
    this.koa.use(bodyParser());
  }

  private setupRoutes(deps: AppDependencies): void {
    const backupController = new BackupController(deps.backupService);
    const router = backupController.getRouter();
    this.koa.use(router.routes());
    this.koa.use(router.allowedMethods());
  }

  listen(port: number): void {
    this.koa.listen(port, () => {
      console.log(`[HTTP] Server running on port ${port}`);
    });
  }
}
