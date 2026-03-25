import cron from 'node-cron';
import { createLogger } from '../common/logger';
import { runImmediatelyThenOnInterval } from '../common/run-immediately-then-interval';

const log = createLogger({ component: 'CronService' });

interface CronJobEntry {
  name: string;
  expression: string;
  handler: () => void | Promise<void>;
}

interface IntervalTaskEntry {
  name: string;
  intervalMs: number;
  handler: () => void | Promise<void>;
}

type ScheduleKind = 'cron' | 'interval';

export class CronService {
  private readonly cronJobs: CronJobEntry[] = [];
  private readonly intervalTasks: IntervalTaskEntry[] = [];
  private readonly intervalTaskRunning = new Set<string>();

  registerCron(name: string, expression: string, handler: () => void | Promise<void>): void {
    this.cronJobs.push({ name, expression, handler });
  }

  registerTask(name: string, intervalMs: number, handler: () => void | Promise<void>): void {
    this.intervalTasks.push({ name, intervalMs, handler });
  }

  startAll(): void {
    for (const task of this.cronJobs) {
      cron.schedule(task.expression, () => {
        void this.runHandler('cron', task.name, task.handler);
      });
      log.info({ taskName: task.name, expression: task.expression }, '已注册 cron 任务');
    }
    for (const task of this.intervalTasks) {
      runImmediatelyThenOnInterval(task.intervalMs, () => {
        void this.runIntervalTaskIfIdle(task);
      });
      log.info({ taskName: task.name, intervalMs: task.intervalMs }, '已注册 interval 任务');
    }
  }

  private async runIntervalTaskIfIdle(task: IntervalTaskEntry): Promise<void> {
    if (this.intervalTaskRunning.has(task.name)) {
      log.warn(
        { taskName: task.name },
        '上次备份尚未结束，跳过本次 interval 触发（避免并发 mysqldump）',
      );
      return;
    }
    this.intervalTaskRunning.add(task.name);
    try {
      await this.runHandler('interval', task.name, task.handler);
    } finally {
      this.intervalTaskRunning.delete(task.name);
    }
  }

  private async runHandler(
    kind: ScheduleKind,
    name: string,
    handler: () => void | Promise<void>,
  ): Promise<void> {
    const scheduleKind = kind;
    log.info({ scheduleKind, taskName: name }, '定时任务开始执行');
    try {
      await handler();
      log.info({ scheduleKind, taskName: name }, '定时任务执行成功');
    } catch (error) {
      log.error({ err: error, scheduleKind, taskName: name }, '定时任务执行失败');
    }
  }
}
