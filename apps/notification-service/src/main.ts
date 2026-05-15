import { Queue, type ConnectionOptions } from "bullmq";
import { EventBus } from "@rm/events";
import { createBaseApp, createLogger, errorHandler, notFoundHandler } from "@rm/platform";
import { EnvSchema } from "./env.js";
import { NotificationsController } from "./modules/notifications/notifications.controller.js";
import { buildNotificationsRouter } from "./modules/notifications/notifications.routes.js";
import { NotificationsService } from "./modules/notifications/notifications.service.js";
import { registerNotificationSubscriptions } from "./modules/notifications/notifications.subscriptions.js";
import { startNotificationWorkers } from "./modules/notifications/notifications.workers.js";

const env = EnvSchema.parse(process.env);
const logger = createLogger("notification-service");

const connection: ConnectionOptions = { url: env.REDIS_URL };
const emailQueue = new Queue("email", { connection });
const smsQueue = new Queue("sms", { connection });

const service = new NotificationsService({ emailQueue, smsQueue });
const controller = new NotificationsController(service);

startNotificationWorkers(connection, logger, service);

const bus = new EventBus(env.REDIS_URL, logger);
await bus.connect();
await registerNotificationSubscriptions(bus, service);

const app = createBaseApp(logger);

app.use(buildNotificationsRouter(controller));

app.use(notFoundHandler);
app.use(errorHandler(logger));

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "notification-service listening");
});
