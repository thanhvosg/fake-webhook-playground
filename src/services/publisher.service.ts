import { Channel } from "amqplib";
import { EXCHANGE_NAME, ROUTING_KEYS } from "../config/rabbitmq";
import { logger } from "../utils/logger";

export class PublisherService {
  constructor(private channel: Channel) {}

  async publishInboundSMS(message: unknown): Promise<boolean> {
    try {
      const success = this.channel.publish(
        EXCHANGE_NAME,
        ROUTING_KEYS.SMS_INBOUND,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );

      if (success) {
        logger.info("Published inbound SMS to queue", { routingKey: ROUTING_KEYS.SMS_INBOUND });
      }

      return success;
    } catch (error) {
      logger.error("Failed to publish inbound SMS", { error: String(error) });
      return false;
    }
  }
}
