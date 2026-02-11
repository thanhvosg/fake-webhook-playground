export * from './common.types';
export * from './lead-received.types';
export * from './inbound-sms.types';
export * from './outbound-sms.types';
export * from './webhook.types';

import type { LeadReceivedMessage } from './lead-received.types';
import type { InboundSmsMessage } from './inbound-sms.types';
import type { OutboundSmsMessage } from './outbound-sms.types';

export type QueueMessage =
  | LeadReceivedMessage
  | InboundSmsMessage
  | OutboundSmsMessage;
