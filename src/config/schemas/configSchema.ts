import { z } from "zod";

export const configSchema = z.object({
  RABBITMQ_URL: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().int().positive(),
});

export type ConfigSchema = z.infer<typeof configSchema>;
