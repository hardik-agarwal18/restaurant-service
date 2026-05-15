import type { Prisma, PrismaClient } from "@prisma/client";

export type PaymentRow = Prisma.PaymentGetPayload<{}>;

export class PosRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createCapturedPayment(
    tenantId: string,
    input: { orderId: string; method: PosMethod; amount: number }
  ): Promise<PaymentRow> {
    return this.prisma.payment.create({
      data: {
        tenantId,
        orderId: input.orderId,
        method: input.method,
        status: "CAPTURED",
        amount: input.amount,
      },
    });
  }
}

export type PosMethod = "CASH" | "CARD" | "UPI" | "WALLET" | "ONLINE";
