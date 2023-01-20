import { SubscriptionBillingPeriod } from "~/application/enums/core/subscriptions/SubscriptionBillingPeriod";
import clsx from "~/utils/shared/ClassesUtils";
import NumberUtils from "~/utils/shared/NumberUtils";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import Loading from "~/components/ui/loaders/Loading";
import { json, LoaderFunction, useLoaderData, useSubmit, useTransition } from "remix";
import { getAllSubscriptionProducts, getSubscriptionPrice, getSubscriptionProduct } from "~/utils/db/subscriptionProducts.db.server";
import { SubscriptionPrice, SubscriptionProduct } from "@prisma/client";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";

interface Props {
  current: (SubscriptionPrice & { subscriptionProduct: SubscriptionProduct }) | null;
  items: Awaited<ReturnType<typeof getAllSubscriptionProducts>>;
  billingPeriod: SubscriptionBillingPeriod;
  currency: string;
}
export default function ChangeSubscription({ items, current, billingPeriod, currency }: Props) {
  const { t } = useTranslation("translations");
  const transition = useTransition();
  const loading = transition.state === "loading" || transition.state === "submitting";
  const navigate = useNavigate();
  const submit = useSubmit();

  const confirmModal = useRef<RefConfirmModal>(null);

  const [products] = useState(items.filter((f) => !f.contactUs));

  function billingPeriodOnce(product: SubscriptionProduct & { prices: SubscriptionPrice[] }): boolean | undefined {
    return getPrice(product)?.billingPeriod === SubscriptionBillingPeriod.ONCE;
  }
  function productUrl(product: SubscriptionProduct & { prices: SubscriptionPrice[] }) {
    if (product.contactUs) {
      return "/contact";
    }
    return "/register";
  }
  function getPrice(product: SubscriptionProduct & { prices: SubscriptionPrice[] }): SubscriptionPrice | undefined {
    const prices = product.prices.find(
      (f) => (f.billingPeriod === billingPeriod || f.billingPeriod === SubscriptionBillingPeriod.ONCE) && f.currency === currency && f.active
    );
    return prices;
  }
  function getPriceAmount(product: SubscriptionProduct & { prices: SubscriptionPrice[] }): number {
    return getPrice(product)?.price ?? 0;
  }
  function getPriceTrialDays(product: SubscriptionProduct & { prices: SubscriptionPrice[] }): number {
    return getPrice(product)?.trialDays ?? 0;
  }
  function intFormat(value: number) {
    return NumberUtils.intFormat(value);
  }

  function selectPrice(product: SubscriptionProduct & { prices: SubscriptionPrice[] }) {
    const price = getPrice(product);
    if (!price) {
      return;
    }
    if (!isCurrent(product)) {
      const form = new FormData();
      form.set("type", "subscribe");
      form.set("price-id", price.id);
      submit(form, {
        method: "post",
      });
    } else {
      cancel();
    }
  }

  function isCurrent(plan: SubscriptionProduct) {
    return current?.subscriptionProduct?.id === plan.id;
  }
  function getButtonTitle(plan: SubscriptionProduct) {
    if (isCurrent(plan)) {
      return t("shared.subscribed");
    }
    if (current) {
      return isUpgrade(plan) ? t("shared.upgrade") : t("shared.downgrade");
    }
    return t("pricing.subscribe");
  }

  function isDowngrade(plan: SubscriptionProduct) {
    if (current) {
      return plan.tier < current?.subscriptionProduct.tier;
    }
    return false;
  }

  function isUpgrade(plan: SubscriptionProduct) {
    if (!current) {
      return true;
    }
    return plan.tier > current?.subscriptionProduct.tier;
  }

  function cancel() {
    confirmModal.current?.show(t("settings.subscription.confirmCancel"));
  }
  function confirmCancel() {
    const form = new FormData();
    form.set("type", "cancel");
    submit(form, {
      method: "post",
    });
  }

  return (
    <div>
      <div className="container mx-auto antialiased mt-6">
        <main className="">
          {loading ? (
            <Loading />
          ) : (
            <div className="space-y-2">
              <div className={clsx("mt-6 grid gap-4 lg:gap-2", products.length === 2 && "lg:grid-cols-2", products.length > 2 && "lg:grid-cols-3")}>
                {products
                  .filter((f) => !f.contactUs)
                  .map((plan, index) => {
                    return (
                      <div key={index}>
                        <section
                          className={clsx(
                            "relative flex flex-col w-full p-6 rounded-md shadow-sm",
                            !isCurrent(plan) && "border border-teal-800",
                            isCurrent(plan) && "border-2 border-teal-600"
                          )}
                        >
                          {isCurrent(plan) && (
                            <div className="absolute top-0 py-1.5 px-4 bg-teal-500 rounded-full text-xs font-semibold uppercase tracking-wide text-white transform -translate-y-1/2">
                              {t("shared.current")}
                            </div>
                          )}
                          <div className="flex-1 space-y-2">
                            {/* Price */}
                            <div className="flex-shrink-0 truncate">
                              <span className="text-2xl font-medium tracking-tight">{intFormat(getPriceAmount(plan))}</span>
                              {(() => {
                                if (billingPeriod === 3) {
                                  return <span className="text-gray-500">/ {t("pricing.MONTHLYShort")}</span>;
                                } else {
                                  return <span className="text-gray-500">/ {t("pricing.YEARLYShort")}</span>;
                                }
                              })()}
                            </div>

                            {/* Badge */}
                            <div className="flex-shrink-0 pb-3 space-y-2 border-b">
                              <h2 className="text-lg font-normal">{t(plan.title)}</h2>
                            </div>

                            {/* Features */}
                            <ul className="flex-1 space-y-1">
                              {plan.features
                                .sort((a, b) => (a.order > b.order ? 1 : -1))
                                .map((feature, idxFeature) => {
                                  return (
                                    <li key={idxFeature}>
                                      <div className="flex items-center">
                                        {(() => {
                                          if (feature.included) {
                                            return (
                                              <svg
                                                className="w-4 h-4 text-teal-500 opacity-70"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                              >
                                                <path
                                                  fillRule="evenodd"
                                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                  clipRule="evenodd"
                                                />
                                              </svg>
                                            );
                                          } else {
                                            return (
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-4 h-4 text-gray-300"
                                                viewBox="0 0 20 20"
                                                stroke="#FFFFF"
                                                fill="currentColor"
                                              >
                                                <path
                                                  fillRule="evenodd"
                                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                  clipRule="evenodd"
                                                />
                                              </svg>
                                            );
                                          }
                                        })()}
                                        <span className="ml-3 text-sm truncate">
                                          <span>{t(feature.key, [feature.value])}</span>
                                        </span>
                                      </div>
                                    </li>
                                  );
                                })}
                            </ul>

                            {/* Button */}
                            <div className="flex-shrink-0 pt-4">
                              <button
                                disabled={loading || isCurrent(plan)}
                                type="button"
                                onClick={() => selectPrice(plan)}
                                className={clsx(
                                  "inline-flex items-center justify-center w-full px-4 py-2 transition-colors border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2",
                                  isCurrent(plan) || loading ? "opacity-80" : "hover:bg-gray-100 border-slate-800",
                                  isUpgrade(plan) && "hover:text-teal-600",
                                  isDowngrade(plan) && "hover:text-red-600"
                                )}
                              >
                                {getButtonTitle(plan)}
                                {/* {(() => {
                                if (getPriceAmount(plan) === 0) {
                                  return <span>{t("pricing.signUpFree")}</span>;
                                } else if (billingPeriodOnce(plan)) {
                                  return <span>{t("pricing.payOnce")}</span>;
                                } else if (getPriceTrialDays(plan) > 0) {
                                  return <span>{t("pricing.startTrial", [getPriceTrialDays(plan)])}</span>;
                                } else {
                                  return <span>{t("pricing.subscribe")}</span>;
                                }
                              })()} */}
                              </button>
                            </div>
                          </div>
                        </section>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </main>
      </div>
      <ConfirmModal ref={confirmModal} onYes={confirmCancel} />
    </div>
  );
}
