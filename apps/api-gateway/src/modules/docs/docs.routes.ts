import swaggerUi from "swagger-ui-express";
import { Router, type Router as ExpressRouter } from "express";
import { openapi } from "../../openapi.js";

export function buildDocsRouter(): ExpressRouter {
  const router = Router();
  router.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));
  return router;
}
