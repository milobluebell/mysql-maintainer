import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { serializeErrorForHttpResponse } from './common/error-serialization';
import { createLogger } from './common/logger';
import { BackupController } from './modules/backup/backup.controller';
import type { BackupService } from './modules/backup/backup.service';

interface AppDependencies {
  backupService: BackupService;
}

const log = createLogger({ component: 'App' });

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
        ctx.status = (err as Record<string, number>).status || 500;
        ctx.body = { error: serializeErrorForHttpResponse(err) };
        log.error({ err }, 'HTTP 请求处理未捕获异常');
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
      log.info({ port }, 'HTTP 服务已监听');
    });
  }
}
