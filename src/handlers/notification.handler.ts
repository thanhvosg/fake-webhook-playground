import { Channel, ConsumeMessage } from "amqplib";
import { QUEUES } from "../config/rabbitmq";
import { NotificationService } from "../services/notification.service";
import { TemplateService } from "../services/template.service";
import { OutboundSmsMessage } from "../types/outbound-sms.types";
import { logger } from "../utils/logger";

export class NotificationHandler {
  constructor(
    private channel: Channel,
    private notificationService: NotificationService,
    private templateService: TemplateService
  ) {}

  async startConsuming(): Promise<void> {
    await this.channel.consume(QUEUES.SMS_OUTBOUND, this.handleMessage.bind(this), {
      noAck: false,
    });

    logger.info("Started consuming from outbound SMS queue", { queue: QUEUES.SMS_OUTBOUND });
  }

  private async handleMessage(msg: ConsumeMessage | null): Promise<void> {
    if (!msg) return;

    try {
      const content = JSON.parse(msg.content.toString()) as OutboundSmsMessage;
      logger.info("Received outbound SMS message", { correlationId: content.correlationId });

      const result = await this.notificationService.sendSMS({
        to: content.recipient.phone,
        text: content.message.text,
        correlationId: content.correlationId,
      });

      if (result.success) {
        this.channel.ack(msg);
      } else {
        this.handleFailedMessage(msg, result.error || "Unknown error");
      }
    } catch (error) {
      logger.error("Error processing outbound message", { error: String(error) });
      this.handleFailedMessage(msg, String(error));
    }
  }

  private handleFailedMessage(msg: ConsumeMessage, error: string): void {
    const retryCount = (msg.properties.headers?.["x-retry-count"] as number) || 0;

    if (retryCount < 3) {
      this.channel.nack(msg, false, false);
      this.channel.publish(
        msg.fields.exchange,
        msg.fields.routingKey,
        msg.content,
        {
          headers: { "x-retry-count": retryCount + 1 },
          persistent: true,
        }
      );
    } else {
      logger.error("Message failed after max retries", { error });
      this.channel.ack(msg);
    }
  }
}
