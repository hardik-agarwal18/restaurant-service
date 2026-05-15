import type { DeliveryRepository, DeliveryRow } from "./delivery.repository.js";
import type { AssignDeliveryBody } from "./delivery.validation.js";

export class DeliveryService {
  constructor(private readonly repo: DeliveryRepository) {}

  async assign(tenantId: string, body: AssignDeliveryBody): Promise<DeliveryRow> {
    return this.repo.upsertAssignment(tenantId, body);
  }
}
