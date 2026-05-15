import { Router, type Router as ExpressRouter } from "express";
import { asyncHandler } from "@rm/platform";
import type { OutboxController } from "./outbox.controller.js";

export function buildOutboxRouter(controller: OutboxController): ExpressRouter {
  const router = Router();
  router.post("/internal/outbox/publish", asyncHandler(controller.publish));
  return router;
}
