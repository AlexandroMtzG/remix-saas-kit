import { useTranslation } from "react-i18next";
import Loading from "../loaders/Loading";
import { SubscriptionPriceDto } from "~/application/dtos/core/subscriptions/SubscriptionPriceDto";
import { SubscriptionProductDto } from "~/application/dtos/core/subscriptions/SubscriptionProductDto";
import { SubscriptionBillingPeriod } from "~/application/enums/core/subscriptions/SubscriptionBillingPeriod";
import NumberUtils from "~/utils/shared/NumberUtils";
import { useEffect, useState } from "react";
import clsx from "~/utils/shared/ClassesUtils";
import { TenantProductDto } from "~/application/dtos/core/tenants/TenantProductDto";
import WarningBanner from "../banners/WarningBanner";

interface Props {
  className?: string;
  plansLabel?: boolean;
  showCurrent?: boolean;
}

export default function PlansRadioButtons({ className = "", plansLabel = true, showCurrent = false }: Props) {
  const { t } = useTranslation("translations");
  const [loading, setLoading] = useState(false);

  const activeProducts = useSelector((state: RootState): TenantProductDto[] => {
    return state.tenant?.subscription?.myProducts ?? [];
  });

  const activeProduct = useSelector((): TenantProductDto | null => {
    if (activeProducts.length > 0) {
      return activeProducts[0];
    }
    return null;
  });

  const products = useSelector((state: RootState) => {
    const products = (state.pricing.products as SubscriptionProductDto[])
      ?.filter((f) => f.active && !f.contactUs)
      .sort((x, y) => {
        return x.tier > y.tier ? 1 : -1;
      });
    return products;
  });

  const authenticated = useSelector((state: RootState) => {
    return state.auth.authenticated;
  });

  if (products.length === 0) {
    services.subscriptionProducts.getProducts().then(() => {
      loadCurrent();
    });
  }

  useEffect(() => {
    setLoading(true);
    services.subscriptionProducts
      .getProducts()
      .then(() => {
        loadCurrent();
        if (!authenticated) {
          selectProductIfNotSelected();
        }
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function loadCurrent() {
    if (activeProduct) {
      store.dispatch(
        setSelected({
          billingPeriod: activeProduct.subscriptionPrice.billingPeriod,
          product: activeProduct.subscriptionProduct,
        })
      );
    }
  }
  function getPrice(product: SubscriptionProductDto): SubscriptionPriceDto | undefined {
    const prices = product.prices.find(
      (f) => (f.billingPeriod === billingPeriod || f.billingPeriod === SubscriptionBillingPeriod.ONCE) && f.currency === currency && f.active
    );
    return prices;
  }
  function getPriceAmount(product): string {
    return NumberUtils.intFormat(getPrice(product)?.price ?? 0);
  }
  function changedProduct(e) {
    const product = products.find((f) => f.title === e.target.value);
    if (product) {
      store.dispatch(
        setSelected({
          product,
          billingPeriod,
        })
      );
    }
  }
  function selectMonthly(e?) {
    e?.stopPropagation();
    store.dispatch(setBillingPeriod(SubscriptionBillingPeriod.MONTHLY));
  }
  function selectYearly(e?) {
    e?.stopPropagation();
    store.dispatch(setBillingPeriod(SubscriptionBillingPeriod.YEARLY));
  }
  function toggleBillingPeriod(e?) {
    e?.stopPropagation();
    if (billingPeriod === SubscriptionBillingPeriod.MONTHLY) {
      selectYearly();
    } else {
      selectMonthly();
    }
  }
  function selectProductIfNotSelected() {
    if (products.length > 0) {
      if (!products.find((f) => f.id === selectedProduct?.id)) {
        store.dispatch(
          setSelected({
            billingPeriod: products[0].prices[0].billingPeriod,
            product: products[0],
          })
        );
      }
    }
  }
  function getBillingPeriodName(billingPeriod: SubscriptionBillingPeriod) {
    return t("pricing." + SubscriptionBillingPeriod[billingPeriod]);
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
  function isSelected(product: SubscriptionProductDto) {
    if (selectedProduct && product.title === selectedProduct.title) {
      return true;
    }
    return false;
  }
  function intFormat(value) {
    return NumberUtils.intFormat(value);
  }
  const billingPeriod = useSelector((state: RootState) => {
    return state.pricing.billingPeriod;
  });

  const currency = useSelector((state: RootState) => {
    return state.pricing.currency;
  });

  const selectedProduct = useSelector((state: RootState): SubscriptionProductDto | null => {
    return state.pricing.selectedProduct;
  });

  return (
    <div className={className}>
      {(() => {
        if (loading) {
          return <Loading />;
        } else {
          return (
            <span>
              <fieldset>
                <legend className="text-sm font-medium flex items-center justify-between w-full">
                  <div>{plansLabel && <span>{t("shared.plan")}</span>}</div>
                  <div className="flex items-center justify-center space-x-2">
                    <button type="button" onClick={selectMonthly} className="text-gray-500 text-sm font-normal focus:outline-none">
                      {getBillingPeriodName(3)}
                    </button>
                    <button
                      type="button"
                      className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
                      onClick={toggleBillingPeriod}
                    >
                      <div className="w-8 h-4 transition bg-theme-500 rounded-full shadow-md outline-none"></div>
                      <div
                        className={clsx(
                          "absolute inline-flex items-center justify-center w-2 h-2 transition-all duration-200 ease-in-out transform bg-white rounded-full shadow-sm top-1 left-1",
                          billingPeriod === SubscriptionBillingPeriod.YEARLY && "translate-x-4"
                        )}
                      ></div>
                    </button>
                    <button type="button" onClick={selectYearly} className="flex items-center space-x-1 text-gray-500 text-sm font-normal focus:outline-none">
                      <div>{getBillingPeriodName(4)}</div>
                      <div className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-teal-100 text-teal-800">{getYearlyDiscount()}</div>
                    </button>
                  </div>
                </legend>

                <div className="mt-2 relative bg-white rounded-md -space-y-px">
                  {!loading && products.length === 0 && (
                    <div>
                      <WarningBanner redirect="/admin/pricing" title={t("shared.error")} text={t("admin.pricing.noPricesInDatabase")} />
                    </div>
                  )}
                  {/*Checked: "bg-theme-50 border-theme-200 z-10", Not Checked: "border-gray-200" */}
                  {products.map((product, index) => {
                    return (
                      <label
                        key={index}
                        className={clsx(
                          "relative border p-4 flex flex-col cursor-pointer sm:pl-4 sm:pr-6 sm:grid sm:grid-cols-3 focus:outline-none",
                          index === products.length - 1 && "rounded-b-md",
                          isSelected(product) && "bg-theme-50 border-theme-200 z-10",
                          !isSelected(product) && "border-gray-200"
                        )}
                      >
                        <div className="flex items-center text-sm">
                          <input
                            type="radio"
                            name="pricing-plan"
                            value={product.title}
                            checked={isSelected(product)}
                            className="h-4 w-4 text-theme-600 border-gray-300 focus:ring-theme-500"
                            aria-labelledby="pricing-plans-0-label"
                            aria-describedby="pricing-plans-0-description-0 pricing-plans-0-description-1"
                            onChange={changedProduct}
                          />
                          {/*Checked: "text-theme-900", Not Checked: "text-gray-900" */}
                          <span
                            id="pricing-plans-0-label"
                            className={clsx("ml-3 font-medium", isSelected(product) && "text-theme-900", !isSelected(product) && "text-gray-900")}
                          >
                            {t(product.title)}
                          </span>
                          {showCurrent && activeProduct && activeProduct.subscriptionProduct.title === product.title && (
                            <span className="ml-2 font-extrabold truncate">({t("shared.current")})</span>
                          )}
                        </div>
                        <p id="pricing-plans-0-description-0" className="ml-6 pl-1 text-sm sm:ml-0 sm:pl-0 sm:text-center">
                          {/*Checked: "text-theme-900", Not Checked: "text-gray-900" */}
                          <span className="font-medium">
                            <span
                              className={clsx("font-medium tracking-tight", isSelected(product) && "text-theme-900", !isSelected(product) && "text-gray-900")}
                            >
                              {intFormat(getPriceAmount(product))}
                            </span>
                            {(() => {
                              if (billingPeriod === SubscriptionBillingPeriod.MONTHLY) {
                                return <span className="text-gray-500 font-normal">/ {t("pricing.MONTHLYShort")}</span>;
                              } else {
                                return <span className="text-gray-500">/ {t("pricing.YEARLYShort")}</span>;
                              }
                            })()}
                          </span>
                        </p>
                        {/*Checked: "text-theme-700", Not Checked: "text-gray-500" */}
                        <p
                          id="pricing-plans-0-description-1"
                          className={clsx(
                            "ml-6 pl-1 text-sm md:ml-0 md:pl-0 md:text-right",
                            isSelected(product) && "text-theme-700",
                            !isSelected(product) && "text-gray-500"
                          )}
                        >
                          <span>{t(product.features[0].key, [product.features[0].value])}</span>
                        </p>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </span>
          );
        }
      })()}
    </div>
  );
}
