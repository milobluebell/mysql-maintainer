import cron from 'node-cron';

interface ScheduledTask {
  name: string;
  expression: string;
  handler: () => void | Promise<void>;
}

export class CronService {
  private readonly tasks: ScheduledTask[] = [];

  registerTask(name: string, expression: string, handler: () => void | Promise<void>): void {
    this.tasks.push({ name, expression, handler });
  }

  startAll(): void {
    for (const task of this.tasks) {
      cron.schedule(task.expression, async () => {
        console.log(`[CRON] Running task: ${task.name}`);
        try {
          await task.handler();
          console.log(`[CRON] Task completed: ${task.name}`);
        } catch (error) {
          console.error(`[CRON] Task failed: ${task.name}`, error);
        }
      });
      console.log(`[CRON] Registered: ${task.name} (${task.expression})`);
    }
  }
}
