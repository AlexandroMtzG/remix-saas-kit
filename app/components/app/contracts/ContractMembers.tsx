import { ContractMember, User } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { useAppData } from "~/utils/data/useAppData";

import clsx from "~/utils/shared/ClassesUtils";

interface Props {
  items: (ContractMember & { user: User })[];
}

export default function ContractMembers({ items }: Props) {
  const appData = useAppData();
  const { t } = useTranslation("translations");
  const sortedItems = () => {
    return items?.slice().sort((x, y) => {
      return x.user.firstName > y.user.firstName ? 1 : -1;
    });
  };

  return (
    <div>
      <h3 className="mb-2 text-gray-400 font-medium text-sm">{t("models.contract.members")}</h3>
      <div className="bg-white border-gray-200 rounded-md border shadow-md overflow-hidden">
        <div className="flow-root">
          <ul role="list" className="divide-y divide-gray-200">
            {sortedItems().map((member, idxMember) => {
              return (
                <li key={idxMember} className={clsx("flex items-center justify-between py-2 px-4 space-x-2")}>
                  <div className="truncate">
                    <div className="text-sm font-medium text-gray-800 truncate flex items-center space-x-1 justify-between">
                      <div className="text-sm font-medium text-gray-800 truncate flex items-center space-x-1 justify-between">
                        {member.user.email === appData.user?.email && <span className="text-theme-600 font-normal capitalize mr-1">({t("shared.you")})</span>}
                        {member.user.firstName} {member.user.lastName}
                      </div>

                      {member.role === 0 && (
                        <div className="text-gray-400 inline-flex items-centerpx-2.5 py-0.5 text-sm leading-5 font-medium rounded-full hover:bg-gray-50"></div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 justify-between truncate">
                      <p className="text-sm text-gray-500 truncate">{member.user.email}</p>
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
