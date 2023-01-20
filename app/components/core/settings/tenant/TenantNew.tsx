import { useTranslation } from "react-i18next";
import Modal, { RefModal } from "~/components/ui/modals/Modal";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { useEffect, useRef, useState } from "react";
import { SubscriptionProductDto } from "~/application/dtos/core/subscriptions/SubscriptionProductDto";
import { SubscriptionBillingPeriod } from "~/application/enums/core/subscriptions/SubscriptionBillingPeriod";
import { TenantCreateRequest } from "~/application/contracts/core/tenants/TenantCreateRequest";
import { SubscriptionPriceDto } from "~/application/dtos/core/subscriptions/SubscriptionPriceDto";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import LoadingButton, { RefLoadingButton } from "~/components/ui/buttons/LoadingButton";
import UserUtils from "~/utils/store/UserUtils";
import { useNavigate } from "react-router-dom";
import { useActionData, useSubmit } from "remix";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";

interface Props {
  onClosed: () => void;
}

export default function TenantNew({ onClosed }: Props) {
  const actionData = useActionData();
  const { t } = useTranslation("translations");
  const submit = useSubmit();

  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);

  const [name, setName] = useState("");

  useEffect(() => {
    console.log({ actionData });
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    } else if (actionData?.success) {
      successModal.current?.show(actionData.success);
    }
  }, [actionData]);

  function createTenant() {
    const form = new FormData();
    form.set("type", "create-tenant");
    form.set("name", name);
    submit(form, { method: "post", action: "/app" });
  }

  function createdTenant() {
    onClosed();
    if (actionData?.tenantId) {
      const form = new FormData();
      form.set("type", "set-tenant");
      form.set("tenantId", actionData.tenantId);
      form.set("redirectTo", location.pathname + location.search);
      submit(form, {
        method: "post",
        action: "/app",
      });
    }
  }

  return (
    <div>
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <section className="absolute inset-y-0 pl-16 max-w-full right-0 flex">
            <div className="w-screen max-w-md">
              <div className="h-full divide-y divide-gray-200 flex flex-col bg-white shadow-2xl">
                <div className="flex-1 h-0 overflow-y-auto bg-white text-gray-600">
                  <header className="space-y-1 py-6 px-4 bg-gray-100 sm:px-6 shadow-inner border-b border-gray-200">
                    <div className="flex items-center justify-between space-x-3">
                      <h2 className="text-lg leading-7 font-medium text-gray-800">{t("settings.tenant.create")}</h2>
                      <div className="h-7 flex items-center">
                        <button onClick={onClosed} aria-label="Close panel" className="text-gray-500 hover:text-gray-800 transition ease-in-out duration-150">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm leading-5 text-gray-500">{t("settings.tenant.createDescription")}</p>
                    </div>
                  </header>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="px-4 divide-y divide-gray-200 sm:px-6">
                      <div className="space-y-3 pt-6 pb-5">
                        <div>
                          <label className="block text-sm font-medium">{t("account.register.organization")}</label>

                          <div className="mt-1 rounded-md shadow-sm -space-y-px">
                            <div>
                              <label htmlFor="tax-id" className="sr-only">
                                {t("models.workspace.name")}
                              </label>
                              <input
                                type="text"
                                name="name"
                                id="name"
                                placeholder={t("models.workspace.name")}
                                required
                                value={name}
                                onChange={(e) => {
                                  setName(e.target.value);
                                }}
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 rounded-t-md focus:outline-none focus:ring-theme-500 focus:border-theme-500 focus:z-10 sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 pb-6 text-right text-gray-700">
                        <div className="text-sm leading-5 right-0">
                          <span className="inline-flex rounded-sm shadow-sm">
                            <ButtonSecondary onClick={onClosed}>{t("shared.cancel")}</ButtonSecondary>
                          </span>
                          <span className="inline-flex rounded-sm shadow-sm ml-2">
                            <LoadingButton onClick={createTenant}>{t("shared.create")}</LoadingButton>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <SuccessModal ref={successModal} onClosed={createdTenant} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}
