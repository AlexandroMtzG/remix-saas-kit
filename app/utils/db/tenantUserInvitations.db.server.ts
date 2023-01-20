import { TenantUserRole } from "~/application/enums/core/tenants/TenantUserRole";
import { db } from "../db.server";

export async function getUserInvitation(id: string) {
  return await db.tenantUserInvitation.findFirst({
    where: {
      id,
      pending: true,
    },
    include: {
      tenant: true,
      workspaces: true,
    },
  });
}

export async function getUserInvitations(tenantId: string) {
  return await db.tenantUserInvitation.findMany({
    where: {
      tenantId,
      pending: true,
    },
  });
}

export async function createUserInvitation(
  tenantId: string,
  workspaces: string[],
  data: {
    email: string;
    firstName: string;
    lastName: string;
    role: TenantUserRole;
  }
) {
  const invitation = await db.tenantUserInvitation.create({
    data: {
      tenantId,
      ...data,
      pending: true,
    },
  });
  workspaces.forEach(async (workspaceId) => {
    await db.tenantUserInvitationWorkspace.create({
      data: {
        invitationId: invitation.id,
        workspaceId,
      },
    });
  });

  return invitation;
}

export async function updateUserInvitationPending(id: string) {
  return await db.tenantUserInvitation.update({
    where: {
      id,
    },
    data: {
      pending: false,
    },
  });
}

export async function deleteUserInvitation(id: string) {
  return await db.tenantUserInvitation.delete({
    where: {
      id,
    },
  });
}
