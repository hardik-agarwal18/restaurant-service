import { Router, type Router as ExpressRouter } from "express";
import { asyncHandler, requireAuth, requirePermission } from "@rm/platform";
import type { UsersController } from "./users.controller.js";

export function buildUsersRouter(controller: UsersController): ExpressRouter {
  const router = Router();

  router.post(
    "/v1/users",
    requireAuth,
    requirePermission("admin:manage"),
    asyncHandler(controller.create)
  );

  return router;
}
