import { Router, type Router as ExpressRouter } from "express";
import { asyncHandler, requireAuth, requirePermission } from "@rm/platform";
import type { PosController } from "./pos.controller.js";

export function buildPosRouter(controller: PosController): ExpressRouter {
  const router = Router();

  router.post(
    "/v1/pos/pay",
    requireAuth,
    requirePermission("pos:bill"),
    asyncHandler(controller.pay)
  );

  return router;
}
