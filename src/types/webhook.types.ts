/**
 * Telnyx Webhook Types
 * Based on Telnyx SMS/Messaging API webhook payloads
 */

export interface TelnyxWebhook {
  data: TelnyxWebhookData;
  meta: TelnyxWebhookMeta;
}

export interface TelnyxWebhookData {
  event_type: string;
  id: string;
  occurred_at: string;
  payload: TelnyxMessagePayload;
  record_type: string;
}

export interface TelnyxWebhookMeta {
  attempt: number;
  delivered_to: string;
}

export interface TelnyxMessagePayload {
  completed_at: string | null;
  cost: Cost;
  cost_breakdown: CostBreakdown;
  direction: 'inbound' | 'outbound';
  encoding: string;
  errors: MessageError[];
  from: PhoneNumberInfo;
  id: string;
  media: MediaAttachment[];
  messaging_profile_id: string;
  organization_id: string;
  parts: number;
  received_at: string | null;
  record_type: string;
  sent_at: string | null;
  tags: string[];
  text: string;
  to: PhoneNumberInfo[];
  type: 'SMS' | 'MMS';
  valid_until: string | null;
  webhook_failover_url: string | null;
  webhook_url: string | null;
}

export interface Cost {
  amount: string;
  currency: string;
}

export interface CostBreakdown {
  carrier_fee: Cost;
  rate: Cost;
}

export interface MessageError {
  code: string;
  title: string;
  detail: string;
}

export interface PhoneNumberInfo {
  carrier: string;
  line_type: string;
  phone_number: string;
  status: string;
}

export interface MediaAttachment {
  url: string;
  content_type: string;
  size: number;
}

/**
 * Event types for Telnyx webhooks
 */
export enum TelnyxEventType {
  MESSAGE_SENT = 'message.sent',
  MESSAGE_RECEIVED = 'message.received',
  MESSAGE_DELIVERED = 'message.delivered',
  MESSAGE_FAILED = 'message.sending_failed',
  MESSAGE_FINALIZED = 'message.finalized',
}

/**
 * Type guard to check if webhook is a message.received event
 */
export function isMessageReceivedEvent(webhook: TelnyxWebhook): boolean {
  return webhook.data.event_type === TelnyxEventType.MESSAGE_RECEIVED;
}

/**
 * Type guard to check if webhook is a message.delivered event
 */
export function isMessageDeliveredEvent(webhook: TelnyxWebhook): boolean {
  return webhook.data.event_type === TelnyxEventType.MESSAGE_DELIVERED;
}
