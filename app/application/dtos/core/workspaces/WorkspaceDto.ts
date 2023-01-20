import { AppEntityDto } from "../AppEntityDto";
import { WorkspaceUserDto } from "./WorkspaceUserDto";
import { WorkspaceType } from "~/application/enums/core/tenants/WorkspaceType";

export interface WorkspaceDto extends AppEntityDto {
  name: string;
  type: WorkspaceType;
  businessMainActivity: string;
  registrationNumber: string;
  registrationDate?: Date | null;
  default?: boolean;
  users: WorkspaceUserDto[];
}
