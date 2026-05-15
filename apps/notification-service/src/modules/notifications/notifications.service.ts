import type { Queue } from "bullmq";
import type { EventEnvelope } from "@rm/events";
import { z } from "zod";
import { OrderCreatedPayloadSchema } from "@rm/events";

type OrderCreatedPayload = z.infer<typeof OrderCreatedPayloadSchema>;

export class NotificationsService {
  constructor(
    private readonly deps: {
      emailQueue: Queue;
      smsQueue: Queue;
    }
  ) {}

  async onOrderCreated(evt: EventEnvelope<OrderCreatedPayload>): Promise<void> {
    await this.deps.emailQueue.add("order-created", {
      tenantId: evt.tenantId,
      orderId: evt.payload.orderId,
    });
  }

  async enqueueTestSms(to: string): Promise<void> {
    await this.deps.smsQueue.add("test", { to, message: "Hello" });
  }
}
