export interface InboundSmsReply {
  direction: 'inbound';
  text: string;
  receivedAt: string;
  media: InboundMediaAttachment[];
}

export interface InboundMediaAttachment {
  url?: string;
  contentType?: string;
  size?: number;
}

export interface InboundSmsMessage {
  eventType: 'InboundSMS';
  timestamp: string;
  id: string;
  reply: InboundSmsReply;
  from: string;
  to: string;
}
