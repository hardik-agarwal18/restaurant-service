import { Router, type Router as ExpressRouter } from "express";
import { asyncHandler } from "@rm/platform";
import type { AnalyticsController } from "./analytics.controller.js";

export function buildAnalyticsRouter(controller: AnalyticsController): ExpressRouter {
  const router = Router();
  router.get("/v1/analytics/summary", asyncHandler(controller.summary));
  return router;
}
