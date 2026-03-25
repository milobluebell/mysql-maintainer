import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export class EnvConfig {
  readonly nodeEnv: string;
  readonly mysqlHost: string;
  readonly mysqlPort: number;
  readonly mysqlUser: string;
  readonly mysqlPassword: string;
  readonly mysqlDatabases: string[];
  readonly serverPort: number;
  readonly backupDir: string;
  readonly cosSecretId: string;
  readonly cosSecretKey: string;

  constructor() {
    this.nodeEnv = process.env.NODE_ENV || 'development';
    this.mysqlHost = process.env.MYSQL_HOST || 'localhost';
    this.mysqlPort = parseInt(process.env.MYSQL_PORT || '3306', 10);
    this.mysqlUser = process.env.MYSQL_USER || 'root';
    this.mysqlPassword = process.env.MYSQL_PASSWORD || '';
    this.mysqlDatabases = (process.env.MYSQL_DATABASES || '').split(',').filter(Boolean);
    this.serverPort = parseInt(process.env.SERVER_PORT || '3000', 10);
    this.backupDir = process.env.BACKUP_DIR || './db_backups';
    this.cosSecretId = process.env.COS_SECRET_ID || '';
    this.cosSecretKey = process.env.COS_SECRET_KEY || '';
  }
}

function valuesToStringRecord(obj: object): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      out[key] = value.map(String).join(',');
    } else if (value !== null && typeof value === 'object') {
      out[key] = JSON.stringify(value);
    } else {
      out[key] = String(value);
    }
  }
  return out;
}

export const envConfig = new EnvConfig();
console.table(valuesToStringRecord(envConfig));
