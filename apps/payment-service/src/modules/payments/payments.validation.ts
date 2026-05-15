import { z } from "zod";

export const CapturePaymentBodySchema = z.object({
  orderId: z.string().min(1),
  method: z.enum(["ONLINE", "CARD", "UPI"]),
  amount: z.number().positive(),
});

export type CapturePaymentBody = z.infer<typeof CapturePaymentBodySchema>;
