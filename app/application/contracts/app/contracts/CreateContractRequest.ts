import { EmployeeDto } from "~/application/dtos/app/employees/EmployeeDto";
import { AddContractMemberDto } from "./AddContractMemberDto";

export interface CreateContractRequest {
  linkId: string;
  name: string;
  description: string;
  file: string;
  members: AddContractMemberDto[];
  employees: EmployeeDto[];
  estimatedStartDate?: Date | null;
  realStartDate?: Date | null;
  estimatedTerminationDate?: Date | null;
  realTerminationDate?: Date | null;
}
