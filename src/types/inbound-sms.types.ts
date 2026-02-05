import type { LeadLocation, Nullable } from './common.types';

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

export interface InboundSmsParty {
  phone: string;
  firstName?: string;
  lastName?: string;
  type?: string;
}

export interface InboundSmsTelnyxMeta {
  eventType: string;
  webhookId: string;
  messageId: string;
  recordType: string;
  messagingProfileId: string;
  organizationId: string;
  encoding: string;
  parts: number;
  tags: string[];
}

export interface InboundSmsContext {
  eventType: 'LeadCreated';
  title: string;
  description: string;
  location: LeadLocation;
}

export interface InboundSmsMessage {
  eventType: 'InboundSMS';
  timestamp: string;
  correlationId: string;
  leadId: number;
  ticketId: number;
  companyId: number;
  customerId: Nullable<number>;
  reply: InboundSmsReply;
  from: InboundSmsParty;
  to: InboundSmsParty[];
  telnyx: InboundSmsTelnyxMeta;
  context: InboundSmsContext;
}
