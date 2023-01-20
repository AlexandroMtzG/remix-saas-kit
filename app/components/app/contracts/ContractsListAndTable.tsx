import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import IconContractArchived from "~/assets/icons/IconContractArchived";
import IconContractCheck from "~/assets/icons/IconContractCheck";
import IconContractClock from "~/assets/icons/IconContractClock";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import DateUtils from "~/utils/shared/DateUtils";
import { useState } from "react";
import clsx from "~/utils/shared/ClassesUtils";
import { getContracts } from "~/utils/db/contracts.db.server";
import { useAppData } from "~/utils/data/useAppData";
import { Contract } from "@prisma/client";

interface Props {
  items: Awaited<ReturnType<typeof getContracts>>;
}

export default function ContractsListAndTable({ items }: Props) {
  const { t } = useTranslation("translations");
  const appData = useAppData();
  const navigate = useNavigate();

  const [sortByColumn, setSortByColumn] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState(1);
  const headers = [
    {
      name: "name",
      title: t("models.contract.name"),
    },
    {
      title: t("models.provider.object"),
    },
    {
      title: t("models.client.object"),
      sortable: true,
    },
    {
      name: "status",
      title: t("models.contract.status"),
    },
    {
      name: "createdAt",
      title: t("shared.created"),
    },
  ];

  function sortBy(column: string | undefined) {
    if (column) {
      setSortDirection(sortDirection === -1 ? 1 : -1);
      setSortByColumn(column);
    }
  }
  function isCurrentWorkspace(id: string) {
    return appData.currentWorkspace?.id === id;
  }
  function dateMonthName(value: Date | undefined) {
    return DateUtils.dateMonthName(value);
  }
  function dateDM(value: Date | undefined) {
    return DateUtils.dateDM(value);
  }
  function clicked(item: Contract) {
    navigate("/app/contract/" + item.id);
  }
  const sortedItems = () => {
    if (!items) {
      return [];
    }
    const column = sortByColumn;
    if (!column) {
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
                to="/app/contract/new"
                captions={{
                  new: t("shared.add"),
                  thereAreNo: t("app.contracts.errors.noContracts"),
                }}
                icon="plus"
              />
            </div>
          );
        } else {
          return (
            <div>
              <div className="sm:hidden">
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul role="list" className="divide-y divide-gray-200">
                    {sortedItems().map((contract, idxContract) => {
                      return (
                        <li key={idxContract}>
                          <Link to={"/app/contract/" + contract.id} className="block hover:bg-gray-50">
                            <div className="flex items-center px-4 py-4 sm:px-6">
                              <div className="min-w-0 flex-1 flex items-center">
                                <div className="flex-shrink-0">
                                  {contract.status === 0 && <IconContractClock className="h-10 w-10 text-yellow-500" />}
                                  {contract.status === 1 && <IconContractCheck className="h-10 w-10 text-teal-500" />}
                                  {contract.status === 2 && <IconContractArchived className="h-10 w-10 text-gray-500" />}
                                </div>
                                <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                                  <div>
                                    <div className="flex items-end justify-between">
                                      <div className="text-sm truncate font-bold text-gray-900 flex-grow">{contract.name}</div>
                                      <div>{contract.createdAt && <span className="text-xs text-gray-600 truncate">{dateDM(contract.createdAt)}</span>}</div>
                                    </div>
                                    <div className="mt-2 flex items-center text-sm text-gray-500 space-x-1">
                                      <div className="truncate">
                                        {contract.link.providerWorkspace.name}{" "}
                                        {isCurrentWorkspace(contract.link.providerWorkspaceId) && (
                                          <span className="text-theme-600 font-normal lowercase">({t("shared.you")})</span>
                                        )}
                                      </div>
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-theme-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                          fillRule="evenodd"
                                          d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      <div className="truncate">
                                        {contract.link.clientWorkspace.name}{" "}
                                        {isCurrentWorkspace(contract.link.clientWorkspace.name) && (
                                          <span className="text-theme-600 font-normal lowercase">({t("shared.you")})</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="hidden md:block">
                                    <div>
                                      <p className="text-sm text-gray-900">{contract.createdAt && <time>{dateMonthName(contract.createdAt)}</time>}</p>
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
                                      "px-6 py-2 text-left text-xs font-medium text-gray-500 tracking-wider select-none",
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
                          {sortedItems().map((contract, idxContract) => {
                            return (
                              <tbody key={idxContract} onClick={() => clicked(contract)} className="bg-white divide-y divide-gray-200">
                                <tr className="hover:bg-gray-50 cursor-pointer">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center max-w-xs truncate space-x-4">
                                      <div className="flex-shrink-0 h-10 w-10">
                                        {contract.status === 0 && <IconContractClock className="h-10 w-10 text-yellow-500" />}
                                        {contract.status === 1 && <IconContractCheck className="h-10 w-10 text-teal-500" />}
                                        {contract.status === 2 && <IconContractArchived className="h-10 w-10 text-gray-500" />}
                                      </div>
                                      <div className="truncate">
                                        <div className="text-sm font-extrabold text-gray-900 truncate">{contract.name}</div>
                                        <div className="text-sm text-gray-500 flex items-center space-x-1 truncate">{contract.description}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-700">
                                      {contract.link.providerWorkspace.name}{" "}
                                      {isCurrentWorkspace(contract.link.providerWorkspace.name) && (
                                        <span className="text-theme-600 font-normal lowercase">({t("shared.you")})</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-700">
                                      {contract.link.clientWorkspace.name}{" "}
                                      {isCurrentWorkspace(contract.link.clientWorkspace.name) && (
                                        <span className="text-theme-600 font-normal lowercase">({t("shared.you")})</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {contract.status === 0 && (
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 space-x-2 items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                          <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        <div>{t("app.contracts.status.PENDING")}</div>
                                      </span>
                                    )}
                                    {contract.status === 1 && (
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800 space-x-2 items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
                                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                        <div>{t("app.contracts.status.SIGNED")}</div>
                                      </span>
                                    )}
                                    {contract.status === 2 && (
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 space-x-2 items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                          <path
                                            fillRule="evenodd"
                                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        <div>{t("app.contracts.status.ARCHIVED")}</div>
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-xs text-gray-600">{contract.createdAt && <span>{dateDM(contract.createdAt)}</span>}</div>
                                    <div className="text-xs text-gray-700">{contract.createdByUser && <span>{contract.createdByUser.email}</span>}</div>
                                  </td>
                                </tr>
                              </tbody>
                            );
                          })}
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
