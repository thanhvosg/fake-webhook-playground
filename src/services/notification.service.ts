import { NotifmeSdkType } from "../config/notifme";
import { logger } from "../utils/logger";
import { withRetry } from "../utils/retry";

export interface SendSMSRequest {
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
    logger.info("Sending SMS", { correlationId: request.correlationId, to: request.to });

    try {
      const result = await withRetry(
        () => this.notifme.send({
          sms: {
            to: request.to,
            text: request.text,
          },
        }),
        { maxRetries: 3, initialDelayMs: 500 }
      );

      logger.info("SMS sent successfully", {
        correlationId: request.correlationId,
        messageId: result.results.sms?.id,
      });

      return {
        success: true,
        messageId: result.results.sms?.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("Failed to send SMS", {
        correlationId: request.correlationId,
        error: errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
