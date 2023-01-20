import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { TenantUserRole } from "~/application/enums/core/tenants/TenantUserRole";
import { TenantUserStatus } from "~/application/enums/core/tenants/TenantUserStatus";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import clsx from "~/utils/shared/ClassesUtils";
import { getTenantUsers } from "~/utils/db/tenants.db.server";
import { TenantUser } from "@prisma/client";

interface Props {
  items: Awaited<ReturnType<typeof getTenantUsers>>;
}
export default function MembersListAndTable({ items }: Props) {
  const { t } = useTranslation("translations");

  const [sortByColumn, setSortByColumn] = useState("");
  const [sortDirection, setSortDirection] = useState(1);
  const headers = [
    {
      name: "role",
      title: t("settings.profile.role"),
    },
    {
      name: "email",
      title: t("account.shared.email"),
    },
    {
      name: "firstName",
      title: t("settings.profile.name"),
    },
    {
      title: t("settings.profile.phone"),
    },
    {
      title: t("shared.status"),
    },
  ];

  function getUserRole(item: TenantUser) {
    return t("settings.profile.roles." + TenantUserRole[item.role]);
  }
  function getUserStatus(item: TenantUser) {
    return t("settings.profile.status." + TenantUserStatus[item.status]);
  }
  function getUserRoleClass(item: TenantUser) {
    switch (item.role as TenantUserRole) {
      case TenantUserRole.OWNER:
        return "bg-slate-50 text-gray-800 border border-slate-300";
      case TenantUserRole.ADMIN:
        return "bg-rose-50 border border-rose-200";
      case TenantUserRole.MEMBER:
        return "bg-blue-50 border border-blue-200";
      case TenantUserRole.GUEST:
        return "bg-gray-50 border border-gray-200";
    }
  }
  function sortBy(column: string | undefined) {
    if (column) {
      setSortDirection(sortDirection === -1 ? 1 : -1);
      setSortByColumn(column);
    }
  }

  return (
    <div>
      {(() => {
        if (!items || items.length === 0) {
          return (
            <div>
              <EmptyState
                className="bg-white"
                to="/app/settings/members/new"
                captions={{
                  new: t("shared.add"),
                  thereAreNo: t("app.workspaces.errors.noUsers"),
                }}
                icon="plus"
              />
            </div>
          );
        } else {
          return (
            <div className="flex flex-col">
              <div className="overflow-x-auto">
                <div className="py-2 align-middle inline-block min-w-full">
                  <div className="shadow overflow-hidden border border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {headers.map((header, idx) => {
                            return (
                              <th
                                key={idx}
                                onClick={() => sortBy(header.name)}
                                scope="col"
                                className={clsx(
                                  "text-xs px-2 py-1 text-left font-medium text-gray-500 tracking-wider select-none truncate",
                                  header.name && "cursor-pointer hover:text-gray-700"
                                )}
                              >
                                <div className="flex items-center space-x-1 text-gray-500">
                                  <div>{header.title}</div>
                                  <div className={clsx((!header.name || sortByColumn !== header.name) && "invisible")}>
                                    {(() => {
                                      if (sortDirection === -1) {
                                        return (
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                              fillRule="evenodd"
                                              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        );
                                      } else {
                                        return (
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                              fillRule="evenodd"
                                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        );
                                      }
                                    })()}
                                  </div>
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {items.map((item, idx) => {
                          return (
                            <tr key={idx}>
                              <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-600">
                                <span
                                  className={clsx(
                                    "text-xs w-28 justify-center inline-flex items-center px-1 py-1 rounded-sm font-medium",
                                    getUserRoleClass(item)
                                  )}
                                >
                                  {getUserRole(item)}
                                </span>
                              </td>
                              <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-600">{item.user.email}</td>
                              <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-600">
                                {item.user.firstName} {item.user.lastName}
                              </td>

                              <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-600">{item.user.phone}</td>

                              <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-600">{getUserStatus(item)}</td>
                              {/*<td
                              className="px-2 py-1 whitespace-nowrap text-sm text-gray-600"
                  >{ getUserJoined(item) }</td>*/}
                              <td className="w-20 px-2 py-2 whitespace-nowrap text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Link
                                    to={"/app/settings/members/edit/" + item.id}
                                    className="flex items-center space-x-2 text-theme-600 hover:text-theme-900"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                    <div>{t("shared.edit")}</div>
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          );
        }
      })()}
    </div>
  );
}
