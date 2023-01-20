import { SubscriptionCardDto } from "~/application/dtos/core/subscriptions/SubscriptionCardDto";
import { SubscriptionCustomerDto } from "~/application/dtos/core/subscriptions/SubscriptionCustomerDto";
import { SubscriptionInvoiceDto } from "~/application/dtos/core/subscriptions/SubscriptionInvoiceDto";
import { SubscriptionPaymentMethodDto } from "~/application/dtos/core/subscriptions/SubscriptionPaymentMethodDto";
import { TenantProductDto } from "~/application/dtos/core/tenants/TenantProductDto";

export interface SubscriptionGetCurrentResponse {
  activeProduct: TenantProductDto[];
  myProducts: TenantProductDto[];
  customer: SubscriptionCustomerDto;
  invoices: SubscriptionInvoiceDto[];
  cards: SubscriptionCardDto[];
  paymentMethods: SubscriptionPaymentMethodDto[];
}
