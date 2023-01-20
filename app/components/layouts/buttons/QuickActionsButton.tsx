import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { TenantUserRole } from "~/application/enums/core/tenants/TenantUserRole";
import { useOuterClick } from "~/utils/shared/KeypressUtils";
import { useNavigate } from "remix";
import { useAppData } from "~/utils/data/useAppData";

interface Props {
  className?: string;
}

export default function QuickActionsButton({ className }: Props) {
  const { t } = useTranslation("translations");
  const appData = useAppData();

  const [opened, setOpened] = useState(false);

  const clickOutside = useOuterClick(() => setOpened(false));
  return (
    <span className={className} ref={clickOutside}>
      {appData.currentRole < 3 && (
        <div className="relative">
          <div className="inline-flex shadow-none rounded-sm divide-x divide-gray-300">
            <div className="text-sm relative z-0 inline-flex shadow-none rounded-full">
              <button
                onClick={() => setOpened(!opened)}
                type="button"
                className="text-gray-800 bg-gray-50 border-gray-100 shadow-inner border relative inline-flex items-center p-2 rounded-full font-medium hover:bg-theme-300 hover:text-theme-800 focus:bg-theme-400 focus:text-theme-900 focus:outline-none focus:z-10 focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-50 focus:ring-theme-100"
                aria-haspopup="listbox"
                aria-expanded="true"
                aria-labelledby="listbox-label"
              >
                <span className="sr-only">{t("shared.new")}</span>
                {/*Heroicon name: solid/chevron-down */}
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>

          <Transition
            as={Fragment}
            show={opened}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <ul
              className="z-40 origin-top-right absolute right-0 mt-2 w-72 rounded-sm shadow-lg overflow-hidden bg-white divide-y divide-gray-200 ring-1 ring-black ring-opacity-5 focus:outline-none"
              tabIndex={-1}
              role="listbox"
              aria-labelledby="listbox-label"
              aria-activedescendant="listbox-option-0"
            >
              <li className="text-gray-900 cursor-default select-none relative text-sm" id="listbox-option-0" role="option">
                <Link to="/app/contract/new" onClick={() => setOpened(false)} className="flex flex-col p-4 hover:bg-gray-50">
                  <div className="flex justify-between">
                    <p className="font-semibold">{t("app.contracts.new.title")}</p>
                  </div>
                  <p className="text-gray-500 mt-2">{t("app.contracts.new.description")}</p>
                </Link>
              </li>
              {appData.isOwnerOrAdmin && (
                <>
                  <li className="text-gray-900 cursor-default select-none relative text-sm" id="listbox-option-2" role="option">
                    <Link
                      to="/app/link/new"
                      onClick={() => setOpened(false)}
                      className="w-full text-left flex flex-col p-4 hover:bg-gray-50 focus:outline-none"
                    >
                      <div className="flex justify-between">
                        <p className="font-semibold">{t("app.links.new")}</p>
                      </div>
                      <p className="text-gray-500 mt-2">{t("app.links.newDescription")}</p>
                    </Link>
                  </li>
                  <li className="text-gray-900 cursor-default select-none relative text-sm" role="option">
                    <Link to="/app/settings/workspaces/new" onClick={() => setOpened(false)} className="flex flex-col p-4 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <p className="font-semibold">{t("app.workspaces.create")}</p>
                      </div>
                      <p className="text-gray-500 mt-2">{t("app.workspaces.createDescription")}</p>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </Transition>
        </div>
      )}
    </span>
  );
}
