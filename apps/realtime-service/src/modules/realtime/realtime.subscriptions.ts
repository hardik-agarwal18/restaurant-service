import type { EventBus } from "@rm/events";
import { OrderCreatedPayloadSchema, Topics } from "@rm/events";
import type { RealtimeService } from "./realtime.service.js";

export async function registerRealtimeSubscriptions(
  bus: EventBus,
  service: RealtimeService
): Promise<void> {
  await bus.subscribe(Topics.OrderCreated, OrderCreatedPayloadSchema, async (evt) => {
    service.onOrderCreated(evt);
  });
}
