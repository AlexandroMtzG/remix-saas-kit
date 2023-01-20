import { SideBarItem } from "./SidebarItem";
import { TenantUserRole } from "~/application/enums/core/tenants/TenantUserRole";
import { UserType } from "~/application/enums/core/users/UserType";
import { SvgIcon } from "../enums/shared/SvgIcon";

export const AppSidebar: SideBarItem[] = [
  {
    title: "app.sidebar.app",
    path: "",
    items: [
      {
        title: "app.sidebar.dashboard",
        path: "/app/dashboard",
        icon: SvgIcon.DASHBOARD,
        userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER, TenantUserRole.GUEST],
      },
      // {
      //   title: "models.joke.plural",
      //   path: "/app/jokes",
      //   icon: SvgIcon.JOKES,
      //   userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER, TenantUserRole.GUEST],
      // },
      {
        title: "models.link.plural",
        path: "/app/links",
        icon: SvgIcon.LINKS,
        userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN],
      },
      {
        title: "models.contract.plural",
        path: "/app/contracts",
        icon: SvgIcon.CONTRACTS,
        userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER, TenantUserRole.GUEST],
      },
      {
        title: "models.employee.plural",
        path: "/app/employees",
        icon: SvgIcon.EMPLOYEES,
        userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER],
      },
      {
        title: "app.navbar.settings",
        icon: SvgIcon.SETTINGS,
        userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN],
        path: "/app/settings",
        items: [
          {
            title: "app.navbar.profile",
            path: "/app/settings/profile",
          },
          {
            title: "models.workspace.plural",
            path: "/app/settings/workspaces",
            userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN],
          },
          {
            title: "settings.members.title",
            path: "/app/settings/members",
            userRoles: [TenantUserRole.OWNER, TenantUserRole.ADMIN],
          },
          {
            title: "settings.subscription.title",
            path: "/app/settings/subscription",
            userRoles: [TenantUserRole.OWNER],
          },
          {
            title: "app.navbar.tenant",
            path: "/app/settings/tenant",
            userRoles: [TenantUserRole.OWNER],
          },
        ],
      },
    ],
  },
  {
    title: "admin.title",
    path: "",
    items: [
      {
        title: "admin.switchToAdmin",
        path: "/admin/tenants",
        icon: SvgIcon.ADMIN,
        userTypes: [UserType.Admin],
      },
    ],
  },
];
