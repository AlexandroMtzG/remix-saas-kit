import { useTranslation } from "react-i18next";
import { ActionFunction, Form, json, MetaFunction, useActionData } from "remix";
import { useAppData } from "~/utils/data/useAppData";
import { i18n } from "~/locale/i18n.server";
import { updateTenant } from "~/utils/db/tenants.db.server";
import { getUserInfo } from "~/utils/session.server";

export const meta: MetaFunction = () => ({
  title: "Tenant | Remix SaasFrontend",
});

type ActionData = {
  error?: string;
  success?: string;
  fields?: {
    name: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  let t = await i18n.getFixedT(request, "translations");
  const form = await request.formData();
  const name = form.get("name")?.toString() ?? "";
  if ((name?.length ?? 0) < 2) {
    return badRequest({
      fields: {
        name,
      },
      error: "Tenant name must have at least 2 characters",
    });
  }

  const userInfo = await getUserInfo(request);
  await updateTenant(userInfo?.currentTenantId, { name });

  const actionData: ActionData = {
    success: t("settings.tenant.updated"),
  };
  return json(actionData);
};

export default function TenantRoute() {
  const appData = useAppData();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation("translations");

  return (
    <div className="py-4 space-y-2 mx-auto max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="md:grid lg:grid-cols-3 md:gap-2">
        <div className="md:col-span-1">
          <div className="sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{t("settings.tenant.general")}</h3>
            <p className="mt-1 text-xs leading-5 text-gray-600">{t("settings.tenant.generalDescription")}</p>
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <Form method="post">
            <div className="shadow overflow-hidden sm:rounded-sm">
              <div className="px-4 py-5 bg-white sm:p-6">
                <div className="grid grid-cols-6 gap-2">
                  <div className="col-span-6 sm:col-span-6">
                    <label htmlFor="name" className="block text-sm font-medium leading-5 text-gray-700">
                      {t("shared.name")}
                    </label>
                    <input
                      required
                      id="name"
                      name="name"
                      defaultValue={appData.currentTenant?.name}
                      className="mt-1 form-input block w-full py-2 px-3 border border-gray-300 rounded-sm shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                    />
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <div className="flex justify-between">
                  <div id="form-success-message" className="flex space-x-2 items-center">
                    {actionData?.success ? (
                      <>
                        <p className="text-teal-500 text-sm py-2" role="alert">
                          {actionData.success}
                        </p>
                      </>
                    ) : actionData?.error ? (
                      <>
                        <p className="text-red-500 text-sm py-2" role="alert">
                          {actionData.error}
                        </p>
                      </>
                    ) : null}
                  </div>
                  <button
                    type="submit"
                    className="inline-flex space-x-2 items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
                  >
                    {t("shared.save")}
                  </button>
                </div>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
