import type { Prisma, PrismaClient } from "@prisma/client";

export type DeliveryRow = Prisma.DeliveryGetPayload<{}>;

export class DeliveryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsertAssignment(
    tenantId: string,
    input: {
      orderId: string;
      partner?: string;
      riderName?: string;
      riderPhone?: string;
    }
  ): Promise<DeliveryRow> {
    return this.prisma.delivery.upsert({
      where: { orderId: input.orderId },
      update: {
        tenantId,
        partner: input.partner,
        riderName: input.riderName,
        riderPhone: input.riderPhone,
      },
      create: {
        tenantId,
        orderId: input.orderId,
        partner: input.partner,
        riderName: input.riderName,
        riderPhone: input.riderPhone,
      },
    });
  }
}
