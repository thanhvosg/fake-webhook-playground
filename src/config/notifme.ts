import NotifmeSdk from "notifme-sdk";
import { env } from "./env";

export function createNotifmeSdk() {
  return new NotifmeSdk({
    channels: {
      sms: {
        providers: [{
          type: "custom",
          id: "telnyx",
          send: async (request: { to: string; text: string }) => {
            const response = await fetch(env.TELNYX_API_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${env.TELNYX_API_KEY}`,
              },
              body: JSON.stringify({
                from: env.TELNYX_MESSAGING_PROFILE_ID,
                to: request.to,
                text: request.text,
              }),
            });

            if (!response.ok) {
              const error = await response.text();
              throw new Error(`Telnyx API error: ${error}`);
            }

            const data = await response.json() as { data: { id: string } };
            return { id: data.data.id };
          },
        }],
      },
      email: env.EMAIL_PROVIDER ? {
        providers: [{
          type: "custom",
          id: env.EMAIL_PROVIDER,
          send: async (request: { to: string; subject: string; html: string; text?: string }) => {
            if (env.EMAIL_PROVIDER === "sendgrid" && env.SENDGRID_API_KEY) {
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
            throw new Error("Email provider not configured");
          },
        }],
      } : undefined,
    },
  });
}

export type NotifmeSdkType = ReturnType<typeof createNotifmeSdk>;
