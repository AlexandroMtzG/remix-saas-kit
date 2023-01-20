import { Employee, User } from "@prisma/client";
import { db } from "../../db.server";

export type EmployeeWithCreatedByUser = Employee & { createdByUser: User };

export async function getEmployee(id?: string): Promise<EmployeeWithCreatedByUser | null> {
  if (!id) {
    return null;
  }
  return await db.employee.findUnique({
    where: {
      id,
    },
    include: {
      createdByUser: true,
    },
  });
}

export async function getEmployeeByEmail(workspaceId: string, email: string) {
  return await db.employee.findFirst({
    where: {
      workspaceId,
      email,
    },
  });
}

export async function getEmployeesCount(tenantId: string) {
  return await db.employee.count({
    where: {
      tenantId,
    },
  });
}

export async function getEmployees(workspaceId: string) {
  return await db.employee.findMany({
    where: {
      workspaceId,
    },
  });
}

export async function createEmployee(data: {
  createdByUserId: string;
  tenantId: string;
  workspaceId: string;
  email: string;
  firstName: string;
  lastName: string;
}) {
  return await db.employee.create({
    data,
  });
}

export async function updateEmployee(
  id: string,
  data: {
    email: string;
    firstName: string;
    lastName: string;
  }
) {
  return await db.employee.update({
    where: { id },
    data,
  });
}

export async function deleteEmployee(id: string) {
  return await db.employee.delete({
    where: { id },
  });
}
