import { execFile } from 'child_process';
import { envConfig } from '../config/env';

export class MysqlDumpService {
  dumpDatabase(databaseName: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        '-h',
        envConfig.mysqlHost,
        '-P',
        String(envConfig.mysqlPort),
        '-u',
        envConfig.mysqlUser,
        `--password=${envConfig.mysqlPassword}`,
        '--single-transaction',
        '--routines',
        '--triggers',
        `--result-file=${outputPath}`,
        databaseName,
      ];

      execFile('mysqldump', args, (error, _stdout, stderr) => {
        if (error) {
          reject(new Error(`mysqldump failed for ${databaseName}: ${stderr || error.message}`));
          return;
        }
        resolve();
      });
    });
  }
}
