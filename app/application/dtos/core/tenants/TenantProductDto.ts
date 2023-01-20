import { MasterEntityDto } from "../MasterEntityDto";
import { SubscriptionPriceDto } from "../subscriptions/SubscriptionPriceDto";
import { SubscriptionProductDto } from "../subscriptions/SubscriptionProductDto";
import { TenantDto } from "./TenantDto";

export interface TenantProductDto extends MasterEntityDto {
  tenantId: string;
  tenant: TenantDto;
  subscriptionPriceId: string;
  subscriptionPrice: SubscriptionPriceDto;
  active: boolean;
  subscriptionServiceId: string;
  cancelledAt?: Date;
  subscriptionProduct: SubscriptionProductDto;
  trialEnds?: Date;
  startDate: Date;
  endDate?: Date;
  maxWorkspaces: number;
  maxUsers: number;
  maxLinks: number;
  maxStorage: number;
  monthlyContracts: number;
}
