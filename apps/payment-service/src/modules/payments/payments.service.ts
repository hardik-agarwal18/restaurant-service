import type { EventBus } from "@rm/events";
import { Topics } from "@rm/events";
import type { PaymentsRepository, PaymentRow } from "./payments.repository.js";
import type { CapturePaymentBody } from "./payments.validation.js";

export class PaymentsService {
  constructor(
    private readonly repo: PaymentsRepository,
    private readonly bus: EventBus
  ) {}

  async capturePayment(tenantId: string, body: CapturePaymentBody): Promise<PaymentRow> {
    const payment = await this.repo.createCapturedPayment(tenantId, body);

    await this.bus.publish(Topics.PaymentCaptured, {
      id: payment.id,
      topic: Topics.PaymentCaptured,
      ts: payment.createdAt.toISOString(),
      tenantId,
      payload: {
        orderId: body.orderId,
        paymentId: payment.id,
        amount: payment.amount.toString(),
      },
    });

    return payment;
  }
}
