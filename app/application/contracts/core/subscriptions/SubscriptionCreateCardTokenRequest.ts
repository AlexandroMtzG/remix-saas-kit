export interface SubscriptionCreateCardTokenRequest {
  number: string;
  expiryMonth: number;
  expiryYear: number;
  cvc: string;
}
