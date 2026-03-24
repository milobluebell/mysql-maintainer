import { randomBytes } from 'crypto';

/**
 * 为数据库备份生成唯一文件名
 * @param databaseName - 要备份的数据库名称
 * @returns 格式为 `{databaseName}_{8位随机hex}_{YYYYMMDD_HHmmss}.sql` 的文件名
 */
export function generateBackupFilename(databaseName: string): string {
  const randomChars = randomBytes(4).toString('hex');
  const now = new Date();
  const timestamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    '_',
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('');

  return `${databaseName}_${randomChars}_${timestamp}.sql`;
}
