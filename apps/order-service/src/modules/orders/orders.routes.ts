import { Router, type Router as ExpressRouter } from "express";
import { asyncHandler, requireAuth, requirePermission } from "@rm/platform";
import type { OrdersController } from "./orders.controller.js";

export function buildOrdersRouter(controller: OrdersController): ExpressRouter {
  const router = Router();

  router.post(
    "/v1/orders",
    requireAuth,
    requirePermission("orders:create"),
    asyncHandler(controller.createOrder)
  );

  return router;
}
