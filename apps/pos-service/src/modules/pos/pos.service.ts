import type { PosRepository, PaymentRow } from "./pos.repository.js";
import type { PosPayBody } from "./pos.validation.js";

export class PosService {
  constructor(private readonly repo: PosRepository) {}

  async pay(tenantId: string, body: PosPayBody): Promise<PaymentRow> {
    return this.repo.createCapturedPayment(tenantId, body);
  }
}
