import type { Prisma, PrismaClient } from "@prisma/client";

export type PaymentRow = Prisma.PaymentGetPayload<{}>;

export class PaymentsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createCapturedPayment(
    tenantId: string,
    input: { orderId: string; method: "ONLINE" | "CARD" | "UPI"; amount: number }
  ): Promise<PaymentRow> {
    return this.prisma.payment.create({
      data: {
        tenantId,
        orderId: input.orderId,
        method: input.method,
        status: "CAPTURED",
        amount: input.amount,
        provider: "stub",
      },
    });
  }
}
