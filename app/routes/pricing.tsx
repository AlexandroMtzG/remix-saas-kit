import Header from "~/components/front/Header";
import Plans from "~/components/core/settings/subscription/Plans";
import Footer from "~/components/front/Footer";
import { useTranslation } from "react-i18next";
import { getAllSubscriptionProducts } from "~/utils/db/subscriptionProducts.db.server";
import { LoaderFunction, json, useLoaderData, MetaFunction } from "remix";
import { i18n } from "~/locale/i18n.server";
import { Language } from "remix-i18next";
import { SubscriptionProductDto } from "~/application/dtos/core/subscriptions/SubscriptionProductDto";
import plans from "~/application/pricing/plans.server";

export const meta: MetaFunction = () => ({
  title: "Pricing | Remix SaasFrontend",
});

type LoaderData = {
  i18n: Record<string, Language>;
  items: SubscriptionProductDto[];
};
export let loader: LoaderFunction = async ({ request }) => {
  const items = await getAllSubscriptionProducts();
  const data: LoaderData = {
    i18n: await i18n.getTranslations(request, ["translations"]),
    items: items.length > 0 ? items : plans,
  };
  return json(data);
};

export default function PricingRoute() {
  const data = useLoaderData<LoaderData>();
  const { t } = useTranslation("translations");
  return (
    <div>
      <div>
        <Header />
        <div className="bg-white dark:bg-gray-900 pt-6 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-slate-200 sm:text-4xl">{t("front.pricing.title")}</h2>
              <p className="mt-4 text-lg leading-6 text-gray-500">{t("front.pricing.headline")}</p>
            </div>
            <Plans items={data.items} />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
