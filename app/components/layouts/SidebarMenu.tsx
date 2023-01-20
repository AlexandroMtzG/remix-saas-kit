import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { SideBarItem } from "~/application/sidebar/SidebarItem";
import { AdminSidebar } from "~/application/sidebar/AdminSidebar";
import { AppSidebar } from "~/application/sidebar/AppSidebar";
import { SidebarGroup } from "~/application/sidebar/SidebarGroup";
import { UserType } from "~/application/enums/core/users/UserType";
import { TenantUserRole } from "~/application/enums/core/tenants/TenantUserRole";
import clsx from "~/utils/shared/ClassesUtils";
import SidebarIcon from "./icons/SidebarIcon";
import { useTranslation } from "react-i18next";
import { useAppData } from "~/utils/data/useAppData";

interface Props {
  layout: "app" | "admin";
  onSelected?: () => void;
}

export default function SidebarMenu({ layout, onSelected }: Props) {
  const { t } = useTranslation("translations");
  const location = useLocation();
  const appData = useAppData();

  const [menu, setMenu] = useState<SideBarItem[]>([]);
  const [expanded, setExpanded] = useState<number[]>([]);

  useEffect(() => {
    setMenu(layout === "admin" ? AdminSidebar : AppSidebar);
    menu.forEach((group) => {
      group.items?.forEach((element, index) => {
        if (element.open) {
          expanded.push(index);
        } else {
          setExpanded(expanded.filter((f) => f !== index));
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function menuItemIsExpanded(index: number) {
    return expanded.includes(index);
  }
  function toggleMenuItem(index: number) {
    if (expanded.includes(index)) {
      setExpanded(expanded.filter((item) => item !== index));
    } else {
      setExpanded([...expanded, index]);
    }
  }
  function isCurrent(menuItem: SideBarItem) {
    return location.pathname?.includes(menuItem.path);
  }
  function allowCurrentUserType(item: SideBarItem) {
    return !item.userTypes || item.userTypes.includes(appData.user?.type ?? UserType.Tenant);
  }
  function allowCurrentRole(item: SideBarItem) {
    return !item.userRoles || item.userRoles.includes(appData.currentRole);
  }
  const getMenu = (): SidebarGroup[] => {
    const _menu: SidebarGroup[] = [];
    menu
      .filter((f) => allowCurrentUserType(f) && allowCurrentRole(f))
      .forEach(({ title, items }) => {
        _menu.push({
          title: title.toString(),
          items: items?.filter((f) => allowCurrentUserType(f) && allowCurrentRole(f)) ?? [],
        });
      });
    return _menu.filter((f) => f.items.length > 0);
  };

  return (
    <div>
      <div className="sm:hidden">
        {getMenu().map((group, index) => {
          return (
            <div key={index} className="mt-2">
              <div className="mt-2">
                <h3 className="px-1 text-xs leading-4 font-semibold text-slate-500 uppercase tracking-wider">{t(group.title)}</h3>
              </div>
              {group.items.map((menuItem, index) => {
                return (
                  <div key={index}>
                    {(() => {
                      if (!menuItem.items || menuItem.items.length === 0) {
                        return (
                          <div>
                            <Link
                              to={menuItem.path}
                              className={clsx(
                                "px-4 mt-1 group flex items-center space-x-4 py-2 text-base leading-5 rounded-sm hover:text-white text-slate-300 focus:outline-none focus:text-gray-50 transition ease-in-out duration-150",
                                isCurrent(menuItem) && "text-slate-300 bg-theme-600 focus:bg-theme-700",
                                !isCurrent(menuItem) && "text-slate-200 hover:bg-slate-800 focus:bg-slate-800"
                              )}
                              onClick={onSelected}
                            >
                              {menuItem.icon !== undefined && <SidebarIcon className="h-5 w-5 text-white" icon={menuItem.icon} />}
                              <div>{t(menuItem.title)}</div>
                            </Link>
                          </div>
                        );
                      } else {
                        return (
                          <div>
                            <div
                              className="px-4 justify-between mt-1 group flex items-center py-2 text-base leading-5 rounded-sm hover:text-white focus:outline-none focus:text-gray-50 focus:bg-slate-800 transition ease-in-out duration-150 text-slate-200 hover:bg-slate-800"
                              onClick={() => toggleMenuItem(index)}
                            >
                              <div className="flex items-center space-x-4">
                                <span className="text-slate-200 h-5 w-5 transition ease-in-out">
                                  {menuItem.icon !== undefined && <SidebarIcon className="h-5 w-5 text-white" icon={menuItem.icon} />}
                                </span>
                                <div>{t(menuItem.title)}</div>
                              </div>
                              {/*Expanded: "text-gray-400 rotate-90", Collapsed: "text-slate-200" */}
                              <svg
                                className={clsx(
                                  "ml-auto h-5 w-5 transform transition-colors ease-in-out duration-150",
                                  menuItemIsExpanded(index)
                                    ? "rotate-90 ml-auto h-3 w-3 transform group-hover:text-gray-400 group-focus:text-gray-400 transition-colors ease-in-out duration-150"
                                    : "ml-auto h-3 w-3 transform group-hover:text-gray-400 group-focus:text-gray-400 transition-colors ease-in-out duration-150"
                                )}
                                viewBox="0 0 20 20"
                              >
                                <path d="M6 6L14 10L6 14V6Z" fill="currentColor" />
                              </svg>
                            </div>
                            {/*Expandable link section, show/hide based on state. */}
                            {menuItemIsExpanded(index) && (
                              <div className="mt-1">
                                {menuItem.items.map((subItem, index) => {
                                  return (
                                    <Link
                                      key={index}
                                      to={subItem.path}
                                      className={clsx(
                                        "pl-14 mt-1 group flex items-center py-2 sm:text-sm leading-5 rounded-sm hover:text-slate-300 focus:outline-none focus:text-slate-300 transition ease-in-out duration-150",
                                        isCurrent(subItem) && "text-slate-300 bg-theme-600 focus:bg-theme-700",
                                        !isCurrent(subItem) && "text-slate-200 hover:bg-slate-800 focus:bg-slate-800"
                                      )}
                                      onClick={onSelected}
                                    >
                                      {subItem.icon !== undefined && (
                                        <span className="mr-1 h-5 w-5 transition ease-in-out">
                                          <SidebarIcon className="h-5 w-5 text-white" icon={subItem.icon} />
                                        </span>
                                      )}
                                      {t(subItem.title)}
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }
                    })()}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="hidden sm:block">
        {getMenu().map((group, index) => {
          return (
            <div key={index} className="select-none">
              <div className="mt-2">
                <h3 id="Settings-headline" className="px-1 text-xs leading-4 font-semibold text-slate-500 uppercase tracking-wider">
                  {t(group.title)}
                </h3>
              </div>
              {group.items.map((menuItem, index) => {
                return (
                  <div key={index}>
                    {(() => {
                      if (!menuItem.items || menuItem.items.length === 0) {
                        return (
                          <div>
                            <Link
                              to={menuItem.path}
                              className={clsx(
                                "px-4 justify-between mt-1 group flex items-center py-2 text-sm leading-5 rounded-sm hover:text-white text-slate-300 focus:outline-none focus:text-gray-50 transition ease-in-out duration-150",
                                menuItem.icon !== undefined && "px-4",
                                isCurrent(menuItem) && "text-slate-300 bg-theme-600 focus:bg-theme-700",
                                !isCurrent(menuItem) && "text-slate-200 hover:bg-slate-800 focus:bg-slate-800"
                              )}
                            >
                              <div className="flex items-center space-x-5">
                                {menuItem.icon !== undefined && <SidebarIcon className="h-5 w-5 text-white" icon={menuItem.icon} />}
                                <div>{t(menuItem.title)}</div>
                              </div>
                            </Link>
                          </div>
                        );
                      } else {
                        return (
                          <div>
                            <button
                              type="button"
                              className="w-full px-4 justify-between mt-1 group flex items-center py-2 text-sm leading-5 rounded-sm hover:text-white focus:outline-none focus:text-gray-50 transition ease-in-out duration-150 text-slate-200 hover:bg-slate-800 focus:bg-slate-800"
                              onClick={() => toggleMenuItem(index)}
                            >
                              <div className="flex items-center space-x-5">
                                {menuItem.icon !== undefined && <SidebarIcon className="h-5 w-5 text-white" icon={menuItem.icon} />}
                                <div>{t(menuItem.title)}</div>
                              </div>
                              {/*Expanded: "text-gray-400 rotate-90", Collapsed: "text-slate-200" */}
                              <svg
                                className={clsx(
                                  "bg-slate-900 ml-auto h-5 w-5 transform transition-colors ease-in-out duration-150",
                                  menuItemIsExpanded(index)
                                    ? "rotate-90 ml-auto h-3 w-3 transform  transition-colors ease-in-out duration-150"
                                    : "ml-auto h-3 w-3 transform  transition-colors ease-in-out duration-150"
                                )}
                                viewBox="0 0 20 20"
                              >
                                <path d="M6 6L14 10L6 14V6Z" fill="currentColor" />
                              </svg>
                            </button>
                            {/*Expandable link section, show/hide based on state. */}
                            {menuItemIsExpanded(index) && (
                              <div className="mt-1">
                                {menuItem.items.map((subItem, index) => {
                                  return (
                                    <Link
                                      key={index}
                                      to={subItem.path}
                                      className={clsx(
                                        "mt-1 group flex items-center py-2 text-sm leading-5 rounded-sm hover:text-white focus:outline-none focus:text-gray-50 text-slate-300 transition ease-in-out duration-150",
                                        menuItem.icon === undefined && "pl-10",
                                        menuItem.icon !== undefined && "pl-14",
                                        isCurrent(subItem) && "text-slate-300 bg-theme-600 focus:bg-theme-700",
                                        !isCurrent(subItem) && "text-slate-200 hover:bg-slate-800 focus:bg-slate-800"
                                      )}
                                    >
                                      {subItem.icon !== undefined && <SidebarIcon className="h-5 w-5 text-white" icon={subItem.icon} />}
                                      <div>{t(subItem.title)}</div>
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }
                    })()}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
