import { Router, Request, Response } from "express";
import { WebhookHandler } from "../handlers/webhook.handler";
import { PublisherService } from "../services/publisher.service";
import { Channel } from "amqplib";

let webhookHandler: WebhookHandler | null = null;

export function setWebhookDependencies(publisherService: PublisherService): void {
  webhookHandler = new WebhookHandler(publisherService);
}

export function createRoutes(): Router {
  const router = Router();

  router.post("/webhooks/telnyx", (req: Request, res: Response) => {
    if (!webhookHandler) {
      res.status(503).json({ error: "Webhook handler not initialized" });
      return;
    }
    webhookHandler.handleTelnyxWebhook(req, res);
  });

  return router;
}
