import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTransition } from "remix";
import { useDashboardData } from "~/utils/data/useDashboardData";

export default function ClientsUsage() {
  const dashboardData = useDashboardData();
  const { t } = useTranslation("translations");
  const transition = useTransition();
  const loading = transition.state === "loading";

  return (
    <Link to="/app/links/clients" className="px-4 py-5 border shadow-md rounded-lg overflow-hidden sm:p-6 bg-white border-gray-300 hover:bg-gray-50">
      <div>
        <dt className="text-sm font-medium text-gray-500 truncate">{t("models.client.plural")}</dt>
        {(() => {
          if (loading) {
            return <dd className="mt-1 text-xl font-semibold text-gray-900">...</dd>;
          } else {
            return (
              <dd className="mt-1 text-gray-900 truncate">
                <span className="text-xl font-semibold">{dashboardData.clients}</span>
              </dd>
            );
          }
        })()}
      </div>
    </Link>
  );
}
