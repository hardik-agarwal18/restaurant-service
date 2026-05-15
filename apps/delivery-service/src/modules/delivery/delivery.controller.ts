import type { Request, Response } from "express";
import { getContext } from "@rm/platform";
import type { DeliveryService } from "./delivery.service.js";
import { AssignDeliveryBodySchema } from "./delivery.validation.js";

export class DeliveryController {
  constructor(private readonly service: DeliveryService) {}

  assign = async (req: Request, res: Response) => {
    const tenantId = getContext(req).tenantId ?? "";
    const body = AssignDeliveryBodySchema.parse(req.body);
    const delivery = await this.service.assign(tenantId, body);
    res.status(200).json(delivery);
  };
}
