import { TenantDto } from "~/application/dtos/core/tenants/TenantDto";
import { TenantUserDto } from "~/application/dtos/core/tenants/TenantUserDto";

export interface TenantInvitationResponse {
  invitation: TenantUserDto;
  tenant: TenantDto;
  requiresVerify: boolean;
}
