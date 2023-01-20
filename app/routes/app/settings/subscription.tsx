import { useTranslation } from "react-i18next";
import { SubscriptionBillingPeriod } from "~/application/enums/core/subscriptions/SubscriptionBillingPeriod";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import { useRef, useEffect, useState } from "react";
import { ActionFunction, json, LoaderFunction, MetaFunction, redirect, useActionData, useLoaderData, useSubmit } from "remix";
import { getAllSubscriptionProducts, getSubscriptionPrice, getSubscriptionPriceByStripeId } from "~/utils/db/subscriptionProducts.db.server";
import { cancelStripeSubscription, createStripeCustomer, createStripeSession, getStripeSession, getStripeSubscription } from "~/utils/stripe.server";
import { getTenant, updateTenantSubscriptionCustomerId, updateTenantSubscriptionId } from "~/utils/db/tenants.db.server";
import { getUserInfo } from "~/utils/session.server";
import { requireOwnerOrAdminRole } from "~/utils/loaders.middleware";
import { getUser } from "~/utils/db/users.db.server";
import { SubscriptionPrice, SubscriptionProduct } from "@prisma/client";
import ChangeSubscription from "~/components/core/settings/subscription/ChangeSubscription";
import clsx from "~/utils/shared/ClassesUtils";
import { useAppData } from "~/utils/data/useAppData";
import MySubscriptionProducts from "~/components/core/settings/subscription/MySubscriptionProducts";
import { DashboardLoaderData, loadDashboardData } from "~/utils/data/useDashboardData";

export const meta: MetaFunction = () => ({
  title: "Subscription | Remix SaasFrontend",
});

