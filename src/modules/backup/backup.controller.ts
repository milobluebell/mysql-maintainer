import Router from 'koa-router';
import { serializeErrorForHttpResponse } from '../../common/error-serialization';
import { createLogger } from '../../common/logger';
import type { BackupService } from './backup.service';
import type { BackupTriggerResponse } from './backup.type';

const log = createLogger({ component: 'BackupController' });

export class BackupController {
  private readonly router: Router;

  constructor(private readonly backupService: BackupService) {
    this.router = new Router({ prefix: '/api/backups' });
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/trigger', (ctx) => this.triggerBackup(ctx));
  }

  private async triggerBackup(ctx: Router.RouterContext): Promise<void> {
    try {
      await this.backupService.performScheduledBackup();
      const body: BackupTriggerResponse = { message: 'Backup triggered successfully' };
      ctx.body = body;
    } catch (error) {
      log.error({ err: error }, '手动触发备份失败');
      ctx.status = 500;
      ctx.body = {
        error: serializeErrorForHttpResponse(error),
      };
    }
  }

  getRouter(): Router {
    return this.router;
  }
}
