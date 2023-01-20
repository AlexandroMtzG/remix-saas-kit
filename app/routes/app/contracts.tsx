import { ContractStatusFilter } from "~/application/contracts/app/contracts/ContractStatusFilter";
import ContractsList from "~/components/app/contracts/ContractsList";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import Tabs from "~/components/ui/tabs/Tabs";
import { useTranslation } from "react-i18next";
import { json, LoaderFunction, MetaFunction, redirect, useLoaderData } from "remix";
import { getUserInfo } from "~/utils/session.server";
import { getContracts } from "~/utils/db/contracts.db.server";

export const meta: MetaFunction = () => ({
  title: "Contracts | Remix SaasFrontend",
});

type LoaderData = {
  items: Awaited<ReturnType<typeof getContracts>>;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const filterString = url.searchParams.get("status");
  let filter: ContractStatusFilter | undefined;
  if (filterString === "pending") {
    filter = ContractStatusFilter.PENDING;
  } else if (filterString === "all") {
    filter = ContractStatusFilter.ALL;
  } else if (filterString === "archived") {
    filter = ContractStatusFilter.ARCHIVED;
  } else if (filterString === "signed") {
    filter = ContractStatusFilter.SIGNED;
  } else {
    return redirect("/app/contracts?status=pending");
  }
  const userInfo = await getUserInfo(request);
  const items = await getContracts(userInfo.currentWorkspaceId, filter);
  const data: LoaderData = {
    items,
  };
  return json(data);
};

export default function ContractsRoute() {
  const data = useLoaderData<LoaderData>();
  const { t } = useTranslation("translations");

  const tabs = [
    {
      name: t("shared.all"),
      routePath: "/app/contracts?status=all",
    },
    {
      name: t("app.contracts.pending.title"),
      routePath: "/app/contracts?status=pending",
    },
    {
      name: t("app.contracts.signed.title"),
      routePath: "/app/contracts?status=signed",
    },
    {
      name: t("app.contracts.archived.title"),
      routePath: "/app/contracts?status=archived",
    },
  ];

  return (
    <div>
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          <h1 className="flex-1 font-bold flex items-center truncate">{t("models.contract.plural")}</h1>
          <div className="flex items-center">
            <ButtonPrimary to="/app/contract/new">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span className="hidden lg:block">{t("app.contracts.new.title")}</span>
              <span className="lg:hidden">{t("shared.new")}</span>
            </ButtonPrimary>
          </div>
        </div>
      </div>
      <div className="bg-white border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          <Tabs tabs={tabs} className="flex-grow" />
        </div>
      </div>
      <div className="pt-2 space-y-2 max-w-5xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ContractsList items={data.items} />
      </div>
    </div>
  );
}
