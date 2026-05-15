import { verifyAccessToken } from "@rm/auth";
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
import { PaymentsController } from "./modules/payments/payments.controller.js";
import { PaymentsRepository } from "./modules/payments/payments.repository.js";
import { buildPaymentsRouter } from "./modules/payments/payments.routes.js";
import { PaymentsService } from "./modules/payments/payments.service.js";

const logger = createLogger("payment-service");
const prisma = getPrisma();
const env = EnvSchema.parse(process.env);
const bus = new EventBus(env.REDIS_URL, logger);
await bus.connect();

const repo = new PaymentsRepository(prisma);
const service = new PaymentsService(repo, bus);
const controller = new PaymentsController(service);

const app = createBaseApp(logger);
app.use(tenantMiddleware());

app.use(bearerAuthContextMiddleware(env, verifyAccessToken));

app.use(buildPaymentsRouter(controller));

app.use(notFoundHandler);
app.use(errorHandler(logger));

app.listen(env.PORT, () => logger.info({ port: env.PORT }, "payment-service listening"));
