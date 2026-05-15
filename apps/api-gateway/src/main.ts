import {
  createBaseApp,
  createLogger,
  errorHandler,
  notFoundHandler,
  tenantMiddleware,
} from "@rm/platform";
import { createRateLimiter } from "./rateLimit.js";
import { EnvSchema } from "./env.js";
import { jwtOptionalMiddleware } from "./middleware/jwtOptional.js";
import { buildDocsRouter } from "./modules/docs/docs.routes.js";
import { buildProxyRouter } from "./modules/proxy/proxy.routes.js";

const env = EnvSchema.parse(process.env);
const logger = createLogger("api-gateway");

const app = createBaseApp(logger);
app.use(createRateLimiter(env.REDIS_URL));
app.use(tenantMiddleware());

app.use(buildDocsRouter());

app.use(jwtOptionalMiddleware(env));

app.use(buildProxyRouter(env));

app.use(notFoundHandler);
app.use(errorHandler(logger));

app.listen(env.GATEWAY_PORT, () => {
  logger.info({ port: env.GATEWAY_PORT }, "gateway listening");
});
