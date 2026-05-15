import { createBaseApp, createLogger, errorHandler, notFoundHandler } from "@rm/platform";
import { EnvSchema } from "./env.js";
import { AnalyticsController } from "./modules/analytics/analytics.controller.js";
import { buildAnalyticsRouter } from "./modules/analytics/analytics.routes.js";
import { AnalyticsService } from "./modules/analytics/analytics.service.js";

const logger = createLogger("analytics-service");
const env = EnvSchema.parse(process.env);
const service = new AnalyticsService();
const controller = new AnalyticsController(service);
const app = createBaseApp(logger);

app.use(buildAnalyticsRouter(controller));

app.use(notFoundHandler);
app.use(errorHandler(logger));

app.listen(env.PORT, () => logger.info({ port: env.PORT }, "analytics-service listening"));
