import path from 'path';
import { logger } from '../common/logger';

export class EnvConfig {
  readonly nodeEnv: string;
  readonly mysqlHost: string;
  readonly mysqlPort: number;
  readonly mysqlUser: string;
  readonly mysqlPassword: string;
  readonly mysqlDatabases: string[];
  readonly serverPort: number;
  readonly backupDir: string;
  readonly sqliteDbPath: string;

  constructor() {
    this.nodeEnv = process.env.NODE_ENV || 'development';
    this.mysqlHost = process.env.MYSQL_HOST || 'localhost';
    this.mysqlPort = parseInt(process.env.MYSQL_PORT || '3306', 10);
    this.mysqlUser = process.env.MYSQL_USER || 'root';
    this.mysqlPassword = process.env.MYSQL_PASSWORD || '';
    this.mysqlDatabases = (process.env.MYSQL_DATABASES || '').split(',').filter(Boolean);
    this.serverPort = parseInt(process.env.SERVER_PORT || '3000', 10);
    this.backupDir = process.env.BACKUP_DIR || './db_backups';
    this.sqliteDbPath =
      process.env.SQLITE_DB_PATH || path.resolve(process.cwd(), 'mysql-maintainer.db');
  }
}

export const envConfig = new EnvConfig();
logger.info(
  {
    nodeEnv: envConfig.nodeEnv,
    serverPort: envConfig.serverPort,
    backupDir: envConfig.backupDir,
    mysqlHost: envConfig.mysqlHost,
    mysqlPort: envConfig.mysqlPort,
    mysqlDatabases: envConfig.mysqlDatabases,
    sqliteDbPath: envConfig.sqliteDbPath,
  },
  '环境配置已加载（不含密码等敏感字段）',
);
