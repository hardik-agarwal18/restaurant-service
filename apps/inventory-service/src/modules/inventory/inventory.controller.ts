import type { Request, Response } from "express";
import { getContext } from "@rm/platform";
import type { InventoryService } from "./inventory.service.js";
import { CreateInventoryItemBodySchema } from "./inventory.validation.js";

export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  listItems = async (req: Request, res: Response) => {
    const tenantId = getContext(req).tenantId ?? "";
    const items = await this.service.listItems(tenantId);
    res.status(200).json(items);
  };

  createItem = async (req: Request, res: Response) => {
    const tenantId = getContext(req).tenantId ?? "";
    const body = CreateInventoryItemBodySchema.parse(req.body);
    const created = await this.service.createItem(tenantId, body);
    res.status(201).json(created);
  };
}
