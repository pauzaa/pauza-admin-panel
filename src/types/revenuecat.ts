export type RCChartName = 'revenue' | 'customers_new' | 'customers_active' | 'churn';

export interface RCOverview {
  mrr: number; // cents
  arr: number; // cents
  active_subscribers: number;
  active_trials: number;
}

export interface RCChartPoint {
  date: string; // YYYY-MM-DD
  value: number;
}

export interface RCChartResponse {
  name: RCChartName;
  data: readonly RCChartPoint[];
}

export interface RCSubscriberEntitlement {
  entitlement_id: string;
  is_active: boolean;
  product_identifier: string;
  purchase_date: string; // RFC 3339
  expires_date: string | null; // RFC 3339
  grace_period_expires_date: string | null; // RFC 3339
}

export interface RCSubscriberDetail {
  app_user_id: string;
  entitlements: readonly RCSubscriberEntitlement[];
}
