export interface SubscriptionInvoiceLineDto {
  description: string;
  planName: string;
  planInterval: string;
  planCurrency: string;
  priceUnitAmount?: number;
  priceType: string;
}
