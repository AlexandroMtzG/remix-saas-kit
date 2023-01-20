import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Tabs, { TabItem } from "~/components/ui/tabs/Tabs";
import { json, Link, LoaderFunction, MetaFunction, redirect } from "remix";

export const meta: MetaFunction = () => ({
  title: "Links | Remix SaasFrontend",
});

export let loader: LoaderFunction = async ({ request }) => {
  if (new URL(request.url).pathname === "/app/links") {
    throw redirect("/app/links/all");
  }
  return json({});
};

export default function LinksRoute() {
  const { t } = useTranslation("translations");

  const tabs: TabItem[] = [
    {
      name: t("shared.all"),
      routePath: "/app/links/all",
    },
    {
      name: t("models.provider.plural"),
      routePath: "/app/links/providers",
    },
    {
      name: t("models.client.plural"),
      routePath: "/app/links/clients",
    },
    {
      name: t("app.links.pending.title"),
      routePath: "/app/links/pending",
    },
  ];

  return (
    <div>
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          <h1 className="flex-1 font-bold flex items-center truncate">{t("app.links.my")}</h1>
          <div className="flex items-center">
            <Link
              to="/app/link/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 lg:-ml-0.5 h-5 w-5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                  clipRule="evenodd"
                />
              </svg>

              <div>{t("app.links.new")}</div>
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          <Tabs tabs={tabs} className="flex-grow" />
        </div>
      </div>
      <div className="pt-2 space-y-2 mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl xl:max-w-7xl">
        <Outlet />
      </div>
    </div>
  );
}
