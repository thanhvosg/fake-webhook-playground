import { Request, Response } from "express";
import { PublisherService } from "../services/publisher.service";
import { TelnyxWebhook, TelnyxMessagePayload } from "../types/webhook.types";
import { InboundSmsMessage } from "../types/inbound-sms.types";
import { logger } from "../utils/logger";

export class WebhookHandler {
  constructor(private publisherService: PublisherService) {}

  async handleTelnyxWebhook(req: Request, res: Response): Promise<void> {
    try {
      const webhook = req.body as TelnyxWebhook;
      logger.info("Received Telnyx webhook", { eventType: webhook.data.event_type });

      if (webhook.data.event_type === "message.received") {
        const inboundMessage = this.transformToInboundMessage(webhook.data.payload);
        const published = await this.publisherService.publishInboundSMS(inboundMessage);

        if (!published) {
          logger.error("Failed to publish inbound message to queue", {
            correlationId: inboundMessage.correlationId,
            from: inboundMessage.from.phone,
          });
          res.status(500).json({ error: "Failed to queue message" });
          return;
        }

        logger.info("Successfully processed inbound SMS", {
          correlationId: inboundMessage.correlationId,
          from: inboundMessage.from.phone,
        });
      }

      res.status(200).json({ success: true });
    } catch (error) {
      logger.error("Error processing webhook", { error: String(error) });
      res.status(500).json({ error: "Failed to process webhook" });
    }
  }

  private transformToInboundMessage(payload: TelnyxMessagePayload): InboundSmsMessage {
    return {
      eventType: "InboundSMS",
      timestamp: new Date().toISOString(),
      correlationId: payload.id,
      leadId: 0,
      ticketId: 0,
      companyId: 0,
      customerId: null,
      reply: {
        direction: "inbound",
        text: payload.text,
        receivedAt: payload.received_at || new Date().toISOString(),
        media: payload.media || [],
      },
      from: {
        phone: payload.from.phone_number,
        firstName: "",
        lastName: "",
      },
      to: payload.to.map(t => ({
        phone: t.phone_number,
        type: "telnyxNumber",
      })),
      telnyx: {
        eventType: payload.direction === "inbound" ? "message.received" : "message.sent",
        webhookId: payload.id,
        messageId: payload.id,
        recordType: payload.record_type,
        messagingProfileId: payload.messaging_profile_id,
        organizationId: payload.organization_id,
        encoding: payload.encoding,
        parts: payload.parts,
        tags: payload.tags,
      },
      context: {
        eventType: "LeadCreated",
        title: "",
        description: "",
        location: {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
          unit: null,
        },
      },
    };
  }
}
