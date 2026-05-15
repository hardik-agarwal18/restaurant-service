import type { Request, Response } from "express";
import { getContext } from "@rm/platform";
import { sendCreated } from "../../common/http/response.js";
import type { OrdersService } from "./orders.service.js";
import { CreateOrderBodySchema } from "./orders.validation.js";
import type { CreateOrderCommand } from "./orders.types.js";

export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  createOrder = async (req: Request, res: Response) => {
    const ctx = getContext(req);

    const body = CreateOrderBodySchema.parse(req.body);

    const cmd: CreateOrderCommand = {
      tenantId: ctx.tenantId ?? "",
      userId: ctx.userId ?? "",
      input: body,
    };

    const created = await this.service.createOrder(cmd);
    return sendCreated(req, res, created);
  };
}
