import { SubscriptionPriceDto } from "./SubscriptionPriceDto";
import { SubscriptionFeatureDto } from "./SubscriptionFeatureDto";

export interface SubscriptionProductDto {
  id?: string;
  stripeId: string;
  tier: number;
  title: string;
  description: string;
  badge: string;
  active: boolean;
  contactUs: boolean;
  maxWorkspaces: number;
  maxUsers: number;
  maxLinks: number;
  maxStorage: number;
  monthlyContracts: number;
  prices: SubscriptionPriceDto[];
  features: SubscriptionFeatureDto[];
}
