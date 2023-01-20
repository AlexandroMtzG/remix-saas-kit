import { UserVerifyRequest } from "~/application/contracts/core/users/UserVerifyRequest";
import Logo from "~/components/front/Logo";
import LoadingButton, { RefLoadingButton } from "~/components/ui/buttons/LoadingButton";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import classNames from "~/utils/shared/ClassesUtils";
import UserUtils from "~/utils/store/UserUtils";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LoaderFunction, json, ActionFunction, Form, useActionData, MetaFunction } from "remix";
import { i18n } from "~/locale/i18n.server";
import { getUserByEmail, updateUserPassword } from "~/utils/db/users.db.server";
import bcrypt from "bcryptjs";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";

export const meta: MetaFunction = () => ({
  title: "Reset | Remix SaasFrontend",
});

export let loader: LoaderFunction = async ({ request }) => {
  return json({
    i18n: await i18n.getTranslations(request, ["translations"]),
  });
};

type ActionData = {
  success?: string;
  error?: string;
  fields: {
    email: string;
    verifyToken: string;
  };
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
const success = (data: ActionData) => json(data, { status: 200 });
export const action: ActionFunction = async ({ request }) => {
  let t = await i18n.getFixedT(request, "translations");

  const form = await request.formData();
  const email = form.get("email")?.toString() ?? "";
  const verifyToken = form.get("verify-token")?.toString() ?? "";
  const password = form.get("password")?.toString() ?? "";
  const passwordConfirm = form.get("password-confirm")?.toString() ?? "";

  const fields = {
    email,
    verifyToken,
  };
  if (!email) {
    return badRequest({
      error: "Email required",
      fields,
    });
  }
  const passwordError = UserUtils.validatePassword(password) || UserUtils.validatePasswords(password, passwordConfirm);
  if (passwordError) {
    return badRequest({
      error: passwordError,
      fields,
    });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return badRequest({
      error: t("api.errors.userNotRegistered"),
      fields,
    });
  }

  if (!user.verifyToken || !verifyToken || user.verifyToken !== verifyToken) {
    return badRequest({
      error: "Invalid token, reset your password first",
      fields,
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await updateUserPassword({ passwordHash }, user.id);

  return success({
    success: "Password reset successful",
    fields,
  });
};

export default function ResetRoute() {
  const { t } = useTranslation("translations");
  const navigate = useNavigate();
  const actionData = useActionData<ActionData>();

  const search = useLocation().search;
  const [email] = useState(actionData?.fields.email ?? new URLSearchParams(search).get("e") ?? "");
  const [verifyToken] = useState(actionData?.fields.email ?? new URLSearchParams(search).get("t") ?? "");

  const loadingButton = useRef<RefLoadingButton>(null);
  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
      navigate(`/reset?e=${actionData.fields.email}&t=${actionData.fields.verifyToken}`);
    }
    if (actionData?.success) {
      successModal.current?.show(actionData.success);
    }
  }, [actionData]);

  return (
    <div>
      <div>
        <div className="min-h-screen flex flex-col justify-center py-12 px-6 lg:px-8">
          <Logo className="mx-auto h-12 w-auto" />
          <div>
            <h2 className="mt-6 text-center text-md leading-9 font-bold text-gray-900 dark:text-slate-300">{t("account.newPassword.title")}</h2>
            <p className="mt-2 text-center text-sm leading-5 text-gray-900 dark:text-slate-300 max-w">
              {t("account.forgot.rememberedPassword")}{" "}
              <span className="font-medium text-theme-500 hover:text-theme-400 focus:outline-none focus:underline transition ease-in-out duration-150">
                <Link to="/login">{t("account.register.clickHereToLogin")}</Link>
              </span>
            </p>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
              <div className="max-w-md w-full mx-auto rounded-sm px-8 pt-6 pb-8 mb-4 mt-8">
                <Form method="post">
                  <div>
                    <input
                      id="verify-token"
                      name="verify-token"
                      type="hidden"
                      required
                      defaultValue={verifyToken}
                      className={classNames(
                        "bg-gray-100 cursor-not-allowed appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:bg-gray-900 text-gray-800 dark:text-slate-200 rounded-md focus:outline-none focus:ring-theme-500 focus:border-theme-500 focus:z-10 sm:text-sm",
                        "bg-gray-100 dark:bg-slate-800 cursor-not-allowed"
                      )}
                    />
                    <label htmlFor="email" className="block text-sm font-medium leading-5 text-gray-900 dark:text-slate-300">
                      {t("account.shared.email")}
                    </label>
                    <div className="mt-1 rounded-sm shadow-sm">
                      <input
                        readOnly
                        id="email"
                        name="email"
                        type="email"
                        required
                        defaultValue={email}
                        className={classNames(
                          "bg-gray-100 cursor-not-allowed appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:bg-gray-900 text-gray-800 dark:text-slate-200 rounded-md focus:outline-none focus:ring-theme-500 focus:border-theme-500 focus:z-10 sm:text-sm",
                          "bg-gray-100 dark:bg-slate-800 cursor-not-allowed"
                        )}
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label htmlFor="password" className="block text-sm font-medium leading-5 text-gray-900 dark:text-slate-300">
                      {t("account.shared.password")}
                    </label>
                    <div className="mt-1 rounded-sm shadow-sm">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:bg-gray-900 text-gray-800 dark:text-slate-200 rounded-md focus:outline-none focus:ring-theme-500 focus:border-theme-500 focus:z-10 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium leading-5 text-gray-900 dark:text-slate-300">
                      {t("account.register.confirmPassword")}
                    </label>
                    <div className="mt-1 rounded-sm shadow-sm">
                      <input
                        id="password-confirm"
                        name="password-confirm"
                        type="password"
                        required
                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:bg-gray-900 text-gray-800 dark:text-slate-200 rounded-md focus:outline-none focus:ring-theme-500 focus:border-theme-500 focus:z-10 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <span className="block w-full rounded-sm shadow-sm">
                      <LoadingButton
                        ref={loadingButton}
                        type="submit"
                        className="relative block w-full py-2 px-3 border border-transparent rounded-sm text-white font-semibold bg-gray-800 hover:bg-gray-700 focus:bg-gray-900 focus:outline-shadow sm:text-sm sm:leading-5"
                      >
                        {t("account.newPassword.button")}
                      </LoadingButton>
                    </span>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
        <SuccessModal ref={successModal} onClosed={() => navigate("/login")} />
        <ErrorModal ref={errorModal} />
      </div>
    </div>
  );
}
