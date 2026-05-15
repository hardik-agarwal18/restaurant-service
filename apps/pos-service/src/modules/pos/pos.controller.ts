import type { Request, Response } from "express";
import { getContext } from "@rm/platform";
import type { PosService } from "./pos.service.js";
import { PosPayBodySchema } from "./pos.validation.js";

export class PosController {
  constructor(private readonly service: PosService) {}

  pay = async (req: Request, res: Response) => {
    const tenantId = getContext(req).tenantId ?? "";
    const body = PosPayBodySchema.parse(req.body);
    const payment = await this.service.pay(tenantId, body);
    res.status(201).json(payment);
  };
}
