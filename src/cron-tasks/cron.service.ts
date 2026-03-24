import cron from 'node-cron';

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
      console.log(`[CRON] Registered: ${task.name} (${task.expression})`);
    }
    for (const task of this.intervalTasks) {
      setInterval(() => {
        void this.runHandler('interval', task.name, task.handler);
      }, task.intervalMs);
      console.log(`[INTERVAL] Registered: ${task.name} (every ${task.intervalMs}ms)`);
    }
  }

  private async runHandler(
    kind: ScheduleKind,
    name: string,
    handler: () => void | Promise<void>,
  ): Promise<void> {
    const tag = kind === 'cron' ? 'CRON' : 'INTERVAL';
    console.log(`[${tag}] Running task: ${name}`);
    try {
      await handler();
      console.log(`[${tag}] Task completed: ${name}`);
    } catch (error) {
      console.error(`[${tag}] Task failed: ${name}`, error);
    }
  }
}
