import { useTranslation } from "react-i18next";
import PlansRadioButtons from "~/components/ui/radios/PlansRadioButtons";
import { SubscriptionBillingPeriod } from "~/application/enums/core/subscriptions/SubscriptionBillingPeriod";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import LoadingButton, { RefLoadingButton } from "~/components/ui/buttons/LoadingButton";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import tinyEventBus from "~/plugins/tinyEventBus";
import { useRef, useState } from "react";
import { TenantProductDto } from "~/application/dtos/core/tenants/TenantProductDto";
import { SubscriptionPriceDto } from "~/application/dtos/core/subscriptions/SubscriptionPriceDto";
import clsx from "~/utils/shared/ClassesUtils";
import { SubscriptionCardDto } from "~/application/dtos/core/subscriptions/SubscriptionCardDto";

export default function MySubscriptionPlan() {
  const { t } = useTranslation("translations");

  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);
  const confirmModal = useRef<RefConfirmModal>(null);
  const loadingButton = useRef<RefLoadingButton>(null);

  const [editing, setEditing] = useState(false);

  function updateSubscription() {
    if (!selectedPrice || !selectedProduct) {
      errorModal.current?.show(t("shared.error"), t("settings.subscription.errors.selectPlan"));
      return;
    }
    if (selectedPrice.trialDays === 0 && selectedPrice.price > 0 && !subscriptionCard) {
      errorModal.current?.show(t("settings.tenant.payment.notSet"));
      return;
    }
    if (selectingCurrentTenantProduct(activeTenantProducts)) {
      errorModal.current?.show(t("settings.subscription.alreadySubscribed"));
      return;
    }

    confirmModal.current?.show(
      t("shared.updateSubscriptionTo", [t(selectedProduct.title)]).toString(),
      t("shared.confirm").toString(),
      t("shared.back").toString(),
      priceDescription(selectedPrice)
    );
  }
  function yesUpdate() {
    if (!selectedPrice) {
      return;
    }
    loadingButton.current?.start();
    services.subscriptionManager
      .updateSubscription({
        subscriptionPriceId: selectedPrice.id,
      })
      .then(() => {
        services.subscriptionManager.getCurrentSubscription();
        services.tenants.getFeatures();
        successModal.current?.show(t("shared.updated"), t("settings.subscription.updated"));
        tinyEventBus().emitter.emit("updated-plan");
        setEditing(false);
      })
      .catch((error) => {
        errorModal.current?.show(t("shared.error"), t(error));
      })
      .finally(() => {
        if (loadingButton.current) {
          loadingButton.current?.stop();
        }
      });
  }
  function openDropdown() {
    setEditing(!editing);
  }

  const subscriptionCard = useSelector((state: RootState): SubscriptionCardDto | undefined => {
    if (state.tenant.subscription && state.tenant.subscription.paymentMethods?.length > 0) {
      return state.tenant.subscription.paymentMethods[0].card;
    }
  });
  const selectedProduct = useSelector((state: RootState) => {
    return state.pricing.selectedProduct;
  });
  const selectedPrice = useSelector((state: RootState) => {
    return selectedProduct?.prices.find((f) => f.billingPeriod === state.pricing.billingPeriod);
  });
  const activeTenantProducts = useSelector((state: RootState): TenantProductDto[] => {
    return state.tenant?.subscription?.myProducts ?? [];
  });
  const selectingCurrentTenantProduct = (activeTenantProducts) => {
    if (selectedPrice && activeTenantProducts.length > 0) {
      return selectedPrice.id === activeTenantProducts[0].id;
    }
    return false;
  };
  const priceDescription = (selectedPrice: SubscriptionPriceDto): string => {
    if (!selectedPrice) {
      return "";
    }
    const price = selectedPrice.price;
    const currency = selectedPrice.currency;
    const period = "/" + t("pricing." + SubscriptionBillingPeriod[selectedPrice.billingPeriod] + "Short");
    // const feature = selectedProduct.value?.features[0].value;
    return `${price} ${currency}${period}.`;
  };

  return (
    <div>
      <form method="POST">
        <div className="shadow sm:rounded-sm">
          <div className="px-4 py-5 bg-white sm:p-6 space-y-2">
            <div className="flex items-center space-x-2 justify-between">
              <h3 className="leading-5 font-medium text-gray-900">{t("shared.upgrade")}</h3>
            </div>
            <div className="grid grid-cols-6 gap-2">
              <PlansRadioButtons plansLabel={false} showCurrent={true} className="-mt-6 col-span-6" />
            </div>
          </div>
          <div className="px-4 py-3 sm:px-6 flex items-center space-x-2 justify-end">
            <ButtonSecondary onClick={openDropdown}>
              <span>{!editing ? t("shared.change") : t("shared.cancel")}</span>
            </ButtonSecondary>
            {editing && (
              <LoadingButton
                onClick={updateSubscription}
                disabled={selectingCurrentTenantProduct(activeTenantProducts)}
                className={clsx(selectingCurrentTenantProduct(activeTenantProducts) && " opacity-50 cursor-not-allowed")}
                ref={loadingButton}
              >
                {t("shared.upgrade")}
              </LoadingButton>
            )}
          </div>
        </div>
      </form>

      <SuccessModal ref={successModal} />
      <ErrorModal ref={errorModal} />
      <ConfirmModal ref={confirmModal} onYes={yesUpdate} />
    </div>
  );
}
