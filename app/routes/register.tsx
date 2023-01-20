import { ActionFunction, Form, json, Link, LoaderFunction, MetaFunction, useActionData, useSearchParams } from "remix";
import { createUserSession, getUserInfo, setLoggedUser } from "~/utils/session.server";
import Logo from "~/components/front/Logo";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import { useTranslation } from "react-i18next";
import { i18n } from "~/locale/i18n.server";
import { getUserByEmail, register } from "~/utils/db/users.db.server";
import UserUtils from "~/utils/store/UserUtils";
import { createStripeCustomer } from "~/utils/stripe.server";
import { createTenant, createTenantUser } from "~/utils/db/tenants.db.server";
import { TenantUserRole } from "~/application/enums/core/tenants/TenantUserRole";
import { createWorkspace, createWorkspaceUser } from "~/utils/db/workspaces.db.server";
import { WorkspaceType } from "~/application/enums/core/tenants/WorkspaceType";
import { sendEmail } from "~/utils/email.server";

export const meta: MetaFunction = () => {
  return {
    title: "Register | Remix SaasFrontend",
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
    company: string | undefined;
    firstName: string | undefined;
    lastName: string | undefined;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  let t = await i18n.getFixedT(request, "translations");
  const userInfo = await getUserInfo(request);

  // await new Promise((r) => setTimeout(r, 5000));

  const form = await request.formData();
  const email = form.get("email")?.toString().toLowerCase().trim();
  const password = form.get("password")?.toString();
  const company = form.get("company")?.toString();
  const firstName = form.get("first-name")?.toString();
  const lastName = form.get("last-name")?.toString();
  const priceId = form.get("price-id")?.toString();
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof company !== "string" ||
    typeof firstName !== "string" ||
    typeof lastName !== "string"
  ) {
    return badRequest({
      error: t("shared.missingFields"),
    });
  }

  const fields = { company, firstName, lastName, email, password };
  const fieldErrors = {
    email: UserUtils.validateEmail(email),
    password: UserUtils.validatePassword(password),
  };
  if (Object.values(fieldErrors).some(Boolean)) return badRequest({ fieldErrors, fields });

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return badRequest({
      error: t("api.errors.userAlreadyRegistered"),
    });
  }

  const stripeCustomer = await createStripeCustomer(email, company);
  if (!stripeCustomer) {
    return badRequest({ error: "Could not create Stripe customer" });
  }
  const user = await register(email, password, firstName, lastName);
  if (!user) {
    return badRequest({ error: "Could not create user" });
  }
  const tenant = await createTenant(company, stripeCustomer.id);
  if (!tenant) {
    return badRequest({ error: "Could not create tenant" });
  }
  await createTenantUser({
    tenantId: tenant.id,
    userId: user.id,
    role: TenantUserRole.OWNER,
  });

  const defaultWorkspace = await createWorkspace({
    tenantId: tenant.id,
    name: company,
    type: WorkspaceType.PRIVATE,
    businessMainActivity: "",
    registrationNumber: "",
  });

  if (!defaultWorkspace) {
    return badRequest({ error: "Could not create default workspace" });
  }

  await sendEmail(email, "welcome", {
    action_url: process.env.REMIX_SERVER_URL + `/login`,
    name: firstName,
  });

  await createWorkspaceUser({
    workspaceId: defaultWorkspace.id,
    userId: user.id,
  });

  const userSession = await setLoggedUser(user);
  return createUserSession(
    {
      ...userSession,
      // locale: userInfo.locale,
      lightOrDarkMode: userInfo.lightOrDarkMode,
    },
    "/app/dashboard"
  );
};

