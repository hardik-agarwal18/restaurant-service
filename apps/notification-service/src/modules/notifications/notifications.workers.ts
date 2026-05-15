import { Worker, type ConnectionOptions, type Job } from "bullmq";
import type { Logger } from "@rm/platform";
import type { NotificationsService } from "./notifications.service.js";

export function startNotificationWorkers(
  connection: ConnectionOptions,
  logger: Logger,
  _service: NotificationsService
) {
  new Worker(
    "email",
    async (job: Job) => {
      logger.info({ jobId: job.id, data: job.data }, "send email (stub)");
    },
    { connection }
  );

  new Worker(
    "sms",
    async (job: Job) => {
      logger.info({ jobId: job.id, data: job.data }, "send sms (stub)");
    },
    { connection }
  );
}
