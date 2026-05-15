import type { Request, Response } from "express";
import type { AnalyticsService } from "./analytics.service.js";

export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  summary = async (_req: Request, res: Response) => {
    const payload = await this.service.getSummary();
    res.status(501).json(payload);
  };
}
