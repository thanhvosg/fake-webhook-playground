export type Nullable<T> = T | null;

export interface LeadLocation {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  unit: Nullable<string>;
}
