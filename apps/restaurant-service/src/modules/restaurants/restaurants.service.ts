import type { BranchRow, RestaurantsRepository, RestaurantRow } from "./restaurants.repository.js";
import type { CreateBranchBody } from "./restaurants.validation.js";

export class RestaurantsService {
  constructor(private readonly repo: RestaurantsRepository) {}

  async listRestaurants(tenantId: string): Promise<RestaurantRow[]> {
    return this.repo.listRestaurants(tenantId);
  }

  async createBranch(tenantId: string, body: CreateBranchBody): Promise<BranchRow> {
    return this.repo.createBranch(tenantId, body);
  }
}
