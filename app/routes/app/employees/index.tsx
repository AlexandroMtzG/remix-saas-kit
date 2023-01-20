import EmployeesList from "~/components/app/employees/EmployeesList";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import { useTranslation } from "react-i18next";
import { json, LoaderFunction, MetaFunction, useLoaderData, useTransition } from "remix";
import { Employee } from "@prisma/client";
import { getUserInfo } from "~/utils/session.server";
import { getEmployees } from "~/utils/db/app/employees.db.server";

export const meta: MetaFunction = () => ({
  title: "Employees | Remix SaasFrontend",
});

type LoaderData = {
  items: Employee[];
};
export let loader: LoaderFunction = async ({ request }) => {
  const userInfo = await getUserInfo(request);
  const items = await getEmployees(userInfo.currentWorkspaceId);
  const data: LoaderData = {
    items,
  };
  return json(data);
};

export default function EmployeesRoute() {
  const data = useLoaderData<LoaderData>();
  const { t } = useTranslation("translations");
  const transition = useTransition();
  const loading = transition.state === "loading";

  return (
    <div>
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          <h1 className="flex-1 font-bold flex items-center truncate">{t("app.employees.my")}</h1>
          <div className="flex items-center space-x-2">
            <ButtonPrimary to="/app/employees/new">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>

              <div>{t("app.employees.new.title")}</div>
            </ButtonPrimary>
          </div>
        </div>
      </div>
      <div className="py-4 space-y-2 mx-auto max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        <EmployeesList items={data.items} />
      </div>
    </div>
  );
}
