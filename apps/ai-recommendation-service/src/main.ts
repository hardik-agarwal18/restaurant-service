import { createBaseApp, createLogger, errorHandler, notFoundHandler } from "@rm/platform";
import { EnvSchema } from "./env.js";
import { RecommendationsController } from "./modules/recommendations/recommendations.controller.js";
import { buildRecommendationsRouter } from "./modules/recommendations/recommendations.routes.js";
import { RecommendationsService } from "./modules/recommendations/recommendations.service.js";

const logger = createLogger("ai-recommendation-service");
const env = EnvSchema.parse(process.env);
const service = new RecommendationsService();
const controller = new RecommendationsController(service);
const app = createBaseApp(logger);

app.use(buildRecommendationsRouter(controller));

app.use(notFoundHandler);
app.use(errorHandler(logger));

app.listen(env.PORT, () => logger.info({ port: env.PORT }, "ai-recommendation-service listening"));
