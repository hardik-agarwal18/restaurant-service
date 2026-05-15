import type { Prisma, PrismaClient } from "@prisma/client";
import { Topics } from "@rm/events";

export type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

export type CreateOrderRepoInput = {
  tenantId: string;
  branchId: string;
  type: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  subtotal: Prisma.Decimal;
  taxTotal: Prisma.Decimal;
  grandTotal: Prisma.Decimal;
  items: Array<{
    menuItemId: string;
    nameSnapshot: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
    taxPercent: Prisma.Decimal;
    total: Prisma.Decimal;
  }>;
};

export class OrdersRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createOrderWithOutbox(input: CreateOrderRepoInput): Promise<OrderWithItems> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          tenantId: input.tenantId,
          branchId: input.branchId,
          type: input.type,
          status: "CREATED",
          subtotal: input.subtotal,
          taxTotal: input.taxTotal,
          grandTotal: input.grandTotal,
          items: {
            create: input.items.map((i) => ({
              tenantId: input.tenantId,
              menuItemId: i.menuItemId,
              nameSnapshot: i.nameSnapshot,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              taxPercent: i.taxPercent,
              total: i.total,
            })),
          },
        },
        include: { items: true },
      });

      await tx.outboxEvent.create({
        data: {
          tenantId: input.tenantId,
          topic: Topics.OrderCreated,
          payload: {
            orderId: order.id,
            branchId: order.branchId,
            grandTotal: order.grandTotal.toString(),
          },
        },
      });

      return order;
    });
  }
}
