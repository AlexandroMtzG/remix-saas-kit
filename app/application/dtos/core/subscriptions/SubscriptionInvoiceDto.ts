import { SubscriptionInvoiceLineDto } from "./SubscriptionInvoiceLineDto";

export interface SubscriptionInvoiceDto {
  created: Date;
  invoicePdf: string;
  lines: SubscriptionInvoiceLineDto[];
}
