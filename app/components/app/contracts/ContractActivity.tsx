import { useTranslation } from "react-i18next";
import clsx from "~/utils/shared/ClassesUtils";
import DateUtils from "~/utils/shared/DateUtils";
import { ContractActivityType } from "~/application/enums/app/contracts/ContractActivityType";
import { ContractActivity, User } from "@prisma/client";

interface Props {
  items: (ContractActivity & { createdByUser: User })[];
}

export default function ContractActivity({ items }: Props) {
  const { t } = useTranslation("translations");

  const sortedItems = () => {
    return items.slice().sort((x, y) => {
      if (x.createdAt && y.createdAt) {
        return x.createdAt > y.createdAt ? 1 : -1;
      }
      return 1;
    });
  };

  function dateDM(value: Date | undefined) {
    return DateUtils.dateDM(value);
  }

  function getActivityTitle(activity: ContractActivity) {
    switch (activity.type) {
      case ContractActivityType.CREATED:
        return t("app.contracts.activity.types.CREATED");
      case ContractActivityType.UPDATED:
        return t("app.contracts.activity.types.UPDATED");
    }
  }

  return (
    <div>
      <h3 className="mb-2 text-gray-400 font-medium text-sm">{t("models.contract.activity")}</h3>
      <div className="bg-white p-3 rounded-md border border-gray-100 shadow-md space-y-3 overflow-hidden">
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {sortedItems().map((activity, idxActivity) => {
              return (
                <li key={idxActivity}>
                  <div className="relative pb-8">
                    {items.length > 0 && idxActivity + 1 < items.length && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                    )}

                    <div className="relative flex space-x-3">
                      <div>
                        <span className={clsx("h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white")}>
                          {activity.type === ContractActivityType.CREATED ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          ) : activity.type === ContractActivityType.UPDATED ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          ) : (
                            <></>
                          )}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <div className="min-w-0 flex-1 flex justify-between space-x-4">
                          <div className="truncate">
                            <div className="text-sm text-gray-500">
                              <div className="text-gray-900 truncate">
                                <span title={getActivityTitle(activity)}>{getActivityTitle(activity)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-xs whitespace-nowrap text-gray-500 lowercase">
                            {activity.createdAt && <time>{dateDM(activity.createdAt)}</time>}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 flex justify-between space-x-4">
                          {activity.createdByUser && <div className="font-light text-xs">{activity.createdByUser.email}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
