import { WorkspaceType } from "~/application/enums/core/tenants/WorkspaceType";
import { db } from "../db.server";

export async function getWorkspace(id: string) {
  return await db.workspace.findUnique({
    where: {
      id,
    },
    include: {
      users: {
        include: {
          user: true,
        },
      },
    },
  });
}

export async function getWorkspaceUser(workspaceId?: string, userId?: string) {
  if (!workspaceId || !userId) {
    return null;
  }
  return await db.workspaceUser.findFirst({
    where: {
      workspaceId,
      userId,
    },
  });
}

export async function getWorkspaceUsers(workspaceId: string) {
  return await db.workspaceUser.findMany({
    where: {
      workspaceId,
    },
    include: {
      workspace: true,
      user: true,
    },
  });
}

export async function getMyWorkspaces(userId: string, currentTenantId: string | undefined) {
  const userWorkspaces = await db.workspaceUser.findMany({
    where: {
      userId: userId,
      workspace: { tenantId: currentTenantId },
    },
    include: {
      workspace: true,
    },
  });
  return userWorkspaces;
}

export async function getWorkspacesCount(tenantId: string) {
  return await db.workspace.count({
    where: { tenantId },
  });
}

export async function getWorkspaces(tenantId: string) {
  const workspaces = await db.workspace.findMany({
    where: {
      tenantId,
    },
    include: {
      users: {
        include: {
          user: true,
        },
      },
    },
  });
  return workspaces;
}

export async function getUserWorkspacesByUserId(userId: string) {
  const workspaces = await db.workspaceUser.findMany({
    where: {
      userId,
    },
    include: {
      workspace: true,
    },
  });
  return workspaces;
}

export async function getUserWorkspaces(tenantId?: string, userId?: string) {
  if (!tenantId || !userId) {
    return null;
  }
  const workspaces = await db.workspaceUser.findMany({
    where: {
      userId,
      workspace: {
        tenantId,
      },
    },
    include: {
      workspace: true,
    },
  });
  return workspaces;
}

export async function createWorkspace(data: {
  tenantId: string;
  name: string;
  type: WorkspaceType;
  businessMainActivity: string;
  registrationNumber: string;
  registrationDate?: Date | undefined;
}) {
  return await db.workspace.create({
    data,
  });
}

export async function createWorkspaceUser(data: { workspaceId: string; userId: string }) {
  return await db.workspaceUser.create({
    data,
  });
}

export async function updateWorkspace(
  id: string,
  data: { name: string; type: number; businessMainActivity: string | undefined; registrationNumber: string | undefined; registrationDate: Date | undefined }
) {
  return await db.workspace.update({
    where: {
      id,
    },
    data,
  });
}

export async function updateWorkspaceUsers(workspaceId: string, users: string[]) {
  await db.workspaceUser.deleteMany({
    where: {
      workspaceId,
    },
  });
  users.forEach(async (userId) => {
    return await db.workspaceUser.create({
      data: {
        workspaceId,
        userId,
      },
    });
  });
}

export async function updateUsersWorkspaces(userId: string, workspaces: string[]) {
  await db.workspaceUser.deleteMany({
    where: {
      userId,
    },
  });
  workspaces.forEach(async (workspaceId) => {
    return await db.workspaceUser.create({
      data: {
        workspaceId,
        userId,
      },
    });
  });
}

export async function deleteWorkspace(id: string) {
  await db.workspace.delete({
    where: {
      id,
    },
  });
}
