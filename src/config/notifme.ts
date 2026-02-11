import NotifmeSdk from "notifme-sdk";
import { env } from "./env";
import { logger } from "../utils/logger";

interface TelnyxRequest {
  from: string;
  to: string;
  text: string;
}

interface SendGridRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendTelnyxSMS(request: TelnyxRequest): Promise<{ id: string }> {
  const response = await fetch(env.TELNYX_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.TELNYX_API_KEY}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error("Telnyx API error", { status: response.status, error });
    throw new Error(`Telnyx API error: ${error}`);
  }

  const data = await response.json() as { data: { id: string } };
  logger.info("Telnyx SMS sent", { messageId: data.data.id, to: request.to });

  return { id: data.data.id };
}

async function sendSendGridEmail(request: SendGridRequest): Promise<{ id?: string }> {
  const response = await fetch(env.SENDGRID_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.SENDGRID_API_KEY}`,
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: request.to }] }],
      from: { email: env.EMAIL_FROM },
      subject: request.subject,
      content: [
        { type: "text/plain", value: request.text || "" },
        { type: "text/html", value: request.html },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid API error: ${error}`);
  }

  return { id: response.headers.get("x-message-id") || undefined };
}

function createSMSProvider() {
  return {
    type: "custom" as const,
    id: "telnyx",
    send: sendTelnyxSMS,
  };
}

function createEmailProvider() {
  if (!env.EMAIL_PROVIDER) return undefined;

  return {
    type: "custom" as const,
    id: env.EMAIL_PROVIDER,
    send: sendSendGridEmail,
  };
}

export function createNotifmeSdk() {
  const emailProvider = createEmailProvider();
  return new NotifmeSdk({
    channels: {
      sms: { providers: [createSMSProvider()] },
      email: emailProvider ? { providers: [emailProvider] } : undefined,
    },
  });
}

export type NotifmeSdkType = ReturnType<typeof createNotifmeSdk>;
