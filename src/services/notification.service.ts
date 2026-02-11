import { NotifmeSdkType } from "../config/notifme";
import { logger } from "../utils/logger";
import { withRetry } from "../utils/retry";

export interface SendSMSRequest {
  from: string;
  to: string;
  text: string;
  correlationId: string;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class NotificationService {
  constructor(private notifme: NotifmeSdkType) {}

  async sendSMS(request: SendSMSRequest): Promise<SendResult> {
    const { correlationId, from, to, text } = request;

    logger.info("Sending SMS", { correlationId, from, to });

    try {
      const result = await withRetry(
        () => this.notifme.send({ sms: { from, to, text } }),
        { maxRetries: 3, initialDelayMs: 500 }
      );

      const messageId = result?.channels?.sms?.id?.id;

      if (!messageId) {
        logger.error("SMS send failed - no messageId in response", { correlationId, result });
        return { success: false, error: "No messageId returned from provider" };
      }

      logger.info("SMS sent successfully", { correlationId, messageId });
      return { success: true, messageId };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("Failed to send SMS", { correlationId, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }
}
