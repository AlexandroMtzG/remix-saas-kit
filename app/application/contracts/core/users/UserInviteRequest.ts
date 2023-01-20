import { WorkspaceDto } from "~/application/dtos/core/workspaces/WorkspaceDto";
import { TenantUserRole } from "~/application/enums/core/tenants/TenantUserRole";

export interface UserInviteRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: TenantUserRole;
  workspaces: WorkspaceDto[];
}
