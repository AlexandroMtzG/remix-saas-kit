import { json } from "remix";
import { TenantUserRole } from "~/application/enums/core/tenants/TenantUserRole";
import { WorkspaceType } from "~/application/enums/core/tenants/WorkspaceType";
import { createTenant, createTenantUser } from "../db/tenants.db.server";
import { getUser, updateUserDefaultWorkspaceId, updateUserPassword } from "../db/users.db.server";
import { createWorkspace, createWorkspaceUser, getMyWorkspaces } from "../db/workspaces.db.server";
import { getUserInfo, createUserSession, setLoggedUser } from "../session.server";
import { createStripeCustomer } from "../stripe.server";

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export async function useAppAction(request: Request, redirect?: string) {
  let userInfo = await getUserInfo(request);
  if (!userInfo) {
    return null;
  }
  const form = await request.formData();
  const redirectTo = form.get("redirectTo")?.toString() || redirect || "/app/dashboard";
  const type = form.get("type")?.toString();
  if (type === "set-tenant") {
    const tenantId = form.get("tenantId")?.toString() ?? "";
    userInfo.currentTenantId = tenantId;
    const userWorkspaces = await getMyWorkspaces(userInfo.userId, tenantId);
    if (userWorkspaces.length > 0) {
      userInfo.currentWorkspaceId = userWorkspaces[0].workspace.id;
      await updateUserDefaultWorkspaceId({ defaultWorkspaceId: userInfo.currentWorkspaceId }, userInfo.userId);
    }
    return createUserSession(userInfo, redirectTo);
  } else if (type === "set-workspace") {
    const workspaceId = form.get("workspaceId")?.toString() ?? "";
    userInfo.currentWorkspaceId = workspaceId;
    await updateUserDefaultWorkspaceId({ defaultWorkspaceId: userInfo.currentWorkspaceId }, userInfo.userId);
    return createUserSession(userInfo, redirectTo);
  } else if (type === "create-tenant") {
    const user = await getUser(userInfo.userId);
    if (!user) {
      return badRequest({ error: "" });
    }
    const name = form.get("name")?.toString() ?? "";
    if (!name) {
      return badRequest({ error: "Name required" });
    }
    const stripeCustomer = await createStripeCustomer(user?.email, name);
    if (!stripeCustomer) {
      return badRequest({ error: "Could not create Stripe customer" });
    }
    const tenant = await createTenant(name, stripeCustomer.id);
    await createTenantUser({
      tenantId: tenant.id,
      userId: user.id,
      role: TenantUserRole.OWNER,
    });
    const defaultWorkspace = await createWorkspace({
      tenantId: tenant.id,
      name,
      type: WorkspaceType.PRIVATE,
      businessMainActivity: "",
      registrationNumber: "",
    });

    if (!defaultWorkspace) {
      return badRequest({ error: "Could not create default workspace" });
    }
    await createWorkspaceUser({
      workspaceId: defaultWorkspace.id,
      userId: user.id,
    });

    await updateUserDefaultWorkspaceId({ defaultWorkspaceId: defaultWorkspace.id }, user.id);
    return json({
      success: "Tenant created",
      tenantId: tenant.id,
    });
  }
  return null;
}
