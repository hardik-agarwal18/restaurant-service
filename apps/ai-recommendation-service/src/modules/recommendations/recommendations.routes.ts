import { Router, type Router as ExpressRouter } from "express";
import { asyncHandler } from "@rm/platform";
import type { RecommendationsController } from "./recommendations.controller.js";

export function buildRecommendationsRouter(controller: RecommendationsController): ExpressRouter {
  const router = Router();
  router.post("/v1/ai/recommendations/menu", asyncHandler(controller.menu));
  return router;
}
