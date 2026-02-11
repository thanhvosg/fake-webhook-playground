import { Channel, ConsumeMessage } from "amqplib";
import { QUEUES } from "../config/rabbitmq";
import { NotificationService } from "../services/notification.service";
import { TemplateService } from "../services/template.service";
import { OutboundSmsMessage } from "../types/outbound-sms.types";
import { logger } from "../utils/logger";

const MAX_RETRIES = 3;

export class NotificationHandler {
  constructor(
    private channel: Channel,
    private notificationService: NotificationService,
    private templateService: TemplateService
  ) {}

  async startConsuming(): Promise<void> {
    await this.channel.consume(QUEUES.SMS_OUTBOUND, this.handleMessage.bind(this), { noAck: false });
    logger.info("Started consuming from outbound SMS queue", { queue: QUEUES.SMS_OUTBOUND });
  }

  private async handleMessage(msg: ConsumeMessage | null): Promise<void> {
    if (!msg) return;

    try {
      const content = this.parseMessage(msg);
      const result = await this.notificationService.sendSMS({
        from: content.message.from,
        to: content.recipient.phone,
        text: content.message.text,
        correlationId: content.correlationId,
      });

      result.success ? this.ack(msg) : this.retryOrDiscard(msg, result.error);

    } catch (error) {
      logger.error("Error processing outbound message", { error: String(error) });
      this.retryOrDiscard(msg, String(error));
    }
  }

  private parseMessage(msg: ConsumeMessage): OutboundSmsMessage {
    const content = JSON.parse(msg.content.toString()) as OutboundSmsMessage;
    logger.info("Received outbound SMS message", { correlationId: content.correlationId });
    return content;
  }

  private ack(msg: ConsumeMessage): void {
    this.channel.ack(msg);
  }

  private retryOrDiscard(msg: ConsumeMessage, error?: string): void {
    const retryCount = this.getRetryCount(msg);

    if (retryCount < MAX_RETRIES) {
      this.requeue(msg, retryCount + 1);
    } else {
      logger.error("Message failed after max retries", { error });
      this.ack(msg);
    }
  }

  private getRetryCount(msg: ConsumeMessage): number {
    return (msg.properties.headers?.["x-retry-count"] as number) || 0;
  }

  private requeue(msg: ConsumeMessage, retryCount: number): void {
    this.channel.nack(msg, false, false);
    this.channel.publish(msg.fields.exchange, msg.fields.routingKey, msg.content, {
      headers: { "x-retry-count": retryCount },
      persistent: true,
    });
  }
}
