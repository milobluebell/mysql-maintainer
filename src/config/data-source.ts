import { DataSource } from 'typeorm';
import { BackupRecord } from '../modules/backup/backup.entity';
import { envConfig } from './env';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: envConfig.sqliteDbPath,
  entities: [BackupRecord],
  synchronize: true,
});
