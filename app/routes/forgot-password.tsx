import Logo from "~/components/front/Logo";
import LoadingButton, { RefLoadingButton } from "~/components/ui/buttons/LoadingButton";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { ActionFunction, Form, json, LoaderFunction, MetaFunction, useActionData } from "remix";
import crypto from "crypto";
import { getUserByEmail, updateUserVerifyToken } from "~/utils/db/users.db.server";
import { i18n } from "~/locale/i18n.server";
import { sendEmail } from "~/utils/email.server";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";

export const meta: MetaFunction = () => ({
  title: "Forgot password | Remix SaasFrontend",
});

export let loader: LoaderFunction = async ({ request }) => {
  return json({
    i18n: await i18n.getTranslations(request, ["translations"]),
  });
};

type ActionData = {
  success?: string;
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  let t = await i18n.getFixedT(request, "translations");

  const form = await request.formData();
  const email = form.get("email")?.toString();

  if (!email) {
    return badRequest({
      error: "Email required",
    });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return badRequest({
      error: t("api.errors.userNotRegistered"),
    });
  }

  var verifyToken = crypto.randomBytes(20).toString("hex");
  await updateUserVerifyToken({ verifyToken }, user.id);
  await sendEmail(email, "password-reset", {
    action_url: process.env.REMIX_SERVER_URL + `/reset?e=${email}&t=${verifyToken}`,
    name: user.firstName,
  });

  return json({
    success: "Email sent",
  });
};

export default function ForgotPasswordRoute() {
  const { t } = useTranslation("translations");
  const actionData = useActionData<ActionData>();

  const search = useLocation().search;
  const emailQueryParam = new URLSearchParams(search).get("e");

  const loadingButton = useRef<RefLoadingButton>(null);
  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);

  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState(emailQueryParam?.toString() ?? "");

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
    if (actionData?.success) {
      setEmailSent(true);
    }
  }, [actionData]);

  return (
    <div>
      <div>
        <div className="min-h-screen flex flex-col justify-center py-12 px-6 lg:px-8">
          <Logo className="mx-auto h-12 w-auto" />
          {(() => {
            if (!emailSent) {
              return (
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                  <h2 className="mt-6 text-center text-lg font-extrabold text-gray-800 dark:text-slate-200">{t("account.forgot.title")}</h2>
                  <p className="mt-5 text-sm leading-5 text-center text-gray-500">{t("account.reset.headline")}</p>
                  <div className="mt-8 sm:rounded-sm sm:px-10">
                    <Form method="post">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium leading-5 text-gray-900 dark:text-slate-300">
                          {t("account.shared.email")}
                        </label>
                        <div className="mt-1 rounded-sm shadow-sm">
                          <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:bg-gray-900 text-gray-800 dark:text-slate-200 rounded-md focus:outline-none focus:ring-theme-500 focus:border-theme-500 focus:z-10 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <span className="block w-full rounded-sm shadow-sm">
                          <LoadingButton ref={loadingButton} className="w-full block" type="submit">
                            <span className="absolute left-0 inset-y pl-3"></span>
                            {t("account.reset.button")}
                          </LoadingButton>
                        </span>
                      </div>
                    </Form>
                    <div className="mt-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm leading-5">
                          <span className="px-2 bg-white dark:bg-slate-900 text-gray-500">{t("account.forgot.rememberedPassword")}</span>
                        </div>
                      </div>

                      <div className="mt-6">
                        <div>
                          <span className="w-full inline-flex rounded-sm shadow-sm">
                            <Link
                              to="/login"
                              className="bg-white dark:bg-slate-900 w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-800 rounded-sm text-sm leading-5 font-medium text-gray-900 dark:text-slate-300 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition duration-150 ease-in-out"
                            >
                              {t("account.forgot.backToLogin")}
                            </Link>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                  <div className="max-w-md w-full mx-auto rounded-sm px-8 pt-6 pb-8 mb-4 mt-8">
                    <h2 className="text-xl font-black">
                      <h2 className="mt-6 text-center text-lg font-extrabold text-gray-800 dark:text-slate-200">{t("account.reset.resetSuccess")}</h2>
                    </h2>
                    <div className="my-4 leading-tight">
                      <p className="mt-2 text-center text-sm leading-5 text-gray-900 dark:text-slate-300 max-w">{t("account.reset.emailSent")}</p>
                    </div>
                  </div>
                </div>
              );
            }
          })()}
        </div>

        <SuccessModal ref={successModal} />
        <ErrorModal ref={errorModal} />
      </div>
    </div>
  );
}
