import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { TenantDto } from "~/application/dtos/core/tenants/TenantDto";
import { TenantProductDto } from "~/application/dtos/core/tenants/TenantProductDto";

import { SubscriptionPriceDto } from "~/application/dtos/core/subscriptions/SubscriptionPriceDto";
import { SubscriptionBillingPeriod } from "~/application/enums/core/subscriptions/SubscriptionBillingPeriod";
import DateUtils from "~/utils/shared/DateUtils";
import Loading from "~/components/ui/loaders/Loading";

interface Props {
  id?: string;
}

export default function TenantSubscription({ id = "" }: Props) {
  const { t } = useTranslation("translations");

  const [loading, setLoading] = useState(false);
  // const [openOptions, setOpenOptions] = useState(false);

  const [item, setItem] = useState<TenantDto>({} as TenantDto);
  const [products, setProducts] = useState<TenantProductDto[]>([]);

  const headers = [
    {
      title: t("app.tenants.subscription.plan"),
    },
    {
      title: t("app.tenants.subscription.price"),
    },
    {
      title: t("app.tenants.subscription.starts"),
    },
    {
      title: t("app.tenants.subscription.ends"),
    },
    {
      title: t("app.tenants.subscription.isTrial"),
    },
    {
      title: t("app.tenants.subscription.status"),
    },
    {
      title: t("app.tenants.subscription.workspaces"),
    },
    {
      title: t("app.tenants.subscription.members"),
    },
    {
      title: t("app.tenants.subscription.links"),
    },
    {
      title: t("models.contract.plural"),
    },
    {
      title: t("app.tenants.subscription.storage"),
    },
  ];

  useEffect(() => {
    reload();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function reload() {
    // closeOptions();
    const promises: any[] = [
      services.tenants.get(id).then((response) => {
        setItem(response);
      }),
      services.tenants.adminGetProducts(id).then((response) => {
        setProducts(response);
      }),
    ];

    setLoading(true);
    Promise.all(promises).finally(() => {
      setLoading(false);
    });
  }
  // function closeOptions() {
  //   setOpenOptions(false);
  // }
  function priceBillingPeriod(price: SubscriptionPriceDto): string {
    if (price.billingPeriod === SubscriptionBillingPeriod.ONCE) {
      return t("pricing.once").toString();
    } else {
      return "/" + t("pricing." + SubscriptionBillingPeriod[price.billingPeriod] + "Short");
    }
  }
  function dateAgo(value: Date) {
    return DateUtils.dateAgo(value);
  }
  function dateYMD(value: Date | undefined) {
    return DateUtils.dateYMD(value);
  }

  return (
    <div>
      <div className="pt-2 space-y-2 mx-auto px-4 sm:px-6 lg:px-8">
        {(() => {
          if (loading) {
            return <Loading />;
          } else if (item && item.id) {
            return (
              <div>
                <div className="flex flex-col">
                  <div className="overflow-x-auto">
                    <div className="py-2 align-middle inline-block min-w-full">
                      <div className="shadow overflow-hidden border border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {headers.map((header, idx) => {
                                return (
                                  <th
                                    key={idx}
                                    scope="col"
                                    className="text-xs px-3 py-2 text-left font-medium text-gray-500 tracking-wider select-none truncate"
                                  >
                                    <div className="flex items-center space-x-1 text-gray-500">
                                      <div>{header.title}</div>
                                    </div>
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((item, idx) => {
                              return (
                                <tr key={idx}>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                    {item.subscriptionPrice && item.subscriptionPrice.subscriptionProduct && (
                                      <span>{t(item.subscriptionPrice.subscriptionProduct.title)}</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                    {item.subscriptionPrice && (
                                      <span>
                                        {item.subscriptionPrice.price}
                                        {priceBillingPeriod(item.subscriptionPrice)}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{dateYMD(item.startDate)}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{dateYMD(item.endDate)}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                    {item.trialEnds && (
                                      <span>
                                        {t("settings.subscription.trial.ends")} {dateAgo(item.trialEnds)}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                    {item.active ? <span>{t("shared.active")}</span> : <span>{t("shared.inactive")}</span>}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{item.maxWorkspaces}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{item.maxUsers}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{item.maxLinks}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{item.monthlyContracts}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{item.maxStorage / 1024}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          } else {
            return <div></div>;
          }
        })()}
      </div>
    </div>
  );
}
