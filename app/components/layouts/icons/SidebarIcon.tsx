import { SvgIcon } from "~/application/enums/shared/SvgIcon";

import IconAdmin from "./IconAdmin";
import IconTenants from "./IconTenants";
import IconUsers from "./IconUsers";
import IconPricing from "./IconPricing";
import IconNavigation from "./IconNavigation";
import IconComponents from "./IconComponents";

import IconApp from "./IconApp";
import IconDashboard from "./IconDashboard";
import IconSettings from "./IconSettings";
import IconLinks from "./IconLinks";
import IconProviders from "./IconProviders";
import IconClients from "./IconClients";
import IconContracts from "./IconContracts";
import IconEmployees from "./IconEmployees";
import IconEmails from "./IconEmails";
import IconJokes from "./IconJokes";

interface Props {
  className: string;
  icon: SvgIcon;
}

export default function SidebarIcon(props: Props) {
  const icon = props.icon;
  return (
    <span>
      {/* Core */}
      {icon === SvgIcon.ADMIN && <IconAdmin className={props.className} />}
      {icon === SvgIcon.TENANTS && <IconTenants className={props.className} />}
      {icon === SvgIcon.USERS && <IconUsers className={props.className} />}
      {icon === SvgIcon.PRICING && <IconPricing className={props.className} />}
      {icon === SvgIcon.EMAILS && <IconEmails className={props.className} />}
      {icon === SvgIcon.NAVIGATION && <IconNavigation className={props.className} />}
      {icon === SvgIcon.COMPONENTS && <IconComponents className={props.className} />}
      {icon === SvgIcon.APP && <IconApp className={props.className} />}
      {icon === SvgIcon.DASHBOARD && <IconDashboard className={props.className} />}
      {icon === SvgIcon.SETTINGS && <IconSettings className={props.className} />}

      {/* App */}
      {icon === SvgIcon.LINKS && <IconLinks className={props.className} />}
      {icon === SvgIcon.PROVIDERS && <IconProviders className={props.className} />}
      {icon === SvgIcon.CLIENTS && <IconClients className={props.className} />}
      {icon === SvgIcon.CONTRACTS && <IconContracts className={props.className} />}
      {icon === SvgIcon.EMPLOYEES && <IconEmployees className={props.className} />}
      {icon === SvgIcon.JOKES && <IconJokes className={props.className} />}
    </span>
  );
}
