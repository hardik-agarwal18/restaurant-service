import type { MenuRecommendationsBody } from "./recommendations.validation.js";

export class RecommendationsService {
  async getMenuRecommendations(
    body: MenuRecommendationsBody
  ): Promise<{ tenantId: string; recommendations: unknown[] }> {
    return { tenantId: body.tenantId, recommendations: [] };
  }
}
