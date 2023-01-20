import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SideBarItem } from "~/application/sidebar/SidebarItem";
import { TenantUserRole } from "~/application/enums/core/tenants/TenantUserRole";
import { AdminSidebar } from "~/application/sidebar/AdminSidebar";
import { AppSidebar } from "~/application/sidebar/AppSidebar";
import SidebarIcon from "~/components/layouts/icons/SidebarIcon";
import { MetaFunction } from "remix";

export const meta: MetaFunction = () => ({
  title: "Navigation | Remix SaasFrontend",
});

export default function AdminNavigationRoute() {
  const { t } = useTranslation("translations");

  const [items, setItems] = useState<SideBarItem[]>([]);
  const [roles, setRoles] = useState<TenantUserRole[]>([]);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    setItems([]);
    AdminSidebar.forEach((admin) => {
      admin.items?.forEach((item) => {
        setItems((items) => [...items, item]);
      });
    });
    AppSidebar.forEach((app) => {
      app.items?.forEach((item) => {
        setItems((items) => [...items, item]);
      });
    });
    const roleKeys = Object.keys(TenantUserRole).filter((key) => !isNaN(Number(key)));
    setRoles(roleKeys.map((f) => Number(f)));
  }, []);

  function roleName(role: TenantUserRole) {
    return t("settings.profile.roles." + TenantUserRole[role]);
  }
  function roleHasAccess(item: SideBarItem, role: TenantUserRole): boolean {
    return !item.path.includes("/admin") && allowRole(item, role);
  }
  function allowRole(item: SideBarItem, role: TenantUserRole) {
    return !item.userRoles || item.userRoles.includes(role);
  }

  return (
    <div>
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          <h1 className="flex-1 font-bold flex items-center truncate">{t("admin.navigation.title")}</h1>
        </div>
      </div>
      <div className="pt-2 space-y-2 mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl xl:max-w-7xl">
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="flex items-center justify-start w-full">
              <div className="relative flex items-center w-full">
                <div className="focus-within:z-10 absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  name="buscador"
                  id="buscador"
                  className="w-full focus:ring-theme-500 focus:border-theme-500 block rounded-md pl-10 sm:text-sm border-gray-300"
                  placeholder={t("shared.searchDot")}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div>
            <div>
              <div className="flex flex-col">
                <div className="overflow-x-auto">
                  <div className="py-2 align-middle inline-block min-w-full">
                    <div className="shadow overflow-hidden border border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-4 py-2 text-left text-xs font-medium text-gray-500 tracking-wider select-none truncate border border-gray-200"
                            >
                              {t("admin.navigation.icon")}
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-2 text-left text-xs font-medium text-gray-500 tracking-wider select-none truncate border border-gray-200"
                            >
                              {t("admin.navigation.menu")}
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-2 text-left text-xs font-medium text-gray-500 tracking-wider select-none truncate border border-gray-200"
                            >
                              {t("admin.navigation.url")}
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 tracking-wider select-none truncate border border-gray-200">
                              {t("admin.navigation.sysadmin")}
                            </th>
                            {roles.map((role, idx) => {
                              return (
                                <th
                                  key={idx}
                                  scope="col"
                                  className="px-4 py-2 text-left text-xs font-bold text-gray-500 tracking-wider select-none truncate border border-gray-200"
                                >
                                  <div className="flex items-center justify-center space-x-1 text-gray-500">{roleName(role)}</div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {items.map((item, idx) => {
                            return (
                              <tr key={idx}>
                                <td className="w-10 px-4 py-2 whitespace-nowrap border-l border-t border-b border-gray-200 text-sm">
                                  {item.icon && <SidebarIcon className="mx-auto h-5 w-5 text-slate-700" icon={item.icon} />}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap border-l border-t border-b border-gray-200 text-sm">{t(item.title)}</td>
                                <td className="px-4 py-2 whitespace-nowrap border-l border-t border-b border-gray-200 text-sm">
                                  <a target="_blank" rel="noreferrer" href={item.path} className="underline text-blue-500 hover:text-blue-700">
                                    {item.path}
                                  </a>
                                </td>
                                <td className="px-4 whitespace-nowrap text-sm text-gray-600 text-center border border-gray-200">
                                  <div className="flex justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                </td>

                                {roles.map((role) => {
                                  return (
                                    <td className="px-4 whitespace-nowrap text-sm text-gray-600 text-center border border-gray-200" key={role}>
                                      <div className="flex justify-center">
                                        {(() => {
                                          if (roleHasAccess(item, role)) {
                                            return (
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path
                                                  fillRule="evenodd"
                                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                  clipRule="evenodd"
                                                />
                                              </svg>
                                            );
                                          } else {
                                            return (
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path
                                                  fillRule="evenodd"
                                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                  clipRule="evenodd"
                                                />
                                              </svg>
                                            );
                                          }
                                        })()}
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
