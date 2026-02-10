import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { env } from "../../config/env";
import { logger } from "../../utils/logger";

export function validateTelnyxSignature(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const signature = req.headers["x-telnyx-signature"] as string;
    const timestamp = req.headers["x-telnyx-timestamp"] as string;

    if (!signature || !timestamp) {
      res.status(401).json({ error: "Missing signature headers" });
      return;
    }

    const payload = `${timestamp}|${JSON.stringify(req.body)}`;
    const expectedSignature = crypto
      .createHmac("sha256", env.WEBHOOK_SECRET)
      .update(payload)
      .digest("base64");

    if (signature !== expectedSignature) {
      logger.warn("Invalid webhook signature", { signature, timestamp });
      res.status(401).json({ error: "Invalid signature" });
      return;
    }

    next();
  } catch (error) {
    logger.error("Error validating signature", { error: String(error) });
    res.status(500).json({ error: "Signature validation failed" });
  }
}
