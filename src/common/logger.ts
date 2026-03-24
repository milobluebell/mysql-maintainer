import dotenv from 'dotenv';
import path from 'path';
import pino from 'pino';
import pretty from 'pino-pretty';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const level = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function formatEpochLocal(epochMs: number): string {
  const d = new Date(epochMs);
  const p = (n: number) => String(n).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${ms}`;
}

function buildPrettyMessage(log: Record<string, unknown>, messageKey: string): string {
  const segments: string[] = [];
  if (typeof log.time === 'number') {
    segments.push(formatEpochLocal(log.time));
  }
  if (typeof log.component === 'string') {
    segments.push(`[${log.component}]`);
  }
  if (typeof log.scheduleKind === 'string') {
    segments.push(`[${log.scheduleKind}]`);
  }
  if (typeof log.taskName === 'string') {
    segments.push(`[${log.taskName}]`);
  }
  const raw = log[messageKey];
  if (raw !== undefined && raw !== null) {
    segments.push(String(raw));
  }
  return segments.join(' ');
}

const useColor =
  process.env.NO_COLOR === undefined &&
  (process.stdout.isTTY === true ||
    process.env.FORCE_COLOR === '1' ||
    process.env.LOG_COLOR === '1');

const prettyStream = pretty({
  colorize: useColor,
  singleLine: false,
  hideObject: true,
  ignore: 'pid,hostname,name,v,time,component,scheduleKind,taskName',
  messageFormat: (log, messageKey) =>
    buildPrettyMessage(log as Record<string, unknown>, messageKey),
});

/**
 * 应用根日志实例（Pino），经 pino-pretty 输出为单行可读字符串。
 * 级别优先读取 `LOG_LEVEL`，否则生产环境为 `info`，其余为 `debug`。
 * 本模块在创建实例前会先加载 `.env`。
 * 非 TTY 时默认不着色；可设置 `FORCE_COLOR=1` 或 `LOG_COLOR=1`（如 Docker 需要 ANSI 色）。
 */
export const logger = pino({ level }, prettyStream);

/**
 * 创建带固定上下文字段的子 logger，便于区分模块。
 * @param bindings - 固定合并到每条日志的字段，例如 `{ component: 'CronService' }`
 * @returns 子 logger 实例
 */
export function createLogger(bindings: Record<string, string>): pino.Logger {
  return logger.child(bindings);
}
