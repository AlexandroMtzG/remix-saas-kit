import { json, redirect, useMatches } from "remix";
import { Language } from "remix-i18next";
import { TenantUserRole } from "~/application/enums/core/tenants/TenantUserRole";
import { createUserSession, getUserInfo } from "../session.server";
import { getMyTenants, getTenant } from "../db/tenants.db.server";
import { i18n } from "~/locale/i18n.server";
import { getWorkspaceUser, getWorkspace, getMyWorkspaces } from "../db/workspaces.db.server";
import { getUser } from "../db/users.db.server";
import { SubscriptionPrice, SubscriptionProduct } from "@prisma/client";
import { getSubscriptionPriceByStripeId } from "../db/subscriptionProducts.db.server";
import { getStripeSubscription } from "../stripe.server";
import { getLinksCount } from "../db/links.db.server";
import { LinkStatus } from "~/application/enums/core/links/LinkStatus";

export type AppLoaderData = {
  i18n: Record<string, Language>;
  user: Awaited<ReturnType<typeof getUser>>;
  myTenants: Awaited<ReturnType<typeof getMyTenants>>;
  currentTenant: Awaited<ReturnType<typeof getTenant>>;
  myWorkspaces: Awaited<ReturnType<typeof getMyWorkspaces>>;
  currentWorkspace: Awaited<ReturnType<typeof getWorkspace>>;
  mySubscription: (SubscriptionPrice & { subscriptionProduct: SubscriptionProduct }) | null;
  currentRole: TenantUserRole;
  isOwnerOrAdmin: boolean;
  pendingInvitations: number;
};

export function useAppData(): AppLoaderData {
  return (useMatches().find((f) => f.pathname === "/app" || f.pathname === "/admin")?.data ?? {}) as AppLoaderData;
}

export async function loadAppData(request: Request) {
  if (new URL(request.url).pathname === "/app") {
    throw redirect("/app/dashboard");
  }
  const userInfo = await getUserInfo(request);
  const user = await getUser(userInfo?.userId);
  const redirectTo = new URL(request.url).pathname;
  if (!userInfo || !user) {
    let searchParams = new URLSearchParams([["redirect", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  const currentWorkspaceMembership = await getWorkspaceUser(userInfo.currentWorkspaceId, userInfo.userId);
  if (!currentWorkspaceMembership) {
    // No longer a workspace member
    userInfo.currentWorkspaceId = "";
    const userWorkspaces = await getMyWorkspaces(userInfo.userId, userInfo.currentTenantId);
    if (userWorkspaces.length > 0) {
      userInfo.currentWorkspaceId = userWorkspaces[0].workspace.id;
    }
    throw createUserSession(userInfo, redirectTo);
  }

  const currentTenant = await getTenant(userInfo?.currentTenantId);
  const currentWorkspace = await getWorkspace(userInfo?.currentWorkspaceId);
  const myTenants = await getMyTenants(user.id);
  const myWorkspaces = await getMyWorkspaces(user.id, currentTenant?.id);
  const tenantMembership = myTenants.find((f) => f.tenantId === userInfo?.currentTenantId);

  const stripeSubscription = await getStripeSubscription(currentTenant?.subscriptionId ?? "");
  let mySubscription: (SubscriptionPrice & { subscriptionProduct: SubscriptionProduct }) | null = null;
  if (stripeSubscription && stripeSubscription?.items.data.length > 0) {
    mySubscription = await getSubscriptionPriceByStripeId(stripeSubscription?.items.data[0].plan.id);
  }

  const currentRole = tenantMembership?.role ?? TenantUserRole.GUEST;
  const isOwnerOrAdmin = currentRole == TenantUserRole.OWNER || currentRole == TenantUserRole.ADMIN;

  const pendingInvitations = await getLinksCount(userInfo.currentWorkspaceId, [LinkStatus.PENDING]);
  const data: AppLoaderData = {
    i18n: await i18n.getTranslations(request, ["translations"]),
    user,
    myTenants,
    currentTenant,
    myWorkspaces,
    currentWorkspace,
    currentRole,
    mySubscription,
    isOwnerOrAdmin,
    pendingInvitations,
  };
  return data;
}
