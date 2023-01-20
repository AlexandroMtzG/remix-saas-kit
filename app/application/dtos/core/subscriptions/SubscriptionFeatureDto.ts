import { SubscriptionProductDto } from "./SubscriptionProductDto";

export interface SubscriptionFeatureDto {
  order: number;
  subscriptionProductId: string;
  subscriptionProduct?: SubscriptionProductDto;
  key: string;
  value: string;
  included: boolean;
}
