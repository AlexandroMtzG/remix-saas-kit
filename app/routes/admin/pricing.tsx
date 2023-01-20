import { useTranslation } from "react-i18next";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { useEffect, useRef, useState } from "react";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import plans from "~/application/pricing/plans.server";
import { ActionFunction, Form, json, LoaderFunction, MetaFunction, useActionData, useLoaderData, useTransition } from "remix";
import {
  createSubscriptionFeature,
  createSubscriptionPrice,
  createSubscriptionProduct,
  getAllSubscriptionProducts,
} from "~/utils/db/subscriptionProducts.db.server";
import { SubscriptionProductDto } from "~/application/dtos/core/subscriptions/SubscriptionProductDto";
import { createStripePrice, createStripeProduct } from "~/utils/stripe.server";
import { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import { i18n } from "~/locale/i18n.server";
import clsx from "~/utils/shared/ClassesUtils";

export const meta: MetaFunction = () => ({
  title: "Pricing | Remix SaasFrontend",
});

type LoaderData = {
  onStripe: boolean;
  items: Awaited<ReturnType<typeof getAllSubscriptionProducts>> | SubscriptionProductDto[];
};

export let loader: LoaderFunction = async () => {
  const items = await getAllSubscriptionProducts();
  if (items.length > 0) {
    const data: LoaderData = {
      onStripe: true,
      items,
    };
    return json(data);
  }

  const data: LoaderData = {
    onStripe: false,
    items: plans,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
  onStripe?: boolean;
  items?: Awaited<ReturnType<typeof getAllSubscriptionProducts>>;
};
const success = (data: ActionData) => json(data, { status: 200 });
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  let t = await i18n.getFixedT(request, "translations");

  const items = await getAllSubscriptionProducts();
  if (items.length > 0) {
    return success({
      onStripe: true,
      items,
    });
  }

  try {
    plans.forEach(async (plan) => {
      // Create stripe product
      const stripeProduct = await createStripeProduct({ title: t(plan.title) });
      // Save to db
      const product = await createSubscriptionProduct({
        stripeId: stripeProduct.id,
        tier: plan.tier,
        title: plan.title,
        description: plan.description,
        badge: plan.badge,
        active: plan.active,
        contactUs: plan.contactUs,
        maxWorkspaces: plan.maxWorkspaces,
        maxUsers: plan.maxUsers,
        maxLinks: plan.maxLinks,
        maxStorage: plan.maxStorage,
        monthlyContracts: plan.monthlyContracts,
      });

      plan.prices.forEach(async (price) => {
        // Create stripe price
        const stripePrice = await createStripePrice(stripeProduct.id, price);
        // Save to db
        await createSubscriptionPrice({
          ...price,
          subscriptionProductId: product.id,
          stripeId: stripePrice.id,
        });
      });

      plan.features.forEach(async (feature) => {
        // Save to db
        await createSubscriptionFeature({
          ...feature,
          subscriptionProductId: product.id,
        });
      });
    });

    await new Promise((r) => setTimeout(r, 1000));

    return success({
      onStripe: true,
      items: await getAllSubscriptionProducts(),
    });
  } catch (e: any) {
    return badRequest({ error: e?.toString() });
  }
};

export default function AdminPricingRoute() {
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation("translations");
  const transition = useTransition();
  const loading = transition.state === "submitting" || transition.state === "loading";

  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);

  const [items, setItems] = useState(actionData?.items ?? data.items);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
    if (actionData?.success) {
      successModal.current?.show(t("shared.success"), actionData.success);
    }
    setItems(actionData?.items ?? data.items);
  }, [actionData]);

  const sortedItems = () => {
    return items.sort((x, y) => {
      return x?.tier > y?.tier ? 1 : -1;
    });
  };

  return (
    <div>
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2 ">
          <h1 className="flex-1 font-bold flex items-center truncate">
            {t("admin.pricing.title")}
            <span className="ml-2 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-800 border border-gray-300">
              {sortedItems().length}
            </span>
          </h1>
          <div className="flex items-center space-x-2 h-9">
            <ButtonSecondary to="/pricing" target="_blank">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {!data.onStripe ? <div>{t("shared.preview")}</div> : <div>{t("shared.view")}</div>}
            </ButtonSecondary>
            <ButtonSecondary to=".">{t("shared.reload")}</ButtonSecondary>
          </div>
        </div>
      </div>
      <div className="pt-2 space-y-2 mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl xl:max-w-7xl overflow-auto">
        <div>
          {(() => {
            if (!sortedItems() || sortedItems().length === 0) {
              return <div></div>;
            } else {
              return (
                <div>
                  <Form method="post">
                    <div className="align-middle inline-block min-w-full shadow overflow-hidden sm:rounded-sm border-b border-gray-200 space-y-2">
                      {!data.onStripe && (
                        <div className="bg-yellow-50 mb-2 rounded-sm border border-yellow-300 min-w-full">
                          <div className="rounded-sm bg-yellow-50 p-4">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>

                              <div className="ml-3">
                                <h3 className="text-sm leading-5 font-medium text-yellow-800">{t("shared.warning")}</h3>
                                <div className="mt-2 text-sm leading-5 text-yellow-700">
                                  <p>{t("admin.pricing.thesePricesAreFromFiles")}</p>
                                </div>
                                <div className="text-sm leading-5 right-0 -ml-3 mt-2">
                                  <span className="inline-flex rounded-sm ml-2">
                                    <button
                                      disabled={loading}
                                      type="submit"
                                      className={clsx(
                                        "ml-1 h-8 inline-flex items-center px-4 py-2 border border-orange-200 text-xs leading-5 font-medium rounded-sm text-orange-700 bg-orange-100 focus:outline-none focus:shadow-outline-indigo focus:border-orange-700 active:bg-orange-700 transition duration-150 ease-in-out",
                                        loading ? "bg-opacity-80 cursor-not-allowed" : "hover:bg-orange-200"
                                      )}
                                    >
                                      {t("admin.pricing.generateFromFiles")}
                                    </button>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                          <tr>
                            <th className="px-3 py-3 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.tier")}
                            </th>
                            <th className="px-3 py-3 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.title")}
                            </th>

                            <th className="px-3 py-3 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.badge")}
                            </th>
                            <th className="px-3 py-3 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.status")}
                            </th>
                            <th className="px-3 py-3 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.workspaces")}
                            </th>
                            <th className="px-3 py-3 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.users")}
                            </th>
                            <th className="px-3 py-3 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.links")}
                            </th>
                            <th className="px-3 py-3 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.storage")}
                            </th>
                            <th className="px-3 py-3 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.monthlyContracts")}
                            </th>
                            <th className="px-3 py-3 bg-gray-50 text-left text-xs leading-2 font-medium text-gray-500 tracking-wider truncate">
                              {t("models.subscriptionProduct.serviceId")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sortedItems().map((item, index) => {
                            return (
                              <tr key={index} className="text-gray-600">
                                <td className="truncate px-3 py-3 text-sm leading-3">{item.tier}</td>
                                <td className="truncate px-3 py-3 text-sm leading-3">{t(item.title)}</td>
                                <td className="truncate px-3 py-3 text-sm leading-3">{item.badge && <div>{t(item.badge)}</div>}</td>
                                {/*<td className="truncate px-3 py-3 text-sm leading-3">
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium leading-1"
                        :className="item.active ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-rose-50 text-red-800 border border-red-200'"
                      >{ item.active ? t("shared.active") : t("shared.inactive") }</span>
                    </td>*/}
                                <td className="truncate px-3 py-3 text-sm leading-3">{item.active ? t("shared.active") : t("shared.inactive")}</td>
                                <td className="truncate px-3 py-3 text-sm leading-3">
                                  {!item.maxWorkspaces || item.maxWorkspaces === 0 ? t("shared.unlimited") : item.maxWorkspaces}
                                </td>
                                <td className="truncate px-3 py-3 text-sm leading-3">
                                  {!item.maxUsers || item.maxUsers === 0 ? t("shared.unlimited") : item.maxUsers}
                                </td>
                                <td className="truncate px-3 py-3 text-sm leading-3">
                                  {!item.maxLinks || item.maxLinks === 0 ? t("shared.unlimited") : item.maxLinks}
                                </td>
                                <td className="truncate px-3 py-3 text-sm leading-3">
                                  {!item.maxStorage || item.maxStorage === 0 ? t("shared.unlimited") : item.maxStorage / 1024}
                                  {item.maxStorage > 0 && <span>{t("shared.storage.gb")}</span>}
                                </td>
                                <td className="truncate px-3 py-3 text-sm leading-3">
                                  {!item.monthlyContracts || item.maxLinks === 0 ? t("shared.unlimited") : item.monthlyContracts}
                                </td>
                                <td className="truncate px-3 py-3 text-sm leading-3 text-theme-700">{item.stripeId}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Form>
                </div>
              );
            }
          })()}
        </div>
        <ErrorModal ref={errorModal} />
      </div>
    </div>
  );
}
