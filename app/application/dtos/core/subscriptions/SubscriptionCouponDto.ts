export interface SubscriptionCouponDto {
  name: string;
  amountOff?: number;
  percentOff?: number;
  currency: string;
  valid: boolean;
  timesRedeemed?: number;
  maxRedemptions?: number;
}
