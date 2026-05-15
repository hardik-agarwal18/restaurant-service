import cookieParser from "cookie-parser";
import csurf from "csurf";
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
import { AuthController } from "./modules/auth/auth.controller.js";
import { AuthRepository } from "./modules/auth/auth.repository.js";
import { buildAuthRouter } from "./modules/auth/auth.routes.js";
import { AuthService } from "./modules/auth/auth.service.js";

const env = EnvSchema.parse(process.env);
const logger = createLogger("auth-service");
const prisma = getPrisma();

const repo = new AuthRepository(prisma);
const service = new AuthService(env, repo);
const controller = new AuthController(env, service);

const app = createBaseApp(logger);
app.use(cookieParser());
app.use(tenantMiddleware());
app.use(bearerAuthContextMiddleware(env, verifyAccessToken));

const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: env.COOKIE_SECURE,
  },
});

app.use(buildAuthRouter(controller, { csrfProtection }));

app.use(notFoundHandler);
app.use(errorHandler(logger));

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "auth-service listening");
});
