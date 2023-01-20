import { AppUsageType } from "~/application/enums/app/usages/AppUsageType";

export interface AppUsageSummaryDto {
  type: AppUsageType;
  providers: number;
  clients: number;
  employees: number;
  contracts: number;
  storage: number;
  pendingInvitations: number;
}
