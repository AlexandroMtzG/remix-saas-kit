import { redirect } from "remix";
import { TenantUserRole } from "~/application/enums/core/tenants/TenantUserRole";
import { UserType } from "~/application/enums/core/users/UserType";
import { AppSidebar } from "~/application/sidebar/AppSidebar";
import { SideBarItem } from "~/application/sidebar/SidebarItem";
import { getTenantMember } from "./db/tenants.db.server";
import { getUserInfo, getUserType } from "./session.server";

export async function requireAdminUser(request: Request) {
  const userType = await getUserType(request);
  if (userType !== UserType.Admin) {
    throw redirect("/app/unauthorized");
  }
}

export async function requireOwnerOrAdminRole(request: Request) {
  const userInfo = await getUserInfo(request);
  const tenantMember = await getTenantMember(userInfo.userId, userInfo.currentTenantId);
  if (!tenantMember || (tenantMember.role !== TenantUserRole.OWNER && tenantMember.role !== TenantUserRole.ADMIN)) {
    throw redirect("/app/unauthorized");
  }
}

export async function requireAuthorization(currentPath: string, currentRole: TenantUserRole) {
  let foundItem: SideBarItem | undefined;
  AppSidebar.map((f) =>
    f.items?.map((item) => {
      if (currentPath.includes(item.path)) {
        foundItem = item;
      }
    })
  );
  if (foundItem && foundItem.userRoles && !foundItem.userRoles.includes(currentRole)) {
    throw redirect("/app/unauthorized");
  }
}
