import type { RequestHandler } from "express";
import { Router, type Router as ExpressRouter } from "express";
import { asyncHandler } from "@rm/platform";
import type { AuthController } from "./auth.controller.js";

export function buildAuthRouter(
  controller: AuthController,
  opts: { csrfProtection: RequestHandler }
): ExpressRouter {
  const router = Router();

  router.get("/v1/csrf", opts.csrfProtection, controller.csrf);

  router.post("/v1/auth/login", asyncHandler(controller.login));

  router.post("/v1/auth/refresh", opts.csrfProtection, asyncHandler(controller.refresh));

  router.post("/v1/auth/logout", opts.csrfProtection, asyncHandler(controller.logout));

  router.get("/v1/auth/me", asyncHandler(controller.me));

  return router;
}
