import type { Request, Response } from "express";
import type { NotificationsService } from "./notifications.service.js";
import { EnqueueTestBodySchema } from "./notifications.validation.js";

export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  enqueueTest = async (req: Request, res: Response) => {
    const body = EnqueueTestBodySchema.parse(req.body);
    await this.service.enqueueTestSms(body.to);
    res.status(202).json({ ok: true });
  };
}
