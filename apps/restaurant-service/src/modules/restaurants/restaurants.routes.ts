import { Router, type Router as ExpressRouter } from "express";
import { asyncHandler, requireAuth, requirePermission } from "@rm/platform";
import type { RestaurantsController } from "./restaurants.controller.js";

export function buildRestaurantsRouter(controller: RestaurantsController): ExpressRouter {
  const router = Router();

  router.get("/v1/restaurants", requireAuth, asyncHandler(controller.listRestaurants));

  router.post(
    "/v1/branches",
    requireAuth,
    requirePermission("admin:manage"),
    asyncHandler(controller.createBranch)
  );

  return router;
}
