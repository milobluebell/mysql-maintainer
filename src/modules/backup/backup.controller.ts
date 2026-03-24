import Router from 'koa-router';
import { createLogger } from '../../common/logger';
import type { BackupService } from './backup.service';
import type {
  BackupRecordListResponse,
  BackupRecordDetailResponse,
  BackupTriggerResponse,
} from './backup.type';

const log = createLogger({ component: 'BackupController' });

export class BackupController {
  private readonly router: Router;

  constructor(private readonly backupService: BackupService) {
    this.router = new Router({ prefix: '/api/backups' });
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/', (ctx) => this.listRecords(ctx));
    this.router.get('/:id', (ctx) => this.getRecordDetail(ctx));
    this.router.post('/trigger', (ctx) => this.triggerBackup(ctx));
  }

  private async listRecords(ctx: Router.RouterContext): Promise<void> {
    const records = await this.backupService.findAllRecords();
    const body: BackupRecordListResponse = { data: records };
    ctx.body = body;
  }

  private async getRecordDetail(ctx: Router.RouterContext): Promise<void> {
    const id = Number(ctx.params['id']);
    const record = await this.backupService.findRecordById(id);
    const body: BackupRecordDetailResponse = { data: record };
    ctx.body = body;
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
        error: error instanceof Error ? error.message : 'Backup failed',
      };
    }
  }

  getRouter(): Router {
    return this.router;
  }
}
