import { ActionFunction, Form, json, Link, LoaderFunction, MetaFunction, useActionData, useSearchParams, useTransition } from "remix";
import { createUserSession, getUserInfo, setLoggedUser } from "~/utils/session.server";
import bcrypt from "bcryptjs";
import Logo from "~/components/front/Logo";
import LoadingButton, { RefLoadingButton } from "~/components/ui/buttons/LoadingButton";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import { i18n } from "~/locale/i18n.server";
import { deleteUser, getUserByEmail } from "~/utils/db/users.db.server";
import UserUtils from "~/utils/store/UserUtils";
import { getMyTenants } from "~/utils/db/tenants.db.server";

export const meta: MetaFunction = () => {
  return {
    title: "Login | Remix SaasFrontend",
  };
};

export let loader: LoaderFunction = async ({ request }) => {
  return json({
    i18n: await i18n.getTranslations(request, ["translations"]),
  });
};

type ActionData = {
  error?: string;
  fieldErrors?: {
    email: string | undefined;
    password: string | undefined;
  };
  fields?: {
    email: string;
    password: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  let t = await i18n.getFixedT(request, "translations");
  const userInfo = await getUserInfo(request);

  // await new Promise((r) => setTimeout(r, 5000));

  const form = await request.formData();
  const email = form.get("email")?.toString().toLowerCase().trim();
  const password = form.get("password");
  const redirectTo = form.get("redirectTo") || "/app/dashboard";
  if (typeof email !== "string" || typeof password !== "string" || typeof redirectTo !== "string") {
    return badRequest({
      error: `Form not submitted correctly.`,
    });
  }

  const fields = { email, password };
  const fieldErrors = {
    email: UserUtils.validateEmail(email),
    password: UserUtils.validatePassword(password),
  };
  if (Object.values(fieldErrors).some(Boolean)) return badRequest({ fieldErrors, fields });

  const user = await getUserByEmail(email);
  if (!user) {
    return badRequest({
      fields,
      error: t("api.errors.userNotRegistered"),
    });
  }

  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
  console.log({ isCorrectPassword });
  if (!isCorrectPassword) {
    return badRequest({
      fields,
      error: t("api.errors.invalidPassword"),
    });
  }

  const userTenants = await getMyTenants(user.id);
  if (userTenants.length === 0) {
    await deleteUser(user.id);
    return badRequest({
      error: "You didn't have any tenants, account deleted. Please register again.",
    });
  }

  const userSession = await setLoggedUser(user);
  return createUserSession(
    {
      ...userSession,
      // locale: userInfo.locale,
      lightOrDarkMode: userInfo.lightOrDarkMode,
    },
    redirectTo
  );
};

export default function LoginRoute() {
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation("translations");

  const [searchParams] = useSearchParams();

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <Logo className="mx-auto h-12 w-auto" />
            <h2 className="mt-6 text-center text-lg font-extrabold text-gray-800 dark:text-slate-200">{t("account.login.title")}</h2>
            <p className="mt-2 text-center text-sm text-gray-500">
              <span>{t("shared.or")} </span>
              <Link to="/register" className="font-medium text-theme-500 hover:text-theme-400">
                {t("account.login.orStartTrial", [90])}
              </Link>
            </p>
          </div>
          <Form className="mt-8 space-y-6" method="post">
            <input type="hidden" name="redirectTo" value={searchParams.get("redirect") ?? undefined} />
            <div className="rounded-sm shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  {t("account.shared.email")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:bg-gray-900 text-gray-800 dark:text-slate-200 rounded-t-md focus:outline-none focus:ring-theme-500 focus:border-theme-500 focus:z-10 sm:text-sm"
                  placeholder={t("account.shared.email")}
                  defaultValue={actionData?.fields?.email}
                  aria-invalid={Boolean(actionData?.fieldErrors?.email)}
                  aria-errormessage={actionData?.fieldErrors?.email ? "email-error" : undefined}
                />
                {actionData?.fieldErrors?.email ? (
                  <p className="text-rose-500 text-xs py-2" role="alert" id="email-error">
                    {actionData.fieldErrors.email}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  {t("account.shared.password")}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:bg-gray-900 text-gray-800 dark:text-slate-200 rounded-b-md focus:outline-none focus:ring-theme-500 focus:border-theme-500 focus:z-10 sm:text-sm"
                  placeholder={t("account.shared.password")}
                  defaultValue={actionData?.fields?.password}
                  aria-invalid={Boolean(actionData?.fieldErrors?.password) || undefined}
                  aria-errormessage={actionData?.fieldErrors?.password ? "password-error" : undefined}
                />
                {actionData?.fieldErrors?.password ? (
                  <p className="text-rose-500 text-xs py-2" role="alert" id="password-error">
                    {actionData.fieldErrors.password}
                  </p>
                ) : null}
              </div>

              <div id="form-error-message">
                {actionData?.error ? (
                  <p className="text-rose-500 text-xs py-2" role="alert">
                    {actionData.error}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <LoadingButton className="w-full block" type="submit">
                <span className="absolute left-0 inset-y pl-3">
                  <svg className="h-5 w-5 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                {t("account.login.button")}
              </LoadingButton>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-theme-500 hover:text-theme-400">
                  {t("account.login.forgot")}
                </Link>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
