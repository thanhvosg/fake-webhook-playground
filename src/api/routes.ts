import { Router, Request, Response } from "express";
import { WebhookHandler } from "../handlers/webhook.handler";
import { PublisherService } from "../services/publisher.service";

export function createRoutes(publisherService: PublisherService): Router {
  const router = Router();
  const webhookHandler = new WebhookHandler(publisherService);

  router.post("/webhooks/telnyx", (req: Request, res: Response) => {
    webhookHandler.handleTelnyxWebhook(req, res);
  });

  return router;
}
