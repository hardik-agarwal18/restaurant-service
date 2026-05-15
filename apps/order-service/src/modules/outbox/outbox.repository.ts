import type { Prisma, PrismaClient } from "@prisma/client";

export type OutboxEventRow = Prisma.OutboxEventGetPayload<{}>;

export class OutboxRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listUnpublished(tenantId: string, limit: number): Promise<OutboxEventRow[]> {
    return this.prisma.outboxEvent.findMany({
      where: { publishedAt: null, tenantId },
      take: limit,
      orderBy: { createdAt: "asc" },
    });
  }

  async markPublished(eventId: string, publishedAt: Date): Promise<void> {
    await this.prisma.outboxEvent.update({
      where: { id: eventId },
      data: { publishedAt },
    });
  }
}
