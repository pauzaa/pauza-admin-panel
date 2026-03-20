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
  purchase_date: number; // Unix ms
  expires_date: number | null; // Unix ms
  grace_period_expires_date: number | null; // Unix ms
}

export interface RCSubscriberDetail {
  app_user_id: string;
  entitlements: readonly RCSubscriberEntitlement[];
}
