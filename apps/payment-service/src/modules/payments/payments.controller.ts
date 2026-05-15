import type { Request, Response } from "express";
import { getContext } from "@rm/platform";
import type { PaymentsService } from "./payments.service.js";
import { CapturePaymentBodySchema } from "./payments.validation.js";

export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  capture = async (req: Request, res: Response) => {
    const tenantId = getContext(req).tenantId ?? "";
    const body = CapturePaymentBodySchema.parse(req.body);
    const payment = await this.service.capturePayment(tenantId, body);
    res.status(201).json(payment);
  };
}
