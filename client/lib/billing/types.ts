export type PlanTier = 'beta' | 'solo' | 'starter' | 'professional' | 'enterprise';

export type SubscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused'
  | null;

export interface BillingPlan {
  id: PlanTier;
  name: string;
  tagline?: string;
  price_display: string;
  price_note: string;
  ideal_for: string;
  features: string[];
  emphasis: boolean;
  badge?: string;
  contact_sales?: boolean;
  no_payment_required?: boolean;
  checkout_available: boolean;
}

export interface SubscriptionState {
  has_subscription: boolean;
  is_active: boolean;
  needs_plan_selection: boolean;
  plan_tier: PlanTier | null;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export interface BillingStatusResponse {
  stripe_configured: boolean;
  subscription: SubscriptionState;
  plans: BillingPlan[];
  trial_days?: number;
}
