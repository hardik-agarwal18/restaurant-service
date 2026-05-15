import { Router, type Router as ExpressRouter } from "express";
import { asyncHandler, requireAuth, requirePermission } from "@rm/platform";
import type { InventoryController } from "./inventory.controller.js";

export function buildInventoryRouter(controller: InventoryController): ExpressRouter {
  const router = Router();

  router.get(
    "/v1/inventory/items",
    requireAuth,
    requirePermission("inventory:read"),
    asyncHandler(controller.listItems)
  );

  router.post(
    "/v1/inventory/items",
    requireAuth,
    requirePermission("inventory:update"),
    asyncHandler(controller.createItem)
  );

  return router;
}
