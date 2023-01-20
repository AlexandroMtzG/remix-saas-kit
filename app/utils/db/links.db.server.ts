import { Contract, Link, User, Workspace, WorkspaceUser } from "@prisma/client";
import { LinkStatus } from "~/application/enums/core/links/LinkStatus";
import { db } from "../db.server";

export type LinkWithWorkspaces = Link & {
  createdByUser: User;
  createdByWorkspace: Workspace;
  providerWorkspace: Workspace;
  clientWorkspace: Workspace;
};

export type LinkWithWorkspacesAndContracts = LinkWithWorkspaces & {
  contracts: Contract[];
};

export type LinkWithWorkspacesAndMembers = Link & {
  providerWorkspace: Workspace & { users: (WorkspaceUser & { workspace: Workspace; user: User })[] };
  clientWorkspace: Workspace & { users: (WorkspaceUser & { workspace: Workspace; user: User })[] };
};

export async function getLink(id?: string): Promise<LinkWithWorkspacesAndContracts | null> {
  if (!id) {
    return null;
  }
  return await db.link.findUnique({
    where: {
      id,
    },
    include: {
      createdByWorkspace: true,
      providerWorkspace: true,
      clientWorkspace: true,
      contracts: true,
      createdByUser: true,
    },
  });
}

export async function getLinksCount(workspaceId: string, statusIn: LinkStatus[]): Promise<number> {
  return await db.link.count({
    where: {
      status: {
        in: statusIn,
      },
      OR: [
        {
          providerWorkspaceId: workspaceId,
        },
        {
          clientWorkspaceId: workspaceId,
        },
      ],
    },
  });
}

export async function getLinks(workspaceId: string, status: LinkStatus): Promise<LinkWithWorkspaces[]> {
  return await db.link.findMany({
    where: {
      status,
      OR: [
        {
          providerWorkspaceId: workspaceId,
        },
        {
          clientWorkspaceId: workspaceId,
        },
      ],
    },
    include: {
      createdByWorkspace: true,
      providerWorkspace: true,
      clientWorkspace: true,
      createdByUser: true,
    },
  });
}

export async function getClientLinksCount(tenantId: string) {
  return await db.link.count({
    where: {
      status: LinkStatus.LINKED,
      providerWorkspace: {
        tenantId,
      },
    },
  });
}

export async function getClientLinks(workspaceId: string): Promise<LinkWithWorkspacesAndContracts[]> {
  return await db.link.findMany({
    where: {
      status: LinkStatus.LINKED,
      providerWorkspaceId: workspaceId,
    },
    include: {
      createdByWorkspace: true,
      providerWorkspace: true,
      clientWorkspace: true,
      createdByUser: true,
      contracts: true,
    },
  });
}

export async function getProviderLinksCount(tenantId: string) {
  return await db.link.count({
    where: {
      status: LinkStatus.LINKED,
      clientWorkspace: {
        tenantId,
      },
    },
  });
}

export async function getProviderLinks(workspaceId: string): Promise<LinkWithWorkspacesAndContracts[]> {
  return await db.link.findMany({
    where: {
      status: LinkStatus.LINKED,
      clientWorkspaceId: workspaceId,
    },
    include: {
      createdByWorkspace: true,
      providerWorkspace: true,
      clientWorkspace: true,
      createdByUser: true,
      contracts: true,
    },
  });
}

export async function getLinksWithMembers(workspaceId: string): Promise<LinkWithWorkspacesAndMembers[]> {
  return await db.link.findMany({
    where: {
      status: LinkStatus.LINKED,
      OR: [
        {
          providerWorkspaceId: workspaceId,
        },
        {
          clientWorkspaceId: workspaceId,
        },
      ],
    },
    include: {
      providerWorkspace: {
        include: {
          users: {
            include: {
              workspace: true,
              user: true,
            },
          },
        },
      },
      clientWorkspace: {
        include: {
          users: {
            include: {
              workspace: true,
              user: true,
            },
          },
        },
      },
    },
  });
}

export async function createLink(data: {
  createdByUserId: string;
  createdByWorkspaceId: string;
  providerWorkspaceId: string;
  clientWorkspaceId: string;
  status: LinkStatus;
  userInvitedId: string;
}) {
  return await db.link.create({
    data,
  });
}

export async function updateLink(id: string, data: { status: LinkStatus }) {
  return await db.link.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteLink(id: string) {
  return await db.link.delete({
    where: {
      id,
    },
  });
}
