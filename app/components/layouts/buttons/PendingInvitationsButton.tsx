import { useTranslation } from "react-i18next";
import clsx from "~/utils/shared/ClassesUtils";
import { Link } from "remix";
import { useAppData } from "~/utils/data/useAppData";

export default function PendingInvitationsButton() {
  const { t } = useTranslation("translations");
  const appData = useAppData();

  return (
    <div>
      {/*Pending invitations (links) */}
      {appData.currentRole < 3 && (
        <div className="inline-flex shadow-none rounded-sm divide-x divide-gray-300">
          <div className="text-sm relative z-0 inline-flex shadow-none rounded-full">
            <Link
              to="/app/links/pending"
              type="button"
              className={clsx(
                "text-gray-800 bg-gray-50 border-gray-100 shadow-inner border relative inline-flex items-center p-2 rounded-full font-medium hover:bg-theme-300 hover:text-theme-800 focus:bg-theme-400 focus:text-theme-900 focus:outline-none focus:z-10 focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-50 focus:ring-theme-100",
                appData.pendingInvitations > 0 &&
                  "px-3 flex space-x-2 text-theme-900 bg-theme-50 border-theme-300 hover:bg-theme-100 hover:text-theme-800 focus:bg-theme-200 focus:text-theme-900 focus:outline-none focus:z-10 focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-50 focus:ring-theme-100",
                !appData.pendingInvitations ||
                  (appData.pendingInvitations === 0 &&
                    " text-gray-800 bg-gray-50 border-gray-100 hover:bg-theme-300 hover:text-theme-800 focus:bg-theme-400 focus:text-theme-900 focus:outline-none focus:z-10 focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-50 focus:ring-theme-50")
              )}
              aria-haspopup="listbox"
              aria-expanded="true"
              aria-labelledby="listbox-label"
            >
              {appData.pendingInvitations > 0 && (
                <div>
                  <span>{appData.pendingInvitations} </span>
                  {(() => {
                    if (appData.pendingInvitations === 1) {
                      return <span className="hidden md:inline-block lowercase">{t("app.links.pending.one")}</span>;
                    } else {
                      return <span className="hidden md:inline-block lowercase">{t("app.links.pending.multiple")}</span>;
                    }
                  })()}
                </div>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </Link>
          </div>
        </div>
      )}
      {/*Pending invitations (links): End */}
    </div>
  );
}
