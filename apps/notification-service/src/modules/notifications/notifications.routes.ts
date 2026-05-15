import { Router, type Router as ExpressRouter } from "express";
import { asyncHandler } from "@rm/platform";
import type { NotificationsController } from "./notifications.controller.js";

export function buildNotificationsRouter(controller: NotificationsController): ExpressRouter {
  const router = Router();

  router.post("/internal/queues/enqueue-test", asyncHandler(controller.enqueueTest));

  return router;
}
