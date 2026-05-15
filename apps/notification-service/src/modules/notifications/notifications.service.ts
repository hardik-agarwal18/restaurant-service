import type { Queue } from "bullmq";
import type { OrderCreatedPayload } from "@rm/events";

export class NotificationsService {
  constructor(
    private readonly deps: {
      emailQueue: Queue;
      smsQueue: Queue;
    }
  ) {}

  async onOrderCreated(evt: OrderCreatedPayload): Promise<void> {
    await this.deps.emailQueue.add("order-created", {
      tenantId: evt.tenantId,
      orderId: evt.payload.orderId,
    });
  }

  async enqueueTestSms(to: string): Promise<void> {
    await this.deps.smsQueue.add("test", { to, message: "Hello" });
  }
}
