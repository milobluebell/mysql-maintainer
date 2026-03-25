import COS from 'cos-nodejs-sdk-v5';
import { statSync } from 'fs';
import { basename } from 'path';
import { createLogger } from './logger';

const log = createLogger({ component: 'CosUploadService' });

const COS_BUCKET = 'backups-1252070958';
const COS_REGION = 'ap-guangzhou';
const COS_KEY_PREFIX_PROD = 'mysql_backups';
const COS_KEY_PREFIX_TEST = 'mysql_backups_for_test';

export class CosUploadService {
  private readonly cos: COS;
  private readonly keyPrefix: string;

  /**
   * 初始化腾讯云 COS 上传服务
   * @param secretId - 腾讯云 API SecretId
   * @param secretKey - 腾讯云 API SecretKey
   * @param isProduction - 是否为生产环境，决定上传目标路径前缀
   */
  constructor(secretId: string, secretKey: string, isProduction: boolean) {
    this.cos = new COS({ SecretId: secretId, SecretKey: secretKey });
    this.keyPrefix = isProduction ? COS_KEY_PREFIX_PROD : COS_KEY_PREFIX_TEST;

    if (!secretId.trim() || !secretKey.trim()) {
      log.warn(
        {},
        'COS_SECRET_ID / COS_SECRET_KEY 为空，上传将失败，请检查 .env 或先于 env 加载 dotenv',
      );
    }
  }

  /**
   * 将本地文件上传至 COS；空文件（0 字节）会被跳过。
   * @param filePath - 本地文件绝对路径
   * @returns COS 对象 Key（跳过时返回 null）
   */
  async uploadFile(filePath: string): Promise<string | null> {
    const fileSize = statSync(filePath).size;
    if (fileSize === 0) {
      log.warn({ filePath }, '文件大小为 0，跳过 COS 上传');
      return null;
    }

    const key = `${this.keyPrefix}/${basename(filePath)}`;

    await new Promise<COS.UploadFileResult>((resolve, reject) => {
      this.cos.uploadFile(
        {
          Bucket: COS_BUCKET,
          Region: COS_REGION,
          Key: key,
          FilePath: filePath,
          SliceSize: 1024 * 1024 * 5,
        },
        (err, data) => {
          if (err) {
            reject(new Error(`COS 上传失败 [${key}]: ${err.message}`));
            return;
          }
          resolve(data);
        },
      );
    });

    log.info({ key, fileSize }, '文件已上传至 COS');
    return key;
  }
}
