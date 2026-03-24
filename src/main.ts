import 'reflect-metadata';
import { AppDataSource } from './config/data-source';
import { envConfig } from './config/env';
import { logger } from './common/logger';
import { App } from './app';
import { CronService } from './cron-tasks/cron.service';
import { MysqlDumpService } from './cron-tasks/mysql-dump.service';
import { BackupService } from './modules/backup/backup.service';

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();
  logger.info('SQLite 数据源已连接');

  const mysqlDumpService = new MysqlDumpService();
  const backupService = new BackupService(mysqlDumpService);

  const cronService = new CronService();
  if (envConfig.nodeEnv === 'production') {
    cronService.registerCron('mysql-backup', '0 3 * * *', () =>
      backupService.performScheduledBackup(),
    );
  } else {
    logger.warn(
      { nodeEnv: envConfig.nodeEnv },
      '非生产环境：使用 interval 定时备份，生产环境将改用 cron 表达式',
    );
    cronService.registerTask('mysql-backup', 60_000, () => backupService.performScheduledBackup());
  }
  cronService.startAll();

  const app = new App({ backupService });
  app.listen(envConfig.serverPort);
}

bootstrap().catch((error) => {
  logger.error({ err: error }, '进程启动失败，即将退出');
  process.exit(1);
});
