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
import { PosController } from "./modules/pos/pos.controller.js";
import { PosRepository } from "./modules/pos/pos.repository.js";
import { buildPosRouter } from "./modules/pos/pos.routes.js";
import { PosService } from "./modules/pos/pos.service.js";

const logger = createLogger("pos-service");
const prisma = getPrisma();
const env = EnvSchema.parse(process.env);

const repo = new PosRepository(prisma);
const service = new PosService(repo);
const controller = new PosController(service);
const app = createBaseApp(logger);
app.use(tenantMiddleware());

app.use(bearerAuthContextMiddleware(env, verifyAccessToken));

app.use(buildPosRouter(controller));

app.use(notFoundHandler);
app.use(errorHandler(logger));

app.listen(env.PORT, () => logger.info({ port: env.PORT }, "pos-service listening"));
