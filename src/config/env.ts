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

  RABBITMQ_EXCHANGE_NAME: z.string().default("messages.exchange"),

  RABBITMQ_QUEUE_SMS_OUTBOUND: z.string().default("sms_outbound.queue"),
  RABBITMQ_QUEUE_SMS_INBOUND: z.string().default("sms_inbound.queue"),
  RABBITMQ_QUEUE_LEAD_RECEIVE: z.string().default("lead_receive.queue"),

  RABBITMQ_ROUTING_KEY_SMS_OUTBOUND: z.string().default("sms_outbound_message"),
  RABBITMQ_ROUTING_KEY_SMS_INBOUND: z.string().default("sms_inbound_message"),
  RABBITMQ_ROUTING_KEY_LEAD_RECEIVE: z.string().default("lead_receive"),

  EMAIL_PROVIDER: z.enum(["sendgrid", "mailgun", "ses"]).optional(),
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_API_URL: z.string().default("https://api.sendgrid.com/v3/mail/send"),
  EMAIL_FROM: z.string().email().optional(),

  SMS_PROVIDER: z.enum(["telnyx"]).default("telnyx"),
  TELNYX_API_KEY: z.string(),
  TELNYX_API_URL: z.string().default("https://api.telnyx.com/v2/messages"),
  TELNYX_PUBLIC_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
