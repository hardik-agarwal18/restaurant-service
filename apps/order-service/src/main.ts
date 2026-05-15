import { getPrisma } from "@rm/db";
import { EventBus } from "@rm/events";
import {
  bearerAuthContextMiddleware,
  createBaseApp,
  createLogger,
  errorHandler,
  notFoundHandler,
  tenantMiddleware,
} from "@rm/platform";
import { EnvSchema } from "./env.js";
import { OrdersController } from "./modules/orders/orders.controller.js";
import { OrdersRepository } from "./modules/orders/orders.repository.js";
import { buildOrdersRouter } from "./modules/orders/orders.routes.js";
import { OrdersService } from "./modules/orders/orders.service.js";
import { OutboxController } from "./modules/outbox/outbox.controller.js";
import { OutboxRepository } from "./modules/outbox/outbox.repository.js";
import { buildOutboxRouter } from "./modules/outbox/outbox.routes.js";
import { OutboxService } from "./modules/outbox/outbox.service.js";
import { verifyAccessToken } from "@rm/auth";

const env = EnvSchema.parse(process.env);
const logger = createLogger("order-service");
const prisma = getPrisma();
const bus = new EventBus(env.REDIS_URL, logger);
await bus.connect();

const ordersRepo = new OrdersRepository(prisma);
const ordersService = new OrdersService(ordersRepo);
const ordersController = new OrdersController(ordersService);

const outboxRepo = new OutboxRepository(prisma);
const outboxService = new OutboxService(outboxRepo, bus);
const outboxController = new OutboxController(outboxService);

const app = createBaseApp(logger);
app.use(tenantMiddleware());

app.use(bearerAuthContextMiddleware(env, verifyAccessToken));

app.use(buildOrdersRouter(ordersController));
app.use(buildOutboxRouter(outboxController));

app.use(notFoundHandler);
app.use(errorHandler(logger));

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "order-service listening");
});
