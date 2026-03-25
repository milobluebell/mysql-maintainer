import { logger } from './common/logger';
import { envConfig } from './config/env';
import { App } from './app';
import { CronService } from './cron-tasks/cron.service';
import { MysqlDumpService } from './cron-tasks/mysql-dump.service';
import { CosUploadService } from './common/cos-upload.service';
import { BackupService } from './modules/backup/backup.service';

async function bootstrap(): Promise<void> {
  const mysqlDumpService = new MysqlDumpService();
  const cosUploadService = new CosUploadService(
    envConfig.cosSecretId,
    envConfig.cosSecretKey,
    envConfig.nodeEnv === 'production',
  );
  const backupService = new BackupService(mysqlDumpService, cosUploadService);

  const cronService = new CronService();
  if (envConfig.nodeEnv === 'production') {
    cronService.registerCron('mysql-backup', '0 3 * * *', () =>
      backupService.performScheduledBackup(),
    );
  } else {
    cronService.registerTask('mysql-backup', 3_600_000, () =>
      backupService.performScheduledBackup(),
    );
  }
  cronService.startAll();

  const app = new App({ backupService });
  app.listen(envConfig.serverPort);
}

bootstrap().catch((error) => {
  logger.error({ err: error }, '进程启动失败，即将退出');
  process.exit(1);
});
