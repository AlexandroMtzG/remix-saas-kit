import { AppWorkspaceEntityDto } from "../../core/AppWorkspaceEntityDto";
import { EmployeeDto } from "../employees/EmployeeDto";

export interface ContractEmployeeDto extends AppWorkspaceEntityDto {
  employeeId: string;
  employee: EmployeeDto;
}
