import { UserDto } from "~/application/dtos/core/users/UserDto";
import { WorkspaceType } from "~/application/enums/core/tenants/WorkspaceType";

export interface CreateWorkspaceRequest {
  name: string;
  type: WorkspaceType;
  businessMainActivity: string;
  registrationNumber: string;
  registrationDate: Date | null;
  users: UserDto[];
}
