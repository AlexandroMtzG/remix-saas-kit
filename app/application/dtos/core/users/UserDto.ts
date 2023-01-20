import { UserLoginType } from "~/application/enums/core/users/UserLoginType";
import { UserType } from "~/application/enums/core/users/UserType";
import { WorkspaceUserDto } from "../../core/workspaces/WorkspaceUserDto";
import { MasterEntityDto } from "../MasterEntityDto";
import { TenantDto } from "../tenants/TenantDto";
import { TenantUserDto } from "../tenants/TenantUserDto";

export interface UserDto extends MasterEntityDto {
  email: string;
  type: UserType;
  firstName: string;
  lastName: string;
  phone: string;
  loginType: UserLoginType;
  avatar: string;
  token: string;
  defaultTenantId: number | null;
  defaultTenant: TenantDto;
  tenants: TenantUserDto[];
  currentTenant: TenantDto;
  timezone: string;
  workspaces?: WorkspaceUserDto[];
}
