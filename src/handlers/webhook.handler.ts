import { Request, Response } from "express";
import { PublisherService } from "../services/publisher.service";
import { TelnyxWebhook } from "../types/webhook.types";
import { InboundSmsMessage } from "../types/inbound-sms.types";
import { logger } from "../utils/logger";

export class WebhookHandler {
  constructor(private publisherService: PublisherService) {}

  async handleTelnyxWebhook(req: Request, res: Response): Promise<void> {
    try {
      const webhook = req.body as TelnyxWebhook;
      logger.info("Received Telnyx webhook", { eventType: webhook.data.event_type });

      if (webhook.data.event_type === "message.received") {
        const inboundMessage = this.transformToInboundMessage(webhook);
        const published = await this.publisherService.publishInboundSMS(inboundMessage);

        if (!published) {
          logger.error("Failed to publish inbound message to queue", {
            id: inboundMessage.id,
            from: inboundMessage.from,
          });
          res.status(500).json({ error: "Failed to queue message" });
          return;
        }

        logger.info("Successfully processed inbound SMS", {
          id: inboundMessage.id,
          from: inboundMessage.from,
        });
      }

      res.status(200).json({ success: true });
    } catch (error) {
      logger.error("Error processing webhook", { error: String(error) });
      res.status(500).json({ error: "Failed to process webhook" });
    }
  }

  private transformToInboundMessage(webhook: TelnyxWebhook): InboundSmsMessage {
    const { data } = webhook;
    const payload = data.payload;

    return {
      eventType: "InboundSMS",
      timestamp: data.occurred_at,
      id: `telnyx-${payload.id}`,
      reply: {
        direction: "inbound",
        text: payload.text,
        receivedAt: payload.received_at || data.occurred_at,
        media: payload.media || [],
      },
      from: payload.from.phone_number,
      to: payload.to[0].phone_number,
    };
  }
}
