import { verifyAccessToken } from "@rm/auth";
import { getPrisma } from "@rm/db";
import {
  bearerAuthContextMiddleware,
  createBaseApp,
  createLogger,
  errorHandler,
  notFoundHandler,
  tenantMiddleware,
} from "@rm/platform";
import { EnvSchema } from "./env.js";
import { DeliveryController } from "./modules/delivery/delivery.controller.js";
import { DeliveryRepository } from "./modules/delivery/delivery.repository.js";
import { buildDeliveryRouter } from "./modules/delivery/delivery.routes.js";
import { DeliveryService } from "./modules/delivery/delivery.service.js";

const logger = createLogger("delivery-service");
const prisma = getPrisma();
const env = EnvSchema.parse(process.env);

const repo = new DeliveryRepository(prisma);
const service = new DeliveryService(repo);
const controller = new DeliveryController(service);

const app = createBaseApp(logger);
app.use(tenantMiddleware());

app.use(bearerAuthContextMiddleware(env, verifyAccessToken));

app.use(buildDeliveryRouter(controller));

app.use(notFoundHandler);
app.use(errorHandler(logger));

app.listen(env.PORT, () => logger.info({ port: env.PORT }, "delivery-service listening"));
