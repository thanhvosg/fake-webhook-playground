import amqp, { Connection, Channel } from "amqplib";
import { env } from "./env";
import { logger } from "../utils/logger";

export const EXCHANGE_NAME = "messages.exchange";

export const QUEUES = {
  SMS_OUTBOUND: "sms_outbound.queue",
  SMS_INBOUND: "sms_inbound.queue",
  LEAD_RECEIVE: "lead_receive.queue",
} as const;

export const ROUTING_KEYS = {
  SMS_OUTBOUND: "sms_outbound_message",
  SMS_INBOUND: "sms_inbound_message",
  LEAD_RECEIVE: "lead_receive",
} as const;

export interface RabbitMQConnection {
  connection: Connection;
  channel: Channel;
}

async function checkQueueExists(channel: Channel, queue: string): Promise<boolean> {
  try {
    await channel.checkQueue(queue);
    return true;
  } catch {
    return false;
  }
}

export async function connectRabbitMQ(): Promise<RabbitMQConnection> {
  const protocol = env.RABBITMQ_USE_SSL === "true" ? "amqps" : "amqp";
  const url = `${protocol}://${env.RABBITMQ_USERNAME}:${env.RABBITMQ_PASSWORD}@${env.RABBITMQ_HOST}:${env.RABBITMQ_PORT}${env.RABBITMQ_VHOST}`;

  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });

  for (const queue of Object.values(QUEUES)) {
    const exists = await checkQueueExists(channel, queue);
    if (!exists) {
      await channel.assertQueue(queue, { durable: true });
    } else {
      logger.info("Queue already exists, skipping creation", { queue });
    }
  }

  await channel.bindQueue(QUEUES.SMS_OUTBOUND, EXCHANGE_NAME, ROUTING_KEYS.SMS_OUTBOUND);
  await channel.bindQueue(QUEUES.SMS_INBOUND, EXCHANGE_NAME, ROUTING_KEYS.SMS_INBOUND);
  await channel.bindQueue(QUEUES.LEAD_RECEIVE, EXCHANGE_NAME, ROUTING_KEYS.LEAD_RECEIVE);

  logger.info("RabbitMQ connected and exchanges/queues configured");

  return { connection, channel };
}
