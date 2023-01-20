import { SideBarItem } from "./SidebarItem";
import { UserType } from "~/application/enums/core/users/UserType";
import { SvgIcon } from "../enums/shared/SvgIcon";

export const AdminSidebar: SideBarItem[] = [
  {
    title: "app.sidebar.admin",
    path: "",
    items: [
      {
        title: "admin.tenants.title",
        path: "/admin/tenants",
        icon: SvgIcon.TENANTS,
        items: [],
      },
      {
        title: "models.user.plural",
        path: "/admin/users",
        icon: SvgIcon.USERS,
        items: [],
      },
      {
        title: "admin.pricing.title",
        path: "/admin/pricing",
        icon: SvgIcon.PRICING,
        items: [],
      },
      {
        title: "admin.emails.title",
        path: "/admin/emails",
        icon: SvgIcon.EMAILS,
        items: [],
      },
      {
        title: "admin.navigation.title",
        path: "/admin/navigation",
        icon: SvgIcon.NAVIGATION,
        items: [],
      },
      {
        title: "admin.components.title",
        path: "/admin/components",
        icon: SvgIcon.COMPONENTS,
        items: [],
      },
    ],
  },
  {
    title: "App",
    path: "",
    items: [
      {
        title: "admin.switchToApp",
        path: "/app/dashboard",
        icon: SvgIcon.APP,
        userTypes: [UserType.Admin],
        items: [],
      },
    ],
  },
];
