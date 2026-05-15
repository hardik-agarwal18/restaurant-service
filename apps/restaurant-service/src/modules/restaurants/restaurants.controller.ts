import type { Request, Response } from "express";
import { getContext } from "@rm/platform";
import type { RestaurantsService } from "./restaurants.service.js";
import { CreateBranchBodySchema } from "./restaurants.validation.js";

export class RestaurantsController {
  constructor(private readonly service: RestaurantsService) {}

  listRestaurants = async (req: Request, res: Response) => {
    const tenantId = getContext(req).tenantId ?? "";
    const rows = await this.service.listRestaurants(tenantId);
    res.status(200).json(rows);
  };

  createBranch = async (req: Request, res: Response) => {
    const tenantId = getContext(req).tenantId ?? "";
    const body = CreateBranchBodySchema.parse(req.body);
    const created = await this.service.createBranch(tenantId, body);
    res.status(201).json(created);
  };
}
