import { useTranslation } from "react-i18next";
import { useAppData } from "~/utils/data/useAppData";
import { Link } from "remix";
import clsx from "~/utils/shared/ClassesUtils";

export default function CurrentSubscriptionButton() {
  const { t } = useTranslation("translations");
  const appData = useAppData();

  return (
    <div>
      <div className="inline-flex shadow-none rounded-sm divide-x divide-gray-300">
        <div className="text-xs sm:text-sm relative z-0 inline-flex shadow-none rounded-full">
          <Link
            to="/app/settings/subscription"
            type="button"
            className={clsx(
              "text-gray-800 bg-gray-50 border-gray-100 shadow-inner border relative inline-flex items-center p-2 rounded-md font-medium hover:bg-teal-50 hover:text-teal-800 focus:bg-teal-100 focus:text-teal-900 focus:outline-none focus:z-10 space-x-1",
              appData.mySubscription &&
                "px-3 flex space-x-2 text-teal-900  hover:bg-teal-50 hover:text-teal-800 focus:bg-teal-100 focus:text-teal-900 focus:outline-none focus:z-10",
              !appData.mySubscription &&
                " text-yellow-800 bg-yellow-50 border-yellow-100 hover:bg-yellow-100 hover:text-yellow-900 focus:bg-yellow-100 focus:text-yellow-900 focus:outline-none focus:z-10"
            )}
            aria-haspopup="listbox"
            aria-expanded="true"
            aria-labelledby="listbox-label"
          >
            {appData.mySubscription ? (
              <div>
                <span>{t(appData.mySubscription.subscriptionProduct.title)} </span>
              </div>
            ) : (
              <div>
                <span>{t("pricing.subscribe")} </span>
              </div>
            )}

            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
