import type { Request, Response } from "express";
import { getContext } from "@rm/platform";
import { sendOk } from "../../common/http/response.js";
import type { OutboxService } from "./outbox.service.js";
import { badRequest } from "@rm/platform";

export class OutboxController {
  constructor(private readonly service: OutboxService) {}

  publish = async (req: Request, res: Response) => {
    const ctx = getContext(req);
    const tenantId = ctx.tenantId;
    if (!tenantId) throw badRequest("Missing tenant context");

    const published = await this.service.publishBatch(tenantId, 50);
    return sendOk(req, res, { published });
  };
}
