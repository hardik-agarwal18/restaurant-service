import { Router, type Router as ExpressRouter } from "express";
import { asyncHandler, requireAuth } from "@rm/platform";
import type { DeliveryController } from "./delivery.controller.js";

export function buildDeliveryRouter(controller: DeliveryController): ExpressRouter {
  const router = Router();

  router.post("/v1/delivery/assign", requireAuth, asyncHandler(controller.assign));

  return router;
}
