import { WorkspaceDto } from "../../core/workspaces/WorkspaceDto";
import { MasterEntityDto } from "../MasterEntityDto";
import { TenantProductDto } from "./TenantProductDto";
import { TenantUserDto } from "./TenantUserDto";

export interface TenantDto extends MasterEntityDto {
  uuid: string;
  name: string;
  domain: string;
  subdomain: string;
  icon: string;
  logo: string;
  logoDarkmode: string;
  subscriptionCustomerId: string;
  subscriptionPlanId: string;
  users: TenantUserDto[];
  products: TenantProductDto[];
  currentUser: TenantUserDto;
  workspaces: WorkspaceDto[];
}
