import { z } from "zod";

export const OrderCreatedPayloadSchema = z.object({
  orderId: z.string().min(1),
  branchId: z.string().min(1),
  grandTotal: z.string().min(1),
});

export type OrderCreatedPayload = z.infer<typeof OrderCreatedPayloadSchema>;

export const PaymentCapturedPayloadSchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  amount: z.string().min(1),
});

export type PaymentCapturedPayload = z.infer<typeof PaymentCapturedPayloadSchema>;
