import { z } from "zod";

export const PosPayBodySchema = z.object({
  orderId: z.string().min(1),
  method: z.enum(["CASH", "CARD", "UPI", "WALLET", "ONLINE"]),
  amount: z.number().positive(),
});

export type PosPayBody = z.infer<typeof PosPayBodySchema>;
