import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SideBarItem } from "~/application/sidebar/SidebarItem";
import { ReactNode, useEffect, useState } from "react";
import { AdminSidebar } from "~/application/sidebar/AdminSidebar";
import { AppSidebar } from "~/application/sidebar/AppSidebar";
import { UserType } from "~/application/enums/core/users/UserType";
import { TenantUserRole } from "~/application/enums/core/tenants/TenantUserRole";
import UserUtils from "~/utils/store/UserUtils";
import { SidebarGroup } from "~/application/sidebar/SidebarGroup";
import clsx from "~/utils/shared/ClassesUtils";
import LayoutSelector from "../ui/selectors/LayoutSelector";
import LocaleSelector from "../ui/selectors/LocaleSelector";
import QuickActionsButton from "./buttons/QuickActionsButton";
import ProfileButton from "./buttons/ProfileButton";
import SidebarMenu from "./SidebarMenu";
import LogoLight from "~/assets/img/logo-light.png";
import { useAppData } from "~/utils/data/useAppData";
import { useSubmit } from "remix";

interface Props {
  layout: "app" | "admin";
  children: ReactNode;
}

export default function StackedLayout({ layout, children }: Props) {
  const appData = useAppData();
  const { t } = useTranslation("translations");
  const submit = useSubmit();
  const currentRoute = useLocation().pathname;
  const navigate = useNavigate();

  const [menu, setMenu] = useState<SideBarItem[]>([]);
  const [menuOpened, setMenuOpened] = useState(false);

  useEffect(() => {
    if (layout === "admin") {
      setMenu(AdminSidebar);
    } else {
      setMenu(AppSidebar);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function allowCurrentUserType(types: UserType[] | undefined) {
    return !types || types.includes(appData.user?.type ?? UserType.Tenant);
  }
  function allowCurrentRole(roles: TenantUserRole[] | undefined) {
    return !roles || roles.includes(appData.currentRole);
  }
  function signOut() {
    submit(null, { method: "post", action: "/logout" });
  }
  const getMenu = (): SidebarGroup[] => {
    const _menu: SidebarGroup[] = [];
    menu
      .filter((f) => allowCurrentUserType(f.userTypes) && allowCurrentRole(f.userRoles))
      .forEach(({ title, items }) => {
        _menu.push({
          title: title.toString(),
          items: items?.filter((f) => allowCurrentUserType(f.userTypes) && allowCurrentRole(f.userRoles)) ?? [],
        });
      });
    return _menu.filter((f) => f.items.length > 0);
  };

  return (
    <div>
      <nav className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 justify-between h-16">
            <div className="flex items-center space-x-2 overflow-x-auto py-1">
              <div className="flex-shrink-0">
                <Link to="/app/dashboard">
                  <img className="h-8 w-auto" src={LogoLight} alt="Workflow" />
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {/*Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" */}
                  {getMenu().map((group, index) => {
                    return (
                      <div key={index} className="flex items-baseline space-x-4 py-1">
                        {group.items.map((menuItem, index) => {
                          return (
                            <div key={index}>
                              <Link
                                to={menuItem.path}
                                className={clsx(
                                  "px-3 py-2 rounded-md text-sm font-medium truncate",
                                  currentRoute === menuItem.path ? "text-white bg-theme-700" : "text-gray-500 hover:bg-gray-700 hover:text-white"
                                )}
                                aria-current="page"
                                onClick={() => setMenuOpened(false)}
                              >
                                {menuItem.title}
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* {layout === "admin" && <LayoutSelector className="text-sm" />} */}
              {/* {layout === "admin" && <LocaleSelector className="text-sm" />} */}
              {layout === "app" && <QuickActionsButton className="text-gray-400" />}
              <ProfileButton />
              <button
                onClick={() => setMenuOpened(!menuOpened)}
                type="button"
                className="inline-flex items-center justify-center p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-800 focus:ring-theme-500"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {/*Heroicon name: outline/menu */}
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {/*Heroicon name: outline/x */}
                <svg className="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/*Mobile menu, show/hide based on menu state. */}
        {menuOpened && (
          <div id="mobile-menu" className="bg-slate-900">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {/*Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" */}
              <SidebarMenu layout={layout} onSelected={() => setMenuOpened(false)} />
            </div>
            <div className="pt-2 pb-3 border-t border-gray-700">
              <div className="px-2 space-y-1">
                <Link
                  onClick={() => setMenuOpened(!menuOpened)}
                  to="/app/settings/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  {t("settings.profile.profileTitle")}
                </Link>

                <button
                  type="button"
                  onClick={signOut}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  {t("app.navbar.signOut")}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
      <main>
        <div className="mx-auto">
          {/*Replace with your content */}
          {children}
          {/*/End replace */}
        </div>
      </main>
    </div>
  );
}
