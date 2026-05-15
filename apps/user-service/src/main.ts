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
import { UsersController } from "./modules/users/users.controller.js";
import { UsersRepository } from "./modules/users/users.repository.js";
import { buildUsersRouter } from "./modules/users/users.routes.js";
import { UsersService } from "./modules/users/users.service.js";

const logger = createLogger("user-service");
const prisma = getPrisma();
const env = EnvSchema.parse(process.env);

const repo = new UsersRepository(prisma);
const service = new UsersService(repo);
const controller = new UsersController(service);

const app = createBaseApp(logger);
app.use(tenantMiddleware());

app.use(bearerAuthContextMiddleware(env, verifyAccessToken));

app.use(buildUsersRouter(controller));

app.use(notFoundHandler);
app.use(errorHandler(logger));

app.listen(env.PORT, () => logger.info({ port: env.PORT }, "user-service listening"));
