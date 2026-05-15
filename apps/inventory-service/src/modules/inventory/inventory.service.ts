import type { InventoryRepository, InventoryItemRow } from "./inventory.repository.js";
import type { CreateInventoryItemBody } from "./inventory.validation.js";

export class InventoryService {
  constructor(private readonly repo: InventoryRepository) {}

  async listItems(tenantId: string): Promise<InventoryItemRow[]> {
    return this.repo.listItems(tenantId);
  }

  async createItem(tenantId: string, body: CreateInventoryItemBody): Promise<InventoryItemRow> {
    return this.repo.createItem(tenantId, body);
  }
}
