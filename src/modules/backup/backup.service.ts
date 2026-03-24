import type { Repository } from 'typeorm';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { BackupRecord } from './backup.entity';
import type { MysqlDumpService } from '../../cron-tasks/mysql-dump.service';
import { AppDataSource } from '../../config/data-source';
import { envConfig } from '../../config/env';
import { generateBackupFilename } from '../../common/generate-backup-filename';

export class BackupService {
  private readonly backupRecordRepository: Repository<BackupRecord>;

  constructor(private readonly mysqlDumpService: MysqlDumpService) {
    this.backupRecordRepository = AppDataSource.getRepository(BackupRecord);
  }

  async performScheduledBackup(): Promise<void> {
    const { mysqlDatabases, backupDir } = envConfig;

    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }

    for (const databaseName of mysqlDatabases) {
      const filename = generateBackupFilename(databaseName);
      const location = join(backupDir, filename);

      const record = this.backupRecordRepository.create({ databaseName, location });
      const savedRecord = await this.backupRecordRepository.save(record);

      await this.mysqlDumpService.dumpDatabase(databaseName, location);

      savedRecord.updatedAt = new Date();
      await this.backupRecordRepository.save(savedRecord);
    }
  }

  async findAllRecords(): Promise<BackupRecord[]> {
    return this.backupRecordRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findRecordById(id: number): Promise<BackupRecord | null> {
    return this.backupRecordRepository.findOneBy({ id });
  }
}
