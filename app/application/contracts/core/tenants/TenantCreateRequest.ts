import { SelectedSubscriptionRequest } from "../subscriptions/SelectedSubscriptionRequest";

export interface TenantCreateRequest {
  name: string;
  selectedSubscription: SelectedSubscriptionRequest;
  subdomain?: string;
}
