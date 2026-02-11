declare module "notifme-sdk" {
  interface SendResult {
    status?: string;
    channels?: {
      sms?: {
        id?: { id?: string };
        providerId?: string;
      };
      email?: {
        id?: { id?: string };
        providerId?: string;
      };
    };
    [key: string]: unknown;
  }

  interface NotifmeSdkConfig {
    channels: {
      sms?: {
        providers: Array<{
          type: string;
          id: string;
          send: (request: { from: string; to: string; text: string }) => Promise<{ id?: string }>;
        }>;
      };
      email?: {
        providers: Array<{
          type: string;
          id: string;
          send: (request: {
            to: string;
            subject: string;
            html: string;
            text?: string;
          }) => Promise<{ id?: string }>;
        }>;
      };
    };
  }

  class NotifmeSdk {
    constructor(config: NotifmeSdkConfig);
    send(request: {
      sms?: { from: string; to: string; text: string };
      email?: { to: string; subject: string; html: string; text?: string };
    }): Promise<SendResult>;
  }

  export = NotifmeSdk;
}
