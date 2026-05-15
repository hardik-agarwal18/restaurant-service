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
import { InventoryController } from "./modules/inventory/inventory.controller.js";
import { InventoryRepository } from "./modules/inventory/inventory.repository.js";
import { buildInventoryRouter } from "./modules/inventory/inventory.routes.js";
import { InventoryService } from "./modules/inventory/inventory.service.js";

const logger = createLogger("inventory-service");
const prisma = getPrisma();
const env = EnvSchema.parse(process.env);

const repo = new InventoryRepository(prisma);
const service = new InventoryService(repo);
const controller = new InventoryController(service);

const app = createBaseApp(logger);
app.use(tenantMiddleware());

app.use(bearerAuthContextMiddleware(env, verifyAccessToken));

app.use(buildInventoryRouter(controller));

app.use(notFoundHandler);
app.use(errorHandler(logger));

app.listen(env.PORT, () => logger.info({ port: env.PORT }, "inventory-service listening"));
