import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunction, MetaFunction, redirect, useActionData, useLoaderData } from "remix";
import { deleteEmployee, EmployeeWithCreatedByUser, getEmployee, updateEmployee } from "~/utils/db/app/employees.db.server";
import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import EmployeeProfile from "~/components/app/employees/EmployeeProfile";
import { i18n } from "~/locale/i18n.server";
import { useEffect, useRef } from "react";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";

export const meta: MetaFunction = () => ({
  title: "Employee | Remix SaasFrontend",
});

type LoaderData = {
  item: EmployeeWithCreatedByUser | null;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  const item = await getEmployee(params.id);
  const data: LoaderData = {
    item,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  let t = await i18n.getFixedT(request, "translations");

  if (!params.id) {
    return badRequest({ error: t("shared.notFound") });
  }
  const form = await request.formData();

  const type = form.get("type")?.toString();
  const email = form.get("email")?.toString().toLowerCase().trim();
  const firstName = form.get("first-name")?.toString();
  const lastName = form.get("last-name")?.toString();

  if (type === "edit") {
    if (!email) {
      return badRequest({ error: "Email required" });
    } else if (!firstName) {
      return badRequest({ error: "First name required" });
    } else if (!lastName) {
      return badRequest({ error: "Last name required" });
    }
    await updateEmployee(params.id, {
      email,
      firstName,
      lastName,
    });

    return redirect("/app/employees/" + params.id);
  } else if (type === "delete") {
    const existing = await getEmployee(params.id);
    if (!existing) {
      return badRequest({ error: t("shared.notFound") });
    }
    await deleteEmployee(params.id);
    return redirect("/app/employees");
  } else {
    return badRequest({ error: "Form not submitted correctly" });
  }
};

export default function EmployeeRoute() {
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation("translations");

  const errorModal = useRef<RefErrorModal>(null);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData?.error);
    }
  }, [actionData]);

  return (
    <div>
      <Breadcrumb menu={[{ title: t("models.employee.plural"), routePath: "/app/employees" }]} />
      {data.item ? <EmployeeProfile item={data.item} /> : <div>{t("shared.notFound")} </div>}
      <ErrorModal ref={errorModal} />
    </div>
  );
}
