import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import WorkspacesListAndTable from "~/components/core/workspaces/WorkspacesListAndTable";
import Loading from "~/components/ui/loaders/Loading";
import { useRef, useState } from "react";
import { json, LoaderFunction, MetaFunction, redirect, useLoaderData } from "remix";
import { getUserInfo } from "~/utils/session.server";
import { TenantUserRole } from "~/application/enums/core/tenants/TenantUserRole";
import { getTenantMember } from "~/utils/db/tenants.db.server";
import { getWorkspaces } from "~/utils/db/workspaces.db.server";

export const meta: MetaFunction = () => ({
  title: "Workspaces | Remix SaasFrontend",
});

export type LoaderData = {
  workspaces: Awaited<ReturnType<typeof getWorkspaces>>;
};

export let loader: LoaderFunction = async ({ request }) => {
  const userInfo = await getUserInfo(request);
  const workspaces = await getWorkspaces(userInfo?.currentTenantId);
  const currentTenantUser = await getTenantMember(userInfo?.userId, userInfo?.currentTenantId);
  if (currentTenantUser?.role !== TenantUserRole.OWNER && currentTenantUser?.role !== TenantUserRole.ADMIN) {
    return redirect("/app/unauthorized");
  }
  const data = {
    workspaces,
  };
  return json(data);
};

export default function WorkspacesRoute() {
  const data = useLoaderData<LoaderData>();
  const { t } = useTranslation("translations");

  const errorModal = useRef<RefErrorModal>(null);

  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!data.workspaces) {
      return [];
    }
    return data.workspaces.filter((f) => f.name?.toString().toUpperCase().includes(searchInput.toUpperCase()));
  };

  return (
    <div>
      <div className="py-4 space-y-2 mx-auto max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        {(() => {
          if (loading) {
            return <Loading />;
          } else {
            return (
              <div>
                <div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="flex items-center justify-between w-full space-x-2">
                        <div className="relative flex items-center w-full flex-grow">
                          <div className="focus-within:z-10 absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <input
                            type="text"
                            name="buscador"
                            id="buscador"
                            className="w-full focus:ring-theme-500 focus:border-theme-500 block rounded-md pl-10 sm:text-sm border-gray-300"
                            placeholder={t("shared.searchDot")}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                          />
                        </div>

                        <Link
                          to="/app/settings/workspaces/new"
                          className="inline-flex space-x-2 items-center px-2 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>

                          <div>{t("shared.new")}</div>
                        </Link>
                      </div>
                    </div>
                    <div>
                      <WorkspacesListAndTable items={filteredItems()} />
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        })()}
      </div>
      <ErrorModal ref={errorModal} />
      <Outlet />
    </div>
  );
}
