import type { EventBus } from "@rm/events";
import type { OutboxRepository } from "./outbox.repository.js";

export class OutboxService {
  constructor(
    private readonly repo: OutboxRepository,
    private readonly bus: EventBus
  ) {}

  async publishBatch(tenantId: string, limit = 50): Promise<number> {
    const batch = await this.repo.listUnpublished(tenantId, limit);

    for (const evt of batch) {
      await this.bus.publish<unknown>(evt.topic, {
        id: evt.id,
        topic: evt.topic,
        ts: evt.createdAt.toISOString(),
        tenantId: evt.tenantId,
        payload: evt.payload,
      });
      await this.repo.markPublished(evt.id, new Date());
    }

    return batch.length;
  }
}
