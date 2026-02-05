import type { Nullable } from './common.types';

export interface OutboundSmsRecipient {
  phone: string;
  firstName?: string;
  lastName?: string;
}

export interface OutboundSmsMessageContent {
  channel: 'sms';
  text: string;
  language: string;
}

export interface OutboundSmsContext {
  eventType: 'SmsReplyReceived';
  replyText: string;
  lead: OutboundSmsLeadContext;
}

export interface OutboundSmsLeadContext {
  leadId: number;
  title: string;
  city: string;
  state: string;
}

export interface OutboundSmsMessage {
  eventType: 'OutBoundSMS';
  timestamp: string;
  correlationId: string;
  leadId: number;
  ticketId: number;
  companyId: number;
  customerId: Nullable<number>;
  recipient: OutboundSmsRecipient;
  message: OutboundSmsMessageContent;
  context: OutboundSmsContext;
}
