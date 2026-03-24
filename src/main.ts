import 'reflect-metadata';
import { AppDataSource } from './config/data-source';
import { envConfig } from './config/env';
import { App } from './app';
import { CronService } from './cron-tasks/cron.service';
import { MysqlDumpService } from './cron-tasks/mysql-dump.service';
import { BackupService } from './modules/backup/backup.service';

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();
  console.log('[DB] SQLite connected');

  const mysqlDumpService = new MysqlDumpService();
  const backupService = new BackupService(mysqlDumpService);

  const cronService = new CronService();
  cronService.registerTask('mysql-backup', '0 3 * * *', () =>
    backupService.performScheduledBackup(),
  );
  cronService.startAll();

  const app = new App({ backupService });
  app.listen(envConfig.serverPort);
}

bootstrap().catch((error) => {
  console.error('[FATAL]', error);
  process.exit(1);
});
