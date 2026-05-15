import type { Request, Response } from "express";
import type { RecommendationsService } from "./recommendations.service.js";
import { MenuRecommendationsBodySchema } from "./recommendations.validation.js";

export class RecommendationsController {
  constructor(private readonly service: RecommendationsService) {}

  menu = async (req: Request, res: Response) => {
    const body = MenuRecommendationsBodySchema.parse(req.body);
    const result = await this.service.getMenuRecommendations(body);
    res.status(200).json(result);
  };
}
