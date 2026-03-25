/**
 * 立即执行一次回调，之后按固定间隔重复执行（与仅使用 `setInterval` 不同，首次不等待一个周期）。
 * @param intervalMs 两次触发之间的间隔（毫秒）
 * @param run 每次触发时执行的函数（可为 async）
 */
export function runImmediatelyThenOnInterval(
  intervalMs: number,
  run: () => void | Promise<void>,
): void {
  void run();
  setInterval(() => {
    void run();
  }, intervalMs);
}