type LoaderData = DashboardLoaderData & {
  items: Awaited<ReturnType<typeof getAllSubscriptionProducts>>;
  mySubscription: (SubscriptionPrice & { subscriptionProduct: SubscriptionProduct }) | null;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  await requireOwnerOrAdminRole(request);
  const userInfo = await getUserInfo(request);
  const user = await getUser(userInfo.userId);
  const tenant = await getTenant(userInfo.currentTenantId);
  if (!tenant) {
    return badRequest({ error: "Invalid tenant" });
  }
  if (!user) {
    return badRequest({ error: "Invalid user" });
  }

  if (!tenant.subscriptionCustomerId) {
    const customer = await createStripeCustomer(user.email, tenant.name);
    if (!customer) {
      return badRequest({ error: "Could not create stripe customer" });
    }
    await updateTenantSubscriptionCustomerId(tenant.id, {
      subscriptionCustomerId: customer.id,
    });
  }

  const url = new URL(request.url);
  const session_id = url.searchParams.get("session_id");
  if (session_id) {
    try {
      const session = await getStripeSession(session_id);
      if (session.subscription) {
        tenant.subscriptionId = session.subscription.toString();

        await updateTenantSubscriptionId(tenant.id, {
          subscriptionId: tenant.subscriptionId,
        });
        return redirect("/app/settings/subscription");
      }
    } catch (e) {}
  }

  const stripeSubscription = await getStripeSubscription(tenant.subscriptionId ?? "");
  let mySubscription: (SubscriptionPrice & { subscriptionProduct: SubscriptionProduct }) | null = null;
  if (stripeSubscription && stripeSubscription?.items.data.length > 0) {
    mySubscription = await getSubscriptionPriceByStripeId(stripeSubscription?.items.data[0].plan.id);
  } else if (tenant.subscriptionId) {
    await updateTenantSubscriptionId(tenant.id, {
      subscriptionId: "",
    });
  }

  const dashboardData = await loadDashboardData(request);

  const items = await getAllSubscriptionProducts();
  const data: LoaderData = {
    items,
    mySubscription,
    ...dashboardData,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  const userInfo = await getUserInfo(request);
  const tenant = await getTenant(userInfo.currentTenantId);
  const form = await request.formData();

  const type = form.get("type")?.toString();
  const priceId = form.get("price-id")?.toString();
  const price = await getSubscriptionPrice(priceId ?? "");

  if (!tenant || !tenant.subscriptionCustomerId) {
    return badRequest({
      error: "Invalid stripe customer",
    });
  }
  if (type === "subscribe") {
    if (!priceId || !price) {
      return badRequest({
        error: "Invalid price: " + priceId,
      });
    }
    const session = await createStripeSession(tenant.subscriptionCustomerId, price.stripeId);
    if (!session || !session.url) {
      return badRequest({
        error: "Could not update subscription",
      });
    }
    return redirect(session.url);
  } else if (type === "cancel") {
    if (!tenant.subscriptionId) {
      return badRequest({
        error: "Not subscribed",
      });
    }
    await cancelStripeSubscription(tenant.subscriptionId);
    await updateTenantSubscriptionId(tenant.id, { subscriptionId: "" });
    const actionData: ActionData = {
      success: "Successfully cancelled",
    };
    return json(actionData);
  }
};

export default function SubscriptionRoute() {
  const appData = useAppData();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation("translations");
  const submit = useSubmit();

  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);
  const confirmModal = useRef<RefConfirmModal>(null);

  const [billingPeriod, setBillingPeriod] = useState<SubscriptionBillingPeriod>(appData.mySubscription?.billingPeriod ?? SubscriptionBillingPeriod.MONTHLY);
  const [currency, setCurrency] = useState("usd");

  useEffect(() => {
    if (actionData?.success) {
      successModal.current?.show(actionData?.success);
    }
    if (actionData?.error) {
      errorModal.current?.show(actionData?.error);
    }
  }, [actionData]);

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

  function updateSubscription(price: SubscriptionPrice) {
    const form = new FormData();
    form.set("price-id", price.id);
    submit(form, {
      method: "post",
    });
  }

  function toggleBillingPeriod() {
    if (billingPeriod === SubscriptionBillingPeriod.MONTHLY) {
      setBillingPeriod(SubscriptionBillingPeriod.YEARLY);
    } else {
      setBillingPeriod(SubscriptionBillingPeriod.MONTHLY);
    }
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
  function getPriceWithInterval(billingPeriod: SubscriptionBillingPeriod): SubscriptionPrice | undefined {
    let price: SubscriptionPrice | undefined;
    if (data.items && data.items.length > 0) {
      data.items.forEach((product) => {
        const prices = product.prices.find((f) => f.billingPeriod === billingPeriod && f.currency === currency && f.price > 0);
        if (prices) {
          price = prices;
        }
      });
    }
    return price;
  }

  return (
    <div className="py-4 space-y-6 mx-auto max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
      <div className="grid lg:grid-cols-2 gap-6 md:gap-2 mb-4">
        <div className="md:col-span-1">
          <div className="sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{t("settings.subscription.title")}</h3>

            <div className="mt-1 text-sm leading-5 text-gray-600">
              {(() => {
                if (data.mySubscription) {
                  return (
                    <span>
                      <p className="text-xs text-gray-900 font-bold"></p>
                      <p>
                        <button onClick={cancel} className="text-gray-500 font-medium hover:underline hover:text-gray-600">
                          {t("settings.subscription.clickCancel")}
                        </button>
                      </p>
                    </span>
                  );
                } else {
                  return <span>{t("settings.subscription.description")}</span>;
                }
              })()}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-end space-x-4">
          <span className="text-base font-medium">{t("pricing.MONTHLY")}</span>
          <button className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500" onClick={toggleBillingPeriod}>
            <div className="w-12 h-6 transition bg-teal-500 rounded-full shadow-md outline-none"></div>
            <div
              className={clsx(
                "absolute inline-flex bg-white items-center justify-center w-4 h-4 transition-all duration-200 ease-in-out transform rounded-full shadow-sm top-1 left-1",
                billingPeriod === 3 && "translate-x-0",
                billingPeriod === 4 && "translate-x-6"
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
      </div>

      <ChangeSubscription items={data.items} current={data.mySubscription} billingPeriod={billingPeriod} currency={currency} />

      <div className="grid lg:grid-cols-2 gap-6 md:gap-2 mb-4">
        <div className="md:col-span-1">
          <div className="sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{t("app.subscription.limits.title")}</h3>

            <div className="mt-1 text-sm leading-5 text-gray-600">{t("app.subscription.limits.description")}</div>
          </div>
        </div>
      </div>

      <MySubscriptionProducts withCurrentPlan={false} />

      <ConfirmModal ref={confirmModal} onYes={confirmCancel} />
      <SuccessModal ref={successModal} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}
