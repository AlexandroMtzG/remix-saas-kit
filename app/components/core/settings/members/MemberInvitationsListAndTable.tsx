import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { TenantUserRole } from "~/application/enums/core/tenants/TenantUserRole";
import { TenantUserStatus } from "~/application/enums/core/tenants/TenantUserStatus";
import clsx from "~/utils/shared/ClassesUtils";
import { TenantUserInvitation } from "@prisma/client";
import { useSubmit } from "remix";

interface Props {
  items: TenantUserInvitation[];
}
export default function MemberInvitationsListAndTable({ items }: Props) {
  const { t } = useTranslation("translations");
  const submit = useSubmit();

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
  ];

  function getUserRole(item: TenantUserInvitation) {
    return t("settings.profile.roles." + TenantUserRole[item.role]);
  }
  function getUserRoleClass(item: TenantUserInvitation) {
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

  function deleteUserInvitation(invitation: TenantUserInvitation) {
    const form = new FormData();
    form.set("type", "delete-invitation");
    form.set("invitation-id", invitation.id);
    submit(form, {
      method: "post",
    });
  }

  return (
    <div>
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
                            className={clsx("text-xs w-28 justify-center inline-flex items-center px-1 py-1 rounded-sm font-medium", getUserRoleClass(item))}
                          >
                            {getUserRole(item)}
                          </span>
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-600">{item.email}</td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-600">
                          {item.firstName} {item.lastName}
                        </td>

                        <td className="w-20 px-2 py-2 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => deleteUserInvitation(item)}
                              className="flex items-center space-x-2 text-red-600 hover:text-red-900"
                            >
                              {t("shared.delete")}
                            </button>
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
    </div>
  );
}
