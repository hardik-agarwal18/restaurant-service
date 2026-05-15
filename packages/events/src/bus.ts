import { Redis } from "ioredis";
import type { ZodType } from "zod";
import { z } from "zod";
import type { Logger } from "@rm/platform";

export type EventEnvelope<TPayload> = {
  id: string;
  topic: string;
  ts: string;
  tenantId: string;
  payload: TPayload;
};

const EnvelopeSchema = z.object({
  id: z.string().min(1),
  topic: z.string().min(1),
  ts: z.string().min(1),
  tenantId: z.string().min(1),
  payload: z.unknown(),
});

export class EventBus {
  private pub: Redis;
  private sub: Redis;
  private logger: Logger;

  constructor(redisUrl: string, logger: Logger) {
    this.pub = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: null });
    this.sub = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: null });
    this.logger = logger;
  }

  async connect() {
    await Promise.all([this.pub.connect(), this.sub.connect()]);
  }

  async disconnect() {
    await Promise.all([this.pub.quit(), this.sub.quit()]);
  }

  async publish<TPayload>(channel: string, envelope: EventEnvelope<TPayload>) {
    await this.pub.publish(channel, JSON.stringify(envelope));
  }

  async subscribe<TPayload>(
    channel: string,
    payloadSchema: ZodType<TPayload>,
    handler: (envelope: EventEnvelope<TPayload>) => Promise<void>
  ): Promise<void> {
    this.sub.on("message", (ch, message) => {
      if (ch !== channel) return;
      try {
        const parsed = EnvelopeSchema.parse(JSON.parse(message));
        const payload = payloadSchema.parse(parsed.payload);
        const envelope: EventEnvelope<TPayload> = {
          id: parsed.id,
          topic: parsed.topic,
          ts: parsed.ts,
          tenantId: parsed.tenantId,
          payload,
        };

        void handler(envelope).catch((err) => {
          this.logger.error({ err, channel }, "event handler failed");
        });
      } catch (err) {
        this.logger.warn({ err, channel }, "invalid event message");
      }
    });
    await this.sub.subscribe(channel);
  }
}
