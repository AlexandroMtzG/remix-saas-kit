import TenantProfile from "~/components/core/tenants/TenantProfile";
import TenantSubscription from "~/components/core/tenants/TenantSubscription";
import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import Tabs, { TabItem } from "~/components/ui/tabs/Tabs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { MetaFunction } from "remix";

export const meta: MetaFunction = () => ({
  title: "Tenant | Remix SaasFrontend",
});

export default function AdminTenantRoute() {
  const { t } = useTranslation("translations");
  const { id } = useParams();
  const [selected, setSelected] = useState(0);

  const tabs: TabItem[] = [
    {
      routePath: "profile",
      name: t("admin.tenants.profile.title"),
    },
    {
      routePath: "subscription",
      name: t("admin.tenants.subscription.title"),
    },
  ];

  function selectedTab(idx: number) {
    setSelected(Number(idx));
  }

  return (
    <div>
      <Breadcrumb home="/admin" menu={[{ title: t("models.tenant.plural"), routePath: "/admin/tenants" }]}></Breadcrumb>
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-3 px-8 h-13">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between">
          <Tabs tabs={tabs} className="flex-grow" />
        </div>
      </div>
      <div>
        hello
        {/* {selected === 0 && <TenantProfile id={id} />}
        {selected === 1 && <TenantSubscription id={id} />} */}
      </div>
    </div>
  );
}
