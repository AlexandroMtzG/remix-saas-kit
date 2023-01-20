import { Tenant, TenantUser, User, Workspace } from "@prisma/client";
import { TenantUserJoined } from "~/application/enums/core/tenants/TenantUserJoined";
import { TenantUserStatus } from "~/application/enums/core/tenants/TenantUserStatus";
import { db } from "../db.server";

export type TenantWithWorkspacesAndUsers = Tenant & {
  workspaces: Workspace[];
  users: (TenantUser & {
    user: User;
  })[];
};

export async function adminGetAllTenants(): Promise<TenantWithWorkspacesAndUsers[]> {
  return await db.tenant.findMany({
    include: {
      workspaces: true,
      users: {
        include: {
          user: true,
        },
      },
    },
  });
}

export async function getTenant(id: string) {
  return await db.tenant.findUnique({
    where: {
      id,
    },
  });
}

export async function getMyTenants(userId: string) {
  const tenants = await db.tenantUser.findMany({
    where: {
      userId,
    },
    include: {
      tenant: true,
    },
  });
  // if (tenants.length > 0) {
  //   const currentTenants = tenants.filter((f) => f.current);
  //   if (currentTenants.length > 1) {
  //     currentTenants.forEach(async (tenantUser) => {
  //       await db.tenantUser.update({
  //         where: {
  //           id: tenantUser.id,
  //         },
  //         data: {
  //           current: false,
  //         },
  //       });
  //       tenantUser.current = false;
  //     });
  //   }
  //   if (currentTenants.length === 0) {
  //     await db.tenantUser.update({
  //       where: {
  //         id: tenants[0].id,
  //       },
  //       data: {
  //         current: true,
  //       },
  //     });
  //     tenants[0].current = true;
  //   }
  // }
  return tenants;
}

export async function getTenantUsersCount(tenantId: string) {
  return await db.tenantUser.count({
    where: { tenantId },
  });
}

export async function getTenantUsers(tenantId?: string) {
  if (!tenantId) {
    return null;
  }
  return await db.tenantUser.findMany({
    where: { tenantId },
    include: {
      user: true,
    },
  });
}

export async function getTenantUser(id: string) {
  return await db.tenantUser.findUnique({
    where: {
      id,
    },
    include: {
      tenant: true,
      user: true,
    },
  });
}

export async function getTenantMember(userId?: string, tenantId?: string) {
  return await db.tenantUser.findFirst({
    where: {
      userId,
      tenantId,
    },
    include: {
      tenant: true,
      user: true,
    },
  });
}

export async function updateTenant(id: string, data: { name: string }) {
  return await db.tenant.update({
    where: {
      id,
    },
    data,
  });
}

export async function updateTenantSubscriptionCustomerId(id: string, data: { subscriptionCustomerId: string }) {
  return await db.tenant.update({
    where: {
      id,
    },
    data,
  });
}

export async function updateTenantSubscriptionId(id: string, data: { subscriptionId: string }) {
  return await db.tenant.update({
    where: {
      id,
    },
    data,
  });
}

export async function updateTenantUser(id: string, data: { role: number }) {
  return await db.tenantUser.update({
    where: {
      id,
    },
    data,
  });
}

export async function createTenant(name: string, subscriptionCustomerId: string) {
  return await db.tenant.create({
    data: {
      name,
      subscriptionCustomerId,
    },
  });
}

export async function createTenantUser(data: { tenantId: string; userId: string; role: number }) {
  return await db.tenantUser.create({
    data: {
      ...data,
      joined: TenantUserJoined.JOINED_BY_INVITATION,
      status: TenantUserStatus.ACTIVE,
    },
  });
}

export async function deleteTenantUser(id: string) {
  return await db.tenantUser.delete({
    where: {
      id,
    },
  });
}
