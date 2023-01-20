import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EmployeeDto } from "~/application/dtos/app/employees/EmployeeDto";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import DateUtils from "~/utils/shared/DateUtils";
import { useState, useEffect } from "react";
import clsx from "~/utils/shared/ClassesUtils";

interface Props {
  items: EmployeeDto[];
  className?: string;
  canEdit?: boolean;
}

export default function EmployeesListAndTable({ className = "", canEdit = true, items }: Props) {
  const { t } = useTranslation("translations");

  const [sortByColumn, setSortByColumn] = useState("");
  const [sortDirection, setSortDirection] = useState(-1);
  const [headers, setHeaders] = useState<any[]>([
    {
      name: "firstName",
      title: t("models.employee.firstName"),
    },
    {
      name: "lastName",
      title: t("models.employee.lastName"),
    },
  ]);

  useEffect(() => {
    if (canEdit) {
      setHeaders([
        ...headers,
        {
          name: "email",
          title: t("models.employee.email"),
        },
        {
          title: t("shared.actions"),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sortBy(column: string) {
    if (column) {
      setSortDirection(sortDirection === -1 ? 1 : -1);
      setSortByColumn(column);
    }
  }
  function dateMonthName(value: Date | undefined) {
    return DateUtils.dateMonthName(value);
  }
  const sortedItems = (): EmployeeDto[] => {
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
    <div className={className}>
      {(() => {
        if (sortedItems().length === 0) {
          return (
            <div>
              <EmptyState
                className="bg-white"
                to="/app/employees/new"
                captions={{
                  new: t("shared.add"),
                  thereAreNo: t("app.employees.errors.notDefined"),
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
                    {sortedItems().map((employee, idxEmployee) => {
                      return (
                        <li key={idxEmployee}>
                          <Link to={"/app/employees/" + employee.id} className="block hover:bg-gray-50">
                            <div className="flex items-center px-4 py-2 sm:px-4">
                              <div className="min-w-0 flex-1 flex items-center">
                                <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                                  <div>
                                    <div className="mt-2 flex items-center justify-between text-gray-500 space-x-1">
                                      <div className="truncate">
                                        {employee.firstName} {employee.lastName}
                                      </div>
                                      <div className="text-sm">{employee.email}</div>
                                    </div>
                                  </div>
                                  <div className="hidden md:block">
                                    <div>
                                      <p className="text-sm text-gray-900">{employee.createdAt && <time>{dateMonthName(employee.createdAt)}</time>}</p>
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
                                      "text-xs px-4 py-2 text-left font-medium text-gray-500 tracking-wider select-none truncate",
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
                            {sortedItems().map((employee, idxEmployee) => {
                              return (
                                <tr key={idxEmployee}>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{employee.firstName}</td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{employee.lastName}</td>
                                  {canEdit && <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{employee.email}</td>}

                                  {canEdit && (
                                    <td className="w-20 px-2 py-4 whitespace-nowrap text-sm text-gray-600">
                                      <div className="flex items-center space-x-2">
                                        <ButtonTertiary to={"/app/employees/" + employee.id}>{t("shared.edit")}</ButtonTertiary>
                                      </div>
                                    </td>
                                  )}
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
