import { useTranslation } from "react-i18next";
import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import AddEmployees from "~/components/app/employees/AddEmployees";
import { ActionFunction, json, MetaFunction, redirect, useActionData } from "remix";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { useEffect, useRef } from "react";
import { createEmployee, getEmployeeByEmail } from "~/utils/db/app/employees.db.server";
import { getUserInfo } from "~/utils/session.server";

export const meta: MetaFunction = () => ({
  title: "New employees | Remix SaasFrontend",
});

type ActionData = {
  error?: string;
  success?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  const userInfo = await getUserInfo(request);

  const form = await request.formData();
  const employeesArr = form.getAll("employees[]");
  const employees = employeesArr.map((f: FormDataEntryValue) => {
    return JSON.parse(f.toString());
  });
  if (employees.length === 0) {
    return badRequest({
      error: "Add at least one employee",
    });
  }
  employees.forEach(async (employee) => {
    if (!employee.email) {
      return badRequest({ error: `Email required` });
    } else if (!employee.firstName) {
      return badRequest({ error: `First name required` });
    } else if (!employee.lastName) {
      return badRequest({ error: `Last name required` });
    }
    const existing = await getEmployeeByEmail(userInfo.currentWorkspaceId, employee.email);
    if (existing) {
      return badRequest({
        error: `Employee with email ${existing.email} already added`,
      });
    }
  });

  try {
    employees.forEach(async (employee) => {
      const newEmployee = {
        createdByUserId: userInfo.userId,
        tenantId: userInfo.currentTenantId,
        workspaceId: userInfo.currentWorkspaceId,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
      };
      console.log({ newEmployee });
      await createEmployee(newEmployee);
    });
    return redirect("/app/employees");
  } catch (e: any) {
    return badRequest({
      error: e?.toString(),
    });
  }
};

export default function NewEmployeesRoute() {
  const { t } = useTranslation("translations");
  const actionData = useActionData<ActionData>();

  const errorModal = useRef<RefErrorModal>(null);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
  }, [actionData]);

  return (
    <div>
      <Breadcrumb
        menu={[
          {
            title: t("models.employee.plural"),
            routePath: "/app/employees",
          },
          {
            title: t("shared.new"),
          },
        ]}
      ></Breadcrumb>
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          <h2 className="flex-1 font-bold flex items-center truncate">{t("app.employees.new.multiple")}</h2>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
        <AddEmployees />
      </div>
      <ErrorModal ref={errorModal} />
    </div>
  );
}
