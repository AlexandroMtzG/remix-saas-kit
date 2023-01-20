import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import DateUtils from "~/utils/shared/DateUtils";
import clsx from "~/utils/shared/ClassesUtils";
import { LinkWithWorkspaces, LinkWithWorkspacesAndContracts } from "~/utils/db/links.db.server";

interface Props {
  items: LinkWithWorkspacesAndContracts[];
}

export default function ProvidersListAndTable({ items }: Props) {
  const { t } = useTranslation("translations");

  const [sortByColumn, setSortByColumn] = useState("status");
  const [sortDirection, setSortDirection] = useState(-1);
  const headers = [
    {
      name: "name",
      title: t("models.provider.object"),
    },
    {
      title: t("models.contract.plural"),
    },
    {
      title: t("shared.actions"),
    },
  ];

  // useEffect(() => {

  // }, [])

  function sortBy(column: string | undefined) {
    if (column) {
      setSortDirection(sortDirection === -1 ? 1 : -1);
      setSortByColumn(column);
    }
  }
  function dateMonthName(value: Date | undefined) {
    return DateUtils.dateMonthName(value);
  }
  const sortedItems = () => {
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
                  thereAreNo: t("app.providers.empty"),
                }}
              />
            </div>
          );
        } else {
          return (
            <div>
              <div className="sm:hidden">
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul role="list" className="divide-y divide-gray-200">
                    {sortedItems().map((item, idx) => {
                      return (
                        <li key={idx}>
                          <Link to={"/app/link/" + item.id} className="block hover:bg-gray-50">
                            <div className="flex items-center px-4 py-4 sm:px-6">
                              <div className="min-w-0 flex-1 flex items-center">
                                <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                                  <div>
                                    <div className="flex items-end justify-between">
                                      <div className="text-sm truncate font-bold text-gray-900 flex-grow">{item.providerWorkspace.name}</div>
                                    </div>
                                  </div>
                                  <div className="hidden md:block">
                                    <div>
                                      <p className="text-sm text-gray-900">{item.createdAt && <time>{dateMonthName(item.createdAt)}</time>}</p>
                                      <p className="mt-2 flex items-center text-sm text-gray-500">
                                        {/*Heroicon name: solid/check-circle */}
                                        <svg
                                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400"
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                          aria-hidden="true"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                {/*Heroicon name: solid/chevron-right */}
                                <svg
                                  className="h-5 w-5 text-gray-400"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
              <div className="hidden sm:block">
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
                            {sortedItems().map((item, idx) => {
                              return (
                                <tr key={idx}>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="text-sm font-extrabold text-gray-900">{item.providerWorkspace.name}</div>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                    {(() => {
                                      if (item.contracts && item.contracts.length === 0) {
                                        return <span className="italic text-gray-400">{t("shared.notApplicable")}</span>;
                                      } else {
                                        return (
                                          <Link
                                            to={"/app/contracts?status=all&l=" + item.id}
                                            className="text-theme-600 hover:text-theme-800 lowercase underline font-medium"
                                          >
                                            {item.contracts && (
                                              <span>
                                                {item.contracts.length}
                                                {(() => {
                                                  if (item.contracts.length === 1) {
                                                    return <span>{t("models.contract.object")}</span>;
                                                  } else {
                                                    return <span>{t("models.contract.plural")}</span>;
                                                  }
                                                })()}
                                              </span>
                                            )}
                                          </Link>
                                        );
                                      }
                                    })()}
                                  </td>

                                  <td className="w-20 px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                    <div className="flex items-center space-x-2">
                                      <ButtonTertiary to={"/app/contract/new?l=" + item.id}>
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
              </div>
            </div>
          );
        }
      })()}
    </div>
  );
}
