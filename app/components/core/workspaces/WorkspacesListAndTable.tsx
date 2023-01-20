import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { WorkspaceType } from "~/application/enums/core/tenants/WorkspaceType";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import { User, Workspace, WorkspaceUser } from "@prisma/client";
import { getWorkspaces, getWorkspace } from "~/utils/db/workspaces.db.server";

interface Props {
  items: Awaited<ReturnType<typeof getWorkspaces>>;
}

export default function WorkspacesListAndTable({ items }: Props) {
  const { t } = useTranslation("translations");

  const headers = [
    {
      title: t("models.workspace.object"),
    },
    {
      title: t("models.workspace.type"),
    },
    {
      title: t("models.user.plural"),
    },
    {
      title: t("shared.actions"),
    },
  ];

  function workspaceType(item: Workspace) {
    return t("app.workspaces.types." + WorkspaceType[item.type]);
  }
  function userEmails(item: Awaited<ReturnType<typeof getWorkspace>>) {
    return item?.users?.map((f) => f.user.firstName).join(", ");
  }

  return (
    <div>
      {(() => {
        if (!items || items.length === 0) {
          return (
            <div>
              <EmptyState
                className="bg-white"
                to="/app/settings/workspaces/new"
                captions={{
                  new: t("shared.add"),
                  thereAreNo: t("app.workspaces.errors.noWorkspaces"),
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
                              <th key={idx} scope="col" className="text-xs px-2 py-1 text-left font-medium text-gray-500 tracking-wider select-none truncate">
                                <div className="flex items-center space-x-1 text-gray-500">
                                  <div>{header.title}</div>
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
                                <div>
                                  <div className="text-sm font-bold">{item.name}</div>
                                </div>
                              </td>
                              <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-600">
                                <div>{workspaceType(item)}</div>
                              </td>
                              <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-600">
                                <div>{userEmails(item)}</div>
                              </td>

                              <td className="w-20 px-2 py-2 whitespace-nowrap text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Link
                                    to={"/app/settings/workspaces/edit/" + item.id}
                                    className="flex items-center space-x-2 text-theme-600 hover:text-theme-900 hover:underline"
                                  >
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
