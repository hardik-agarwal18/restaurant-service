import type { EventBus } from "@rm/events";
import { OrderCreatedPayloadSchema, Topics } from "@rm/events";
import type { NotificationsService } from "./notifications.service.js";

export async function registerNotificationSubscriptions(
  bus: EventBus,
  service: NotificationsService
): Promise<void> {
  await bus.subscribe(Topics.OrderCreated, OrderCreatedPayloadSchema, async (evt) => {
    await service.onOrderCreated(evt);
  });
}
