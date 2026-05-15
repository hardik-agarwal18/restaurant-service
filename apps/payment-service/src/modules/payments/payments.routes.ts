import { Router, type Router as ExpressRouter } from "express";
import { asyncHandler, requireAuth } from "@rm/platform";
import type { PaymentsController } from "./payments.controller.js";

export function buildPaymentsRouter(controller: PaymentsController): ExpressRouter {
  const router = Router();

  router.post("/v1/payments/capture", requireAuth, asyncHandler(controller.capture));

  return router;
}
