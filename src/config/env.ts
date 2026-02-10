import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("3000"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),

  RABBITMQ_HOST: z.string(),
  RABBITMQ_PORT: z.string().default("5672"),
  RABBITMQ_USERNAME: z.string(),
  RABBITMQ_PASSWORD: z.string(),
  RABBITMQ_VHOST: z.string().default("/"),
  RABBITMQ_USE_SSL: z.enum(["true", "false"]).default("false"),

  EMAIL_PROVIDER: z.enum(["sendgrid", "mailgun", "ses"]).optional(),
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_API_URL: z.string().default("https://api.sendgrid.com/v3/mail/send"),
  EMAIL_FROM: z.string().email().optional(),

  SMS_PROVIDER: z.enum(["telnyx"]).default("telnyx"),
  TELNYX_API_KEY: z.string(),
  TELNYX_API_URL: z.string().default("https://api.telnyx.com/v2/messages"),
  TELNYX_MESSAGING_PROFILE_ID: z.string(),
  TELNYX_PUBLIC_KEY: z.string(),

  WEBHOOK_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
