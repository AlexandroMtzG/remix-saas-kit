import { SubscriptionBillingPeriod } from "~/application/enums/core/subscriptions/SubscriptionBillingPeriod";
import clsx from "~/utils/shared/ClassesUtils";
import NumberUtils from "~/utils/shared/NumberUtils";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import { useSubmit, useTransition } from "remix";
import { SubscriptionProductDto } from "~/application/dtos/core/subscriptions/SubscriptionProductDto";
import { SubscriptionPriceDto } from "~/application/dtos/core/subscriptions/SubscriptionPriceDto";

interface Props {
  items: SubscriptionProductDto[];
}
export default function Plans({ items }: Props) {
  const { t } = useTranslation("translations");
  const transition = useTransition();

  const [products] = useState(items);
  const [customPlan] = useState(items.find((f) => f.contactUs));
  const [testProducts] = useState(!items || items.filter((f) => f.id === undefined || f.id === "").length > 0);

  const [billingPeriod, setBillingPeriod] = useState<SubscriptionBillingPeriod>(SubscriptionBillingPeriod.MONTHLY);
  const [currency, setCurrency] = useState("usd");

  function toggleBillingPeriod() {
    if (billingPeriod === SubscriptionBillingPeriod.MONTHLY) {
      setBillingPeriod(SubscriptionBillingPeriod.YEARLY);
    } else {
      setBillingPeriod(SubscriptionBillingPeriod.MONTHLY);
    }
  }
  function getPrice(product: SubscriptionProductDto): SubscriptionPriceDto | undefined {
    const prices = product.prices.find(
      (f) => (f.billingPeriod === billingPeriod || f.billingPeriod === SubscriptionBillingPeriod.ONCE) && f.currency === currency && f.active
    );
    return prices;
  }
  function getPriceAmount(product: SubscriptionProductDto): number {
    return getPrice(product)?.price ?? 0;
  }
  function intFormat(value: number) {
    return NumberUtils.intFormat(value);
  }
  function getYearlyDiscount(): string | undefined {
    const priceYearly = getPriceWithInterval(SubscriptionBillingPeriod.YEARLY);
    const priceMonthly = getPriceWithInterval(SubscriptionBillingPeriod.MONTHLY);
    if (priceYearly && priceMonthly) {
      const discount = 100 - (priceYearly.price * 100) / (priceMonthly.price * 12);
      if (discount !== 0) {
        return "-" + discount.toFixed(0) + "%";
      }
    }

    return undefined;
  }
  function getPriceWithInterval(billingPeriod: SubscriptionBillingPeriod): SubscriptionPriceDto | undefined {
    let price: SubscriptionPriceDto | undefined;
    if (products && products.length > 0) {
      products.forEach((product) => {
        const prices = product.prices.find((f) => f.billingPeriod === billingPeriod && f.currency === currency && f.price > 0);
        if (prices) {
          price = prices;
        }
      });
    }
    return price;
  }

  return (
    <div>
      <div className="container mx-auto antialiased">
        <main className="lg:mx-4">
          <div className="flex items-center justify-center mt-10 space-x-4">
            <span className="text-base font-medium">{t("pricing.MONTHLY")}</span>
            <button className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500" onClick={toggleBillingPeriod}>
              <div className="w-16 h-8 transition bg-theme-500 rounded-full shadow-md outline-none"></div>
              <div
                className={clsx(
                  "absolute inline-flex bg-white items-center justify-center w-6 h-6 transition-all duration-200 ease-in-out transform rounded-full shadow-sm top-1 left-1",
                  billingPeriod === 3 && "translate-x-0",
                  billingPeriod === 4 && "translate-x-8"
                )}
              ></div>
            </button>
            <span className="text-base font-medium">
              {t("pricing.YEARLY")}{" "}
              {getYearlyDiscount() && (
                <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-teal-100 text-teal-800">
                  {getYearlyDiscount()}
                </span>
              )}
            </span>
          </div>

          <div className="space-y-6">
            {testProducts && <WarningBanner redirect="/admin/pricing" title={t("shared.warning")} text={t("admin.pricing.thesePricesAreFromFiles")} />}

            <div className={clsx("mt-16 grid gap-6 lg:gap-3", products.length === 2 && "lg:grid-cols-2", products.length > 2 && "lg:grid-cols-3")}>
              {products
                .filter((f) => !f.contactUs)
                .map((plan, index) => {
                  return (
                    <div key={index}>
                      <section
                        className={clsx(
                          "relative flex flex-col w-full p-12 rounded-lg shadow-xl",
                          !plan.badge && "border border-theme-100 dark:border-theme-800",
                          plan.badge && "border-2 border-theme-400 dark:border-theme-600"
                        )}
                      >
                        {plan.badge && (
                          <div className="absolute top-0 py-1.5 px-4 bg-theme-500 rounded-full text-xs font-semibold uppercase tracking-wide text-white transform -translate-y-1/2">
                            {t(plan.badge)}
                          </div>
                        )}
                        <div className="flex-1 space-y-6">
                          {/* Price */}
                          <div className="flex-shrink-0">
                            <span className="text-4xl font-medium tracking-tight">{intFormat(getPriceAmount(plan))}</span>
                            {(() => {
                              if (billingPeriod === 3) {
                                return <span className="text-gray-500">/ {t("pricing.MONTHLYShort")}</span>;
                              } else {
                                return <span className="text-gray-500">/ {t("pricing.YEARLYShort")}</span>;
                              }
                            })()}
                          </div>

                          {/* Badge */}
                          <div className="flex-shrink-0 pb-6 space-y-2 border-b">
                            <h2 className="text-2xl font-normal">{t(plan.title)}</h2>
                            <p className="text-sm text-gray-500">{t(plan.description)}</p>
                          </div>

                          {/* Features */}
                          <ul className="flex-1 space-y-4">
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
                                              className="w-5 h-5 text-theme-500"
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
                                              className="w-5 h-5 text-gray-300"
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
                                      <span className="ml-3 text-base font-medium truncate">
                                        <span>{t(feature.key, [feature.value])}</span>
                                      </span>
                                    </div>
                                  </li>
                                );
                              })}
                          </ul>
                        </div>
                      </section>
                    </div>
                  );
                })}
            </div>

            {customPlan && (
              <div className="relative">
                <div>
                  <div className="mx-auto rounded-lg shadow-xl border border-transparent overflow-hidden lg:flex">
                    <div className="flex-1 bg-slate-800 dark:bg-theme-800 px-6 py-8 lg:p-12">
                      <h3 className="text-2xl font-extrabold text-white sm:text-3xl">{t(customPlan.title)}</h3>
                      <p className="mt-6 text-base text-white">{t(customPlan.description)}</p>
                      <div className="mt-8">
                        <div className="flex items-center">
                          <h4 className="flex-shrink-0 pr-4 text-sm tracking-wider font-semibold uppercase text-white">{t("pricing.whatsIncluded")}</h4>
                          <div className="flex-1 border-t dark:border-gray-300 border-gray-700"></div>
                        </div>
                        <ul role="list" className="mt-8 space-y-5 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-5">
                          {customPlan.features.map((feature, idxFeature) => {
                            return (
                              <li key={idxFeature} className="flex items-start lg:col-span-1">
                                <div className="flex-shrink-0">
                                  {/* Heroicon name: solid/check-circle */}
                                  <svg
                                    className="h-5 w-5 text-theme-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                                <p className="ml-3 text-sm text-gray-50">
                                  <span>{t(feature.key, [feature.value])}</span>
                                </p>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                    <div className="py-8 px-6 text-center lg:flex-shrink-0 lg:flex lg:flex-col lg:justify-center lg:p-12">
                      <div className="mt-4 flex items-center justify-center text-5xl font-extrabold text-gray-900 dark:text-white">
                        <span>{t("pricing.contactUs")}</span>
                      </div>
                      <p className="mt-4 text-sm">
                        <span className="font-medium text-gray-500">{t("pricing.customPlanDescription")}</span>
                      </p>
                      <div className="mt-6">
                        <div className="rounded-md shadow max-w-md mx-auto">
                          <Link
                            to="/contact"
                            className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900"
                          >
                            {t("pricing.contact")}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
