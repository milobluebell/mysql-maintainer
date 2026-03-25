import { envConfig } from '../config/env';

/** HTTP 响应中可序列化的错误详情结构 */
export interface HttpErrorDetail {
  name?: string;
  message: string;
  stack?: string;
  cause?: HttpErrorDetail | { message: string };
  errors?: Array<HttpErrorDetail | { message: string }>;
}

/**
 * 将单个 Error 实例序列化为 HTTP 可用的详情（含可选 stack、cause、AggregateError 子错误）。
 * @param err - 错误实例
 * @param includeStack - 是否包含 stack（生产环境应为 false）
 */
function serializeOneError(err: Error, includeStack: boolean): HttpErrorDetail {
  const detail: HttpErrorDetail = {
    name: err.name,
    message: err.message,
  };
  if (includeStack && err.stack) {
    detail.stack = err.stack;
  }
  if (err.cause !== undefined) {
    if (err.cause instanceof Error) {
      detail.cause = serializeOneError(err.cause, includeStack);
    } else {
      detail.cause = { message: String(err.cause) };
    }
  }
  if (
    typeof AggregateError !== 'undefined' &&
    err instanceof AggregateError &&
    err.errors.length > 0
  ) {
    detail.errors = err.errors.map((e) =>
      e instanceof Error ? serializeOneError(e, includeStack) : { message: String(e) },
    );
  }
  return detail;
}

/**
 * 将未知错误序列化为可 JSON 化的结构，供 HTTP 响应体使用。
 * 生产环境不包含 stack，避免泄露内部路径；非生产环境包含 stack、cause、AggregateError.errors。
 * @param err - 捕获的 unknown 错误
 * @returns 可放入响应体 `error` 字段的对象
 */
export function serializeErrorForHttpResponse(err: unknown): HttpErrorDetail {
  const includeStack = envConfig.nodeEnv !== 'production';
  if (err instanceof Error) {
    return serializeOneError(err, includeStack);
  }
  return { message: String(err) };
}
