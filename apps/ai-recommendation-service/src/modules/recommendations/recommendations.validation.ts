import { z } from "zod";

export const MenuRecommendationsBodySchema = z.object({
  tenantId: z.string().min(1),
  customerId: z.string().optional(),
});

export type MenuRecommendationsBody = z.infer<typeof MenuRecommendationsBodySchema>;
