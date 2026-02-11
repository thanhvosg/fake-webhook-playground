import amqp, { ChannelModel, Channel } from "amqplib";
import { env } from "./env";
import { logger } from "../utils/logger";

export const EXCHANGE_NAME = env.RABBITMQ_EXCHANGE_NAME;

export const QUEUES = {
  SMS_OUTBOUND: env.RABBITMQ_QUEUE_SMS_OUTBOUND,
  SMS_INBOUND: env.RABBITMQ_QUEUE_SMS_INBOUND,
  LEAD_RECEIVE: env.RABBITMQ_QUEUE_LEAD_RECEIVE,
} as const;

export const ROUTING_KEYS = {
  SMS_OUTBOUND: env.RABBITMQ_ROUTING_KEY_SMS_OUTBOUND,
  SMS_INBOUND: env.RABBITMQ_ROUTING_KEY_SMS_INBOUND,
  LEAD_RECEIVE: env.RABBITMQ_ROUTING_KEY_LEAD_RECEIVE,
} as const;

export interface RabbitMQConnection {
  connection: ChannelModel;
  channel: Channel;
}

function buildConnectionUrl(): string {
  const protocol = env.RABBITMQ_USE_SSL === "true" ? "amqps" : "amqp";
  const { RABBITMQ_USERNAME, RABBITMQ_PASSWORD, RABBITMQ_HOST, RABBITMQ_PORT, RABBITMQ_VHOST } = env;
  return `${protocol}://${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}${RABBITMQ_VHOST}`;
}

async function checkQueueExists(channel: Channel, queue: string): Promise<boolean> {
  try {
    await channel.checkQueue(queue);
    return true;
  } catch {
    return false;
  }
}

async function setupQueue(channel: Channel, queue: string): Promise<void> {
  const exists = await checkQueueExists(channel, queue);
  if (exists) {
    logger.info("Queue already exists, skipping creation", { queue });
    return;
  }
  await channel.assertQueue(queue, { durable: true });
}

async function bindQueues(channel: Channel): Promise<void> {
  const bindings = [
    { queue: QUEUES.SMS_OUTBOUND, key: ROUTING_KEYS.SMS_OUTBOUND },
    { queue: QUEUES.SMS_INBOUND, key: ROUTING_KEYS.SMS_INBOUND },
    { queue: QUEUES.LEAD_RECEIVE, key: ROUTING_KEYS.LEAD_RECEIVE },
  ];

  for (const { queue, key } of bindings) {
    await channel.bindQueue(queue, EXCHANGE_NAME, key);
  }
}

export async function connectRabbitMQ(): Promise<RabbitMQConnection> {
  const connection = await amqp.connect(buildConnectionUrl());
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });

  for (const queue of Object.values(QUEUES)) {
    await setupQueue(channel, queue);
  }

  await bindQueues(channel);

  logger.info("RabbitMQ connected and exchanges/queues configured");

  return { connection, channel };
}
