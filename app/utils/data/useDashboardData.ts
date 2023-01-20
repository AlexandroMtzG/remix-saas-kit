import { json, useMatches } from "remix";
import { LinkStatus } from "~/application/enums/core/links/LinkStatus";
import { getEmployees, getEmployeesCount } from "../db/app/employees.db.server";
import { getContracts, getMonthlyContractsCount } from "../db/contracts.db.server";
import { getClientLinks, getClientLinksCount, getLinksCount, getProviderLinks, getProviderLinksCount } from "../db/links.db.server";
import { getTenantUsersCount } from "../db/tenants.db.server";
import { getWorkspacesCount } from "../db/workspaces.db.server";
import { getUserInfo } from "../session.server";

export type DashboardLoaderData = {
  users: number;
  workspaces: number;
  clients: number;
  providers: number;
  employees: number;
  contracts: number;
  storage: number;
  pendingInvitations: number;
};

export function useDashboardData(): DashboardLoaderData {
  return (useMatches().find((f) => f.pathname === "/app/dashboard" || f.pathname === "/admin")?.data ?? {}) as DashboardLoaderData;
}

export async function loadDashboardData(request: Request) {
  const userInfo = await getUserInfo(request);
  const data: DashboardLoaderData = {
    users: await getTenantUsersCount(userInfo.currentTenantId),
    workspaces: await getWorkspacesCount(userInfo.currentTenantId),
    clients: await getClientLinksCount(userInfo.currentTenantId),
    providers: await getProviderLinksCount(userInfo.currentTenantId),
    employees: await getEmployeesCount(userInfo.currentTenantId),
    contracts: await getMonthlyContractsCount(userInfo.currentTenantId),
    storage: 10, // TODO: Implement your own storage limit
    pendingInvitations: await getLinksCount(userInfo.currentWorkspaceId, [LinkStatus.PENDING]),
  };
  return data;
}
