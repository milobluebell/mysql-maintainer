import { randomBytes } from 'crypto';

function formatTimestamp(date: Date): string {
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('_');
  const timePart = [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
    String(date.getSeconds()).padStart(2, '0'),
  ].join('_');
  return `${datePart}-${timePart}`;
}

/**
 * 为数据库备份生成唯一文件名
 * @param databaseName - 要备份的数据库名称
 * @returns 格式为 `{databaseName}_{8位随机hex}_{YYYY_MM_DD-HH_mm_ss}.sql` 的文件名
 */
export function generateBackupFilename(databaseName: string): string {
  const randomChars = randomBytes(4).toString('hex');
  return `${databaseName}_${randomChars}_${formatTimestamp(new Date())}.sql`;
}

/**
 * 生成备份归档文件名（基于当前时间）
 * @returns 格式为 `YYYY_MM_DD-HH_mm_ss.tar.gz` 的归档文件名
 */
export function generateArchiveFilename(): string {
  return `${formatTimestamp(new Date())}.tar.gz`;
}
