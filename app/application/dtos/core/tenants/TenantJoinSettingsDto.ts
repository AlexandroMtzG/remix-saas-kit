import { MasterEntityDto } from "../MasterEntityDto";
import { TenantDto } from "./TenantDto";

export interface TenantJoinSettingsDto extends MasterEntityDto {
  tenantId: string;
  tenant: TenantDto;
  link: string;
  linkActive: boolean;
  publicUrl: boolean;
  requireAcceptance: boolean;
}
