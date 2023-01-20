import { useTranslation } from "react-i18next";
import { useState } from "react";

import EmptyState from "~/components/ui/emptyState/EmptyState";
import clsx from "~/utils/shared/ClassesUtils";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import { LinkWithWorkspaces } from "~/utils/db/links.db.server";
import { useAppData } from "~/utils/data/useAppData";

interface Props {
  items: LinkWithWorkspaces[];
}

export default function AllLinksListAndTable({ items }: Props) {
  const appData = useAppData();
  const { t } = useTranslation("translations");

  const [sortByColumn, setSortByColumn] = useState("type");
  const [sortDirection, setSortDirection] = useState(-1);
  const headers = [
    {
      name: "name",
      title: t("models.workspace.object"),
    },
    {
      title: t("models.link.type"),
    },
    {
      title: t("models.workspace.businessMainActivity"),
    },
    {
      title: t("shared.actions"),
    },
  ];

  function sortBy(column: string | undefined) {
    if (column) {
      setSortDirection(sortDirection === -1 ? 1 : -1);
      setSortByColumn(column);
    }
  }
  function getWorkspace(item: LinkWithWorkspaces) {
    if (whoAmI(item) === 0) {
      return item.clientWorkspace;
    } else {
      return item.providerWorkspace;
    }
  }
  function whoAmI(item: LinkWithWorkspaces) {
    const currentWorkspaceId = appData.currentWorkspace?.id ?? "";
    if (currentWorkspaceId === item.providerWorkspaceId) {
      return 0;
    }
    return 1;
  }
  const sortedItems = (): LinkWithWorkspaces[] => {
    if (!items) {
      return [];
    }
    const column = sortByColumn;
    if (!column || column === "") {
      return items;
    }
    return items.slice().sort((x, y) => {
      if (x[column] && y[column]) {
        if (sortDirection === -1) {
          return (x[column] > y[column] ? 1 : -1) ?? 1;
        } else {
          return (x[column] < y[column] ? 1 : -1) ?? 1;
        }
      }
      return 1;
    });
  };

  return (
    <div>
      {(() => {
        if (sortedItems().length === 0) {
          return (
            <div>
              <EmptyState
                className="bg-white"
                captions={{
                  thereAreNo: t("app.links.empty"),
                }}
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
                                  "px-3 py-2 text-left text-xs font-medium text-gray-500 tracking-wider select-none",
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
                        {sortedItems().map((link, idx) => {
                          return (
                            <tr key={idx}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                <div className="flex items-end">
                                  <div>
                                    <div className="text-sm font-extrabold text-gray-900">{getWorkspace(link).name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                {(() => {
                                  if (whoAmI(link) === 0) {
                                    return (
                                      <span className="flex-shrink-0 inline-block px-2 py-0.5 text-indigo-800 text-xs font-medium bg-indigo-100 rounded-sm border-indigo-300">
                                        {t("models.client.object")}
                                      </span>
                                    );
                                  } else {
                                    return (
                                      <span className="flex-shrink-0 inline-block px-2 py-0.5 text-theme-800 text-xs font-medium bg-theme-100 rounded-sm border-theme-300">
                                        {t("models.provider.object")}
                                      </span>
                                    );
                                  }
                                })()}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                <div className="max-w-sm truncate">{getWorkspace(link).businessMainActivity}</div>
                              </td>
                              <td className="w-20 px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <ButtonTertiary to={"/app/link/" + link.id}>
                                    <div>{t("app.links.profile.title")}</div>
                                  </ButtonTertiary>
                                  <ButtonTertiary to={"/app/contract/new?l=" + link.id}>
                                    <div>{t("app.contracts.new.title")}</div>
                                  </ButtonTertiary>
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
