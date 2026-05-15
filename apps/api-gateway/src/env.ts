import { z } from "zod";
import { JwtEnvSchema } from "@rm/auth";

export const EnvSchema = JwtEnvSchema.extend({
  GATEWAY_PORT: z.coerce.number().int().positive().default(8080),
  REDIS_URL: z.string().min(1),
  AUTH_SERVICE_URL: z.string().min(1).default("http://auth-service:3001"),
  ORDER_SERVICE_URL: z.string().min(1).default("http://order-service:3002"),
  INVENTORY_SERVICE_URL: z.string().min(1).default("http://inventory-service:3003"),
  POS_SERVICE_URL: z.string().min(1).default("http://pos-service:3004"),
});

export type Env = z.infer<typeof EnvSchema>;
