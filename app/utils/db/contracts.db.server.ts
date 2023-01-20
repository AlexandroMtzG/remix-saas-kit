import { Contract, ContractActivity, ContractEmployee, ContractMember, Employee, Link, User, Workspace } from "@prisma/client";
import { AddContractMemberDto } from "~/application/contracts/app/contracts/AddContractMemberDto";
import { ContractStatusFilter } from "~/application/contracts/app/contracts/ContractStatusFilter";
import { ContractActivityType } from "~/application/enums/app/contracts/ContractActivityType";
import { ContractMemberRole } from "~/application/enums/app/contracts/ContractMemberRole";
import { ContractStatus } from "~/application/enums/app/contracts/ContractStatus";
import { db } from "../db.server";

export type ContractWithDetails = Contract & {
  createdByUser: User;
  link: Link & {
    createdByWorkspace: Workspace;
    providerWorkspace: Workspace;
    clientWorkspace: Workspace;
  };
  members: (ContractMember & { user: User })[];
  employees: (ContractEmployee & { employee: Employee })[];
  activity: (ContractActivity & { createdByUser: User })[];
};

export async function getMonthlyContractsCount(tenantId: string) {
  var date = new Date();
  var firstDayCurrentMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  var lastDayCurrentMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return await db.contract.count({
    where: {
      createdAt: {
        gte: firstDayCurrentMonth,
        lt: lastDayCurrentMonth,
      },
      link: {
        OR: [
          {
            providerWorkspace: {
              tenantId,
            },
          },
          {
            clientWorkspace: {
              tenantId,
            },
          },
        ],
      },
    },
  });
}

export async function getContract(id?: string): Promise<ContractWithDetails | null> {
  if (!id) {
    return null;
  }
  return await db.contract.findUnique({
    where: {
      id,
    },
    include: {
      createdByUser: true,
      link: {
        include: {
          createdByWorkspace: true,
          providerWorkspace: true,
          clientWorkspace: true,
        },
      },
      members: {
        include: {
          user: true,
        },
      },
      employees: {
        include: {
          employee: true,
        },
      },
      activity: {
        include: {
          createdByUser: true,
        },
      },
    },
  });
}

export async function getContracts(workspaceId: string, filter: ContractStatusFilter) {
  const include = {
    link: {
      include: {
        providerWorkspace: true,
        clientWorkspace: true,
      },
    },
    createdByUser: true,
  };
  if (filter === ContractStatusFilter.ALL) {
    return await db.contract.findMany({
      where: {
        link: {
          OR: [
            {
              providerWorkspaceId: workspaceId,
            },
            {
              clientWorkspaceId: workspaceId,
            },
          ],
        },
      },
      include,
    });
  }
  return await db.contract.findMany({
    where: {
      status: filter,
      link: {
        OR: [
          {
            providerWorkspaceId: workspaceId,
          },
          {
            clientWorkspaceId: workspaceId,
          },
        ],
      },
    },
    include,
  });
}

export async function createContract(
  data: {
    createdByUserId: string;
    linkId: string;
    name: string;
    description: string;
    file: string;
    status: ContractStatus;
  },
  members: { userId: string; role: ContractMemberRole }[],
  employees: Employee[]
) {
  const item = await db.contract.create({
    data,
  });

  if (item) {
    members.forEach(async (member) => {
      return await db.contractMember.create({
        data: {
          contractId: item.id,
          role: member.role,
          userId: member.userId,
        },
      });
    });

    employees.forEach(async (employee) => {
      return await db.contractEmployee.create({
        data: {
          contractId: item.id,
          employeeId: employee.id,
        },
      });
    });

    await db.contractActivity.create({
      data: {
        createdByUserId: data.createdByUserId,
        contractId: item.id,
        type: ContractActivityType.CREATED,
      },
    });
  }

  return item;
}

export async function updateContract(
  id: string,
  userId: string,
  data: {
    name: string;
    description: string;
    file: string;
    status: ContractStatus;
  }
) {
  const item = await db.contract.update({
    where: {
      id,
    },
    data,
  });

  if (item) {
    await db.contractActivity.create({
      data: {
        createdByUserId: userId,
        contractId: item.id,
        type: ContractActivityType.UPDATED,
      },
    });
  }

  return item;
}

export async function deleteContract(id: string) {
  return await db.contract.delete({
    where: { id },
  });
}
