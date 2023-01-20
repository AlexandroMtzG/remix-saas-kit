import { EntityDto } from "../EntityDto";
import { TenantDto } from "~/application/dtos/core/tenants/TenantDto";
import { UserDto } from "~/application/dtos/core/users/UserDto";

export interface AppEntityDto extends EntityDto {
  createdByUserId?: string;
  createdByUser?: UserDto;
  modifiedByUserId?: string;
  modifiedByUser?: UserDto;
  tenantId?: string | undefined;
  tenant?: TenantDto | undefined;
}
