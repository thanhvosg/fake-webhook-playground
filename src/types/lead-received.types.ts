import type { Nullable } from './common.types';

export interface LeadReceivedMessage {
  eventType: 'LeadCreated';
  timestamp: string;
  leadId: number;
  customerId: Nullable<number>;
  ticketId: number;
  companyId: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  unit: Nullable<string>;
  title: string;
  description: string;
  crmId: number;
  crmLastSyncedAt: string;
  createdAt: string;
  updatedAt: Nullable<string>;
  updatedBy: Nullable<string>;
}
