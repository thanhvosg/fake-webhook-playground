declare module "notifme-sdk" {
  interface SendResult {
    results: {
      sms?: { id?: string };
      email?: { id?: string };
    };
  }

  interface NotifmeSdkConfig {
    channels: {
      sms?: {
        providers: Array<{
          type: string;
          id: string;
          send: (request: { to: string; text: string }) => Promise<{ id?: string }>;
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
      sms?: { to: string; text: string };
      email?: { to: string; subject: string; html: string; text?: string };
    }): Promise<SendResult>;
  }

  export = NotifmeSdk;
}
