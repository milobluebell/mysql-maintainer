import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { execFile } from 'child_process';
import { resolve } from 'path';
import { createLogger } from '../../common/logger';
import type { MysqlDumpService } from '../../cron-tasks/mysql-dump.service';
import type { CosUploadService } from '../../common/cos-upload.service';
import { envConfig } from '../../config/env';
import {
  generateBackupFilename,
  generateArchiveFilename,
} from '../../common/generate-backup-filename';

const log = createLogger({ component: 'BackupService' });

export class BackupService {
  constructor(
    private readonly mysqlDumpService: MysqlDumpService,
    private readonly cosUploadService: CosUploadService,
  ) {}

  async performScheduledBackup(): Promise<void> {
    const { mysqlDatabases, backupDir } = envConfig;

    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }

    const dumpFiles = await Promise.all(
      mysqlDatabases.map(async (databaseName) => {
        const filename = generateBackupFilename(databaseName);
        const location = resolve(backupDir, filename);

        log.info({ databaseName, location }, '开始 mysqldump');
        await this.mysqlDumpService.dumpDatabase(databaseName, location);
        log.info({ databaseName }, 'mysqldump 完成');

        return { filename, location };
      }),
    );

    const archiveName = generateArchiveFilename();
    const archivePath = resolve(backupDir, archiveName);
    const sqlFilenames = dumpFiles.map((f) => f.filename);

    log.info({ archiveName, files: sqlFilenames }, '开始打包压缩');
    await this.createArchive(backupDir, sqlFilenames, archivePath);

    for (const { location } of dumpFiles) {
      unlinkSync(location);
    }
    log.info({ archiveName }, '打包完成，临时 SQL 文件已清理');

    await this.cosUploadService.uploadFile(archivePath);
  }

  private createArchive(cwd: string, files: string[], outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      execFile('tar', ['-czf', outputPath, ...files], { cwd }, (error, _stdout, stderr) => {
        if (error) {
          reject(new Error(`tar 打包失败: ${stderr || error.message}`));
          return;
        }
        resolve();
      });
    });
  }
}
