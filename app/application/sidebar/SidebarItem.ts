import { TenantUserRole } from "../enums/core/tenants/TenantUserRole";
import { UserType } from "../enums/core/users/UserType";
import { SvgIcon } from "../enums/shared/SvgIcon";

export interface SideBarItem {
  title: string;
  path: string;
  icon?: SvgIcon;
  open?: boolean;
  userTypes?: UserType[];
  userRoles?: TenantUserRole[];
  items?: SideBarItem[];
}
