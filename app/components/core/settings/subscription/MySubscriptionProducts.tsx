import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import clsx from "~/utils/shared/ClassesUtils";
import { useAppData } from "~/utils/data/useAppData";
import { useLoaderData, useTransition } from "remix";
import { DashboardLoaderData } from "~/utils/data/useDashboardData";
import clsx from "clsx";

interface Props {
  className?: string;
  withCurrentPlan: boolean;
  cols?: string;
}

export default function MySubscriptionProducts({ className = "", withCurrentPlan = false, cols = "grid-cols-2 sm:grid-cols-2 xl:grid-cols-4" }: Props) {
  const { t } = useTranslation("translations");
  const data = useLoaderData<DashboardLoaderData>();
  const appData = useAppData();
  const transition = useTransition();
  const loading = transition.state === "loading";

  function billableStatus(max: number): number {
    if (loading) {
      return 2;
    }
    if (!appData.mySubscription) {
      return 0;
    }
    if (max === 0) {
      return 1;
    }
    if (max > 0) {
      return 2;
    }
    return 0;
  }

  const maxLinksRemaining = () => {
    if (!appData.mySubscription || !data) {
      return 1;
    }
    const links = data.providers + data.clients;
    const remaining = appData.mySubscription.subscriptionProduct.maxLinks - links;
    return remaining;
  };
  const maxDocumentsRemaining = () => {
    if (!appData.mySubscription || !data) {
      return 1;
    }
    return appData.mySubscription.subscriptionProduct.monthlyContracts - data.contracts;
  };
  const maxWorkspacesRemaining = () => {
    if (!appData.mySubscription || !data) {
      return 1;
    }
    return appData.mySubscription.subscriptionProduct.maxWorkspaces - data.workspaces;
  };
  const maxUsersRemaining = () => {
    if (!appData.mySubscription || !data) {
      return 1;
    }
    return appData.mySubscription.subscriptionProduct.maxUsers - data.users;
  };

  const links = data.clients + data.providers;

  return (
    <div className={className}>
      <div>
        {withCurrentPlan && (
          <div className="space-y-2 sm:space-y-0 sm:flex items-center sm:space-x-2 justify-between">
            <h3 className="leading-5 text-gray-900 truncate">
              {(() => {
                if (loading) {
                  return <span className="leading-5">{t("shared.loading")}...</span>;
                } else if (appData.mySubscription?.subscriptionProduct) {
                  return (
                    <span>
                      {t("settings.subscription.current")}{" "}
                      <Link to="/app/settings/subscription" className="leading-5 font-bold hover:underline hover:text-theme-600">
                        {t(appData.mySubscription?.subscriptionProduct.title)}
                      </Link>
                    </span>
                  );
                } else if (!loading) {
                  return (
                    <span className="ml-1 text-sm leading-5 font-medium text-gray-500">
                      {t("settings.subscription.noActivePlan")},{" "}
                      <Link to="/app/settings/subscription" className=" underline text-blue-600">
                        {t("settings.subscription.clickHereToSubscribe")}
                      </Link>
                    </span>
                  );
                } else {
                  return <div></div>;
                }
              })()}
            </h3>
          </div>
        )}
        <dl className={clsx("grid gap-5", cols, withCurrentPlan && "mt-2 ")}>
          <div
            className={clsx(
              "bg-white px-4 py-5 border border-gray-300 shadow-md rounded-lg overflow-hidden sm:p-6",
              billableStatus(maxLinksRemaining()) === 0 && "bg-rose-50 border-rose-300 hover:bg-rose-100 cursor-pointer",
              billableStatus(maxLinksRemaining()) === 1 && "bg-yellow-50 border-yellow-300 hover:bg-yellow-100 cursor-pointer",
              billableStatus(maxLinksRemaining()) === 2 && "bg-white",
              billableStatus(maxLinksRemaining()) === 3 && "bg-teal-50 border-teal-300 hover:bg-teal-100 cursor-pointer"
            )}
          >
            <dt className="text-sm font-medium text-gray-500 truncate">{t("models.link.plural")}</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-900">
              {(() => {
                if (loading) {
                  return <span>...</span>;
                } else {
                  return (
                    <span>
                      {links ? <span>{links}</span> : <span>0</span>} /{" "}
                      {appData.mySubscription?.subscriptionProduct ? (
                        <span>{appData.mySubscription?.subscriptionProduct.maxLinks}</span>
                      ) : (
                        <span className="text-gray-500">0</span>
                      )}
                    </span>
                  );
                }
              })()}
            </dd>
          </div>

          <Link
            to="/app/contracts?status=pending"
            className={clsx(
              "bg-white px-4 py-5 border border-gray-300 shadow-md rounded-lg overflow-hidden sm:p-6 hover:bg-gray-50",
              billableStatus(maxDocumentsRemaining()) === 0 && "bg-rose-50 border-rose-300 hover:bg-rose-100 cursor-pointer",
              billableStatus(maxDocumentsRemaining()) === 1 && "bg-yellow-50 border-yellow-300 hover:bg-yellow-100 cursor-pointer",
              billableStatus(maxDocumentsRemaining()) === 2 && "bg-white",
              billableStatus(maxDocumentsRemaining()) === 3 && "bg-teal-50 border-teal-300 hover:bg-teal-100 cursor-pointer"
            )}
          >
            <dt className="text-sm font-medium text-gray-500 truncate">{t("models.contract.plural")}</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-900">
              {(() => {
                if (loading) {
                  return <span>...</span>;
                } else {
                  return (
                    <span>
                      {data && data.contracts ? <span>{data.contracts}</span> : <span>0</span>} /{" "}
                      {appData.mySubscription?.subscriptionProduct ? (
                        <span>{appData.mySubscription?.subscriptionProduct.monthlyContracts}</span>
                      ) : (
                        <span className="text-gray-500">0</span>
                      )}
                    </span>
                  );
                }
              })()}
            </dd>
          </Link>

          <Link
            to="/app/settings/workspaces"
            className={clsx(
              "bg-white px-4 py-5 border border-gray-300 shadow-md rounded-lg overflow-hidden sm:p-6 hover:bg-gray-50",
              billableStatus(maxWorkspacesRemaining()) === 0 && "bg-rose-50 border-rose-300 hover:bg-rose-100 cursor-pointer",
              billableStatus(maxWorkspacesRemaining()) === 1 && "bg-yellow-50 border-yellow-300 hover:bg-yellow-100 cursor-pointer",
              billableStatus(maxWorkspacesRemaining()) === 2 && "bg-white",
              billableStatus(maxWorkspacesRemaining()) === 3 && "bg-teal-50 border-teal-300 hover:bg-teal-100 cursor-pointer"
            )}
          >
            <dt className="text-sm font-medium text-gray-500 truncate">{t("models.workspace.plural")}</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-900">
              {(() => {
                if (loading) {
                  return <span>...</span>;
                } else {
                  return (
                    <span>
                      {data ? <span>{data.workspaces}</span> : <span>0</span>} /{" "}
                      {appData.mySubscription?.subscriptionProduct ? (
                        <span>{appData.mySubscription?.subscriptionProduct.maxWorkspaces}</span>
                      ) : (
                        <span className="text-gray-500">0</span>
                      )}
                    </span>
                  );
                }
              })()}
            </dd>
          </Link>
          <Link
            to="/app/settings/members"
            className={clsx(
              "bg-white px-4 py-5 border border-gray-300 shadow-md rounded-lg overflow-hidden sm:p-6 hover:bg-gray-50",
              billableStatus(maxUsersRemaining()) === 0 && "bg-rose-50 border-rose-300 hover:bg-rose-100 cursor-pointer",
              billableStatus(maxUsersRemaining()) === 1 && "bg-yellow-50 border-yellow-300 hover:bg-yellow-100 cursor-pointer",
              billableStatus(maxUsersRemaining()) === 2 && "bg-white",
              billableStatus(maxUsersRemaining()) === 3 && "bg-teal-50 border-teal-300 hover:bg-teal-100 cursor-pointer"
            )}
          >
            <dt className="text-sm font-medium text-gray-500 truncate">{t("models.user.plural")}</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-900">
              {(() => {
                if (loading) {
                  return <span>...</span>;
                } else {
                  return (
                    <span>
                      {data ? <span>{data.users}</span> : <span>0</span>} /{" "}
                      {appData.mySubscription?.subscriptionProduct ? (
                        <span>{appData.mySubscription?.subscriptionProduct.maxUsers}</span>
                      ) : (
                        <span className="text-gray-500">0</span>
                      )}
                    </span>
                  );
                }
              })()}
            </dd>
          </Link>
        </dl>
      </div>
    </div>
  );
}