export default function RegisterRoute() {
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation("translations");

  const [searchParams] = useSearchParams();

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <Logo className="mx-auto h-12 w-auto" />
            <h2 className="mt-6 text-center text-lg leading-9 font-bold text-gray-800 dark:text-slate-200">{t("account.register.title")}</h2>
            <p className="mt-2 text-center text-sm leading-5 text-gray-800 dark:text-slate-200 max-w">
              {t("account.register.alreadyRegistered")}{" "}
              <span className="font-medium text-theme-500 hover:text-theme-400 focus:outline-none focus:underline transition ease-in-out duration-150">
                <Link to="/login">{t("account.register.clickHereToLogin")}</Link>
              </span>
            </p>
          </div>
          <Form className="mt-8 space-y-6" method="post">
            <input type="hidden" name="redirectTo" value={searchParams.get("redirect") ?? undefined} />
            {/* Workspace */}
            <div>
              <label className="block text-sm font-medium">{t("account.register.organization")}</label>

              <div className="mt-1 rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="company" className="sr-only">
                    {t("models.workspace.object")}
                  </label>
                  <input
                    type="text"
                    name="company"
                    id="company"
                    placeholder={t("models.workspace.name")}
                    required
                    defaultValue={actionData?.fields?.company}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:bg-gray-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-theme-500 focus:border-theme-500 focus:z-10 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            {/* Workspace: End  */}
            {/* Personal Info */}
            <div>
              <legend className="block text-sm font-medium">{t("account.register.personalInfo")}</legend>
              <div className="mt-1 rounded-sm shadow-sm -space-y-px">
                <div className="flex">
                  <div className="w-1/2">
                    <label htmlFor="first-name" className="sr-only">
                      {t("models.user.firstName")}
                    </label>
                    <input
                      type="text"
                      name="first-name"
                      id="first-name"
                      required
                      defaultValue={actionData?.fields?.firstName}
                      className="appearance-none rounded-none rounded-tl-md relative block w-full px-3 py-2 border border-r-0 border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:bg-gray-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-theme-500 focus:border-theme-500 focus:z-10 sm:text-sm"
                      placeholder={t("account.register.firstName")}
                    />
                  </div>
                  <div className="w-1/2">
                    <label htmlFor="last-name" className="sr-only">
                      {t("models.user.lastName")}
                    </label>
                    <input
                      type="text"
                      name="last-name"
                      id="last-name"
                      defaultValue={actionData?.fields?.lastName}
                      required
                      className="appearance-none rounded-none rounded-tr-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:bg-gray-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-theme-500 focus:border-theme-500 focus:z-10 sm:text-sm"
                      placeholder={t("account.register.lastName")}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="sr-only">
                    {t("models.user.email")}
                  </label>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    autoComplete="email"
                    required
                    placeholder={t("account.shared.email")}
                    defaultValue={actionData?.fields?.email}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:bg-gray-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-theme-500 focus:border-theme-500 focus:z-10 sm:text-sm"
                  />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  placeholder={t("account.register.password")}
                  className="appearance-none rounded-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:bg-gray-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-theme-500 focus:border-theme-500 focus:z-10 sm:text-sm"
                />
              </div>
              <div id="form-error-message">
                {actionData?.error ? (
                  <p className="text-rose-500 text-xs py-2" role="alert">
                    {actionData.error}
                  </p>
                ) : null}
              </div>
            </div>
            {/* Personal Info: End */}

            <div>
              <LoadingButton className="w-full block" type="submit">
                {t("account.register.prompts.register.title")}
              </LoadingButton>
            </div>
            <p className="mt-3 py-2 text-gray-500 text-sm border-t border-gray-200 dark:border-gray-700">
              {t("account.register.bySigningUp")}{" "}
              <a target="_blank" href="/terms-and-conditions" className="text-theme-500 underline">
                {t("account.register.termsAndConditions")}
              </a>{" "}
              {t("account.register.andOur")}{" "}
              <a target="_blank" href="/privacy-policy" className="text-theme-500 underline">
                {t("account.register.privacyPolicy")}
              </a>
              .
            </p>
          </Form>
        </div>
      </div>
    </div>
  );
}
