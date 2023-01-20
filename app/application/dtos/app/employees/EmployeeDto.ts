import { AppWorkspaceEntityDto } from "../../core/AppWorkspaceEntityDto";

export interface EmployeeDto extends AppWorkspaceEntityDto {
  firstName: string;
  lastName: string;
  email: string;
}
