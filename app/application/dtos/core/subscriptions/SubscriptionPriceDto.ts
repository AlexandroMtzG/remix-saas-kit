import { SubscriptionProductDto } from "./SubscriptionProductDto";
import { SubscriptionPlanDto } from "./SubscriptionPlanDto";
import { SubscriptionPriceType } from "~/application/enums/core/subscriptions/SubscriptionPriceType";
import { SubscriptionBillingPeriod } from "~/application/enums/core/subscriptions/SubscriptionBillingPeriod";

export interface SubscriptionPriceDto {
  id?: string;
  stripeId: string;
  type: SubscriptionPriceType;
  billingPeriod: SubscriptionBillingPeriod;
  price: number;
  currency: string;
  trialDays: number;
  active: boolean;
  priceBefore?: number;
  subscriptionProductId: string;
  subscriptionProduct?: SubscriptionProductDto;
  subscriptionPlan?: SubscriptionPlanDto;
}
