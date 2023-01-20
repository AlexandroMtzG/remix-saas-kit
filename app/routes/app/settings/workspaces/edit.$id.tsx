import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Transition } from "@headlessui/react";
import { FormEvent, Fragment, useEffect, useRef, useState } from "react";
import { TenantUserRole } from "~/application/enums/core/tenants/TenantUserRole";
import { WorkspaceType } from "~/application/enums/core/tenants/WorkspaceType";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import { useEscapeKeypress } from "~/utils/shared/KeypressUtils";
import clsx from "~/utils/shared/ClassesUtils";
import { useAppData } from "~/utils/data/useAppData";
import SelectUsers, { RefSelectUsers } from "~/components/core/users/SelectUsers";
import { ActionFunction, Form, json, LoaderFunction, MetaFunction, redirect, useActionData, useLoaderData, useSubmit } from "remix";
import { TenantUser, User, Workspace, WorkspaceUser } from "@prisma/client";
import { getTenantMember, getTenantUsers } from "~/utils/db/tenants.db.server";
import { getUserInfo } from "~/utils/session.server";
import { i18n } from "~/locale/i18n.server";
import { getWorkspace, updateWorkspace, updateWorkspaceUsers, deleteWorkspace } from "~/utils/db/workspaces.db.server";

export const meta: MetaFunction = () => ({
  title: "Edit workspace | Remix SaasFrontend",
});

type LoaderData = {
  workspace: (Workspace & { users: (WorkspaceUser & { user: User })[] }) | null;
  tenantUsers: (TenantUser & { user: User })[];
};

export let loader: LoaderFunction = async ({ request, params }) => {
  if (!params.id) {
    return null;
  }
  const userInfo = await getUserInfo(request);
  const workspace = await getWorkspace(params.id);
  const tenantUsers = (await getTenantUsers(userInfo?.currentTenantId)) ?? [];
  const data: LoaderData = {
    workspace,
    tenantUsers,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
  fields?: {
    name: string;
    businessMainActivity: string;
    type: WorkspaceType;
    registrationNumber: string;
    registrationDate: string | undefined;
    users: WorkspaceUser[];
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });
const unauthorized = (data: ActionData) => json(data, { status: 401 });
export const action: ActionFunction = async ({ request, params }) => {
  let t = await i18n.getFixedT(request, "translations");

  const { id } = params;
  if (!id) {
    return badRequest({
      error: t("shared.notFound"),
    });
  }
  const form = await request.formData();
  const type = form.get("type")?.toString();
  const name = form.get("name")?.toString();
  const businessMainActivity = form.get("business-main-activity")?.toString();
  const workspaceType = Number(form.get("workspace-type"));
  const registrationNumber = form.get("registration-number")?.toString();
  const registrationDate = form.get("registration-date")?.toString();
  const users = form.getAll("users[]").map((f) => f.toString());

  if (type === "edit") {
    if (!name) {
      return badRequest({
        error: "Name required",
      });
    }
    if (users.length === 0) {
      return badRequest({
        error: t("account.tenant.workspaces.errors.atLeastOneUser"),
      });
    }
    const date = registrationDate ? new Date(registrationDate) : undefined;
    const fields = {
      name,
      businessMainActivity,
      type: workspaceType,
      registrationNumber,
      registrationDate: date,
    };

    await updateWorkspace(id, fields);
    await updateWorkspaceUsers(id, users);

    return redirect("/app/settings/workspaces");
  } else if (type === "delete") {
    const userInfo = await getUserInfo(request);
    const currentTenantUser = await getTenantMember(userInfo?.userId, userInfo?.currentTenantId);
    if (currentTenantUser?.role !== TenantUserRole.OWNER && currentTenantUser?.role !== TenantUserRole.ADMIN) {
      return unauthorized({
        error: t("account.tenant.onlyAdmin"),
      });
    }
    try {
      await deleteWorkspace(id);
    } catch (e: any) {
      return badRequest({
        error: e.toString(),
      });
    }
    return redirect("/app/settings/workspaces");
  }
};

interface Props {
  maxSize?: string;
}

export default function EditWorkspaceRoute({ maxSize = "sm:max-w-lg" }: Props) {
  const appData = useAppData();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation("translations");
  const navigate = useNavigate();
  const submit = useSubmit();

  const inputName = useRef<HTMLInputElement>(null);
  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);
  const selectUsers = useRef<RefSelectUsers>(null);
  const confirmRemove = useRef<RefConfirmModal>(null);

  const [showing, setShowing] = useState(false);
  // const [loading, setLoading] = useState(false);
  // const [item, setItem] = useState<Workspace | null>(null);
  const [type, setType] = useState<WorkspaceType>(data.workspace?.type ?? WorkspaceType.PRIVATE);
  const [registrationDate] = useState<string | undefined>(
    data.workspace?.registrationDate?.toString().substring(0, 10) || actionData?.fields?.registrationDate
  );
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
    if (actionData?.success) {
      successModal.current?.show(t("shared.success"), actionData.success);
    }
  }, [actionData]);

  useEffect(() => {
    setShowing(true);
    inputName.current?.select();
    inputName.current?.focus();

    setUsers(data.workspace?.users.map((f) => f.user) ?? []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function close() {
    navigate("/app/settings/workspaces");
  }
  function remove() {
    confirmRemove.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }
  function yesRemove() {
    if (appData.currentRole == TenantUserRole.MEMBER || appData.currentRole == TenantUserRole.GUEST) {
      errorModal.current?.show(t("account.tenant.onlyAdmin"));
    } else {
      const form = new FormData();
      form.set("type", "delete");
      submit(form, { method: "post" });
    }
  }
  function selectWorkspaceUsers() {
    selectUsers.current?.show(users.map((f) => f.id));
  }
  function selectedUsers(items: User[]) {
    setUsers(items);
  }
  function changedType(e: any) {
    const _type: WorkspaceType = Number(e.target.value);
    setType(_type);
  }
  // const currentRole = useSelector((state: RootState): TenantUserRole => {
  //   return state.tenant.current?.currentUser.role ?? TenantUserRole.GUEST;
  // });
  const currentUsersDescription = () => {
    if (users.length === 0) {
      return t("app.users.seletAtLeastOne");
    }
    return users.map((f) => `${f.firstName} (${f.email})`).join(", ");
  };

  useEscapeKeypress(close);
  return (
    <div>
      <div>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition
              as={Fragment}
              show={showing}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-800 opacity-75"></div>
              </div>
            </Transition>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>
            <Transition
              as={Fragment}
              show={showing}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div
                className={clsx(
                  "inline-block align-bottom bg-white rounded-sm px-4 pt-5 pb-4 text-left overflow-visible shadow-xl transform transition-all my-8 sm:align-middle w-full sm:p-6",
                  maxSize
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <div className="just absolute top-0 right-0 -mt-4 pr-4">
                  <button
                    onClick={close}
                    type="button"
                    className="p-1 bg-white hover:bg-gray-200 border border-gray-200 rounded-full text-gray-600 justify-center flex items-center hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">{t("shared.close")}</span>
                    <svg
                      className="h-5 w-5 text-gray-700"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium">{t("app.workspaces.actions.edit")}</h4>
                  </div>
                  {(() => {
                    if (!data.workspace) {
                      return <div>{t("shared.notFound")}</div>;
                    } else if (data.workspace) {
                      return (
                        <Form method="post" className="space-y-4">
                          <input hidden type="text" name="type" value="edit" readOnly />
                          <div className="grid grid-cols-2 gap-2">
                            {/*Workspace Name */}
                            <div className="col-span-2">
                              <label htmlFor="name" className="block text-xs font-medium text-gray-700 truncate">
                                {t("models.workspace.name")}
                              </label>
                              <div className="mt-1 flex rounded-md shadow-sm w-full">
                                <input
                                  ref={inputName}
                                  type="text"
                                  name="name"
                                  id="name"
                                  autoComplete="off"
                                  required
                                  defaultValue={data.workspace?.name || actionData?.fields?.name}
                                  className={clsx(
                                    "w-full flex-1 focus:ring-theme-500 focus:border-theme-500 block min-w-0 rounded-md sm:text-sm border-gray-300"
                                  )}
                                />
                              </div>
                            </div>
                            {/*Workspace Name: End */}
                            {/*Workspace Business Main Activity */}
                            <div className="col-span-2">
                              <label htmlFor="business-main-activity" className="block text-xs font-medium text-gray-700 truncate">
                                {t("models.workspace.businessMainActivity")}
                              </label>
                              <div className="mt-1 flex rounded-md shadow-sm w-full">
                                <input
                                  type="text"
                                  id="business-main-activity"
                                  name="business-main-activity"
                                  autoComplete="off"
                                  defaultValue={data.workspace?.businessMainActivity || actionData?.fields?.businessMainActivity}
                                  className={clsx(
                                    "w-full flex-1 focus:ring-theme-500 focus:border-theme-500 block min-w-0 rounded-md sm:text-sm border-gray-300"
                                  )}
                                />
                              </div>
                            </div>
                            {/*Workspace Business Main Activity: End */}
                            {/*Workspace Type */}
                            <div className="col-span-2">
                              <label htmlFor="type" className="block text-xs font-medium text-gray-700 truncate">
                                {t("models.workspace.type")}
                              </label>
                              <div className="mt-1 rounded-md shadow-sm w-full">
                                <fieldset name="workspace-type" id="workspace-type">
                                  <legend className="sr-only">{t("models.workspace.type")}</legend>
                                  <div className="bg-white rounded-md -space-y-px">
                                    <label
                                      className={clsx(
                                        "rounded-tl-md rounded-tr-md relative border py-2 px-4 flex cursor-pointer focus:outline-none",
                                        type === 0 && "bg-theme-50 border-theme-200 z-10",
                                        type !== 0 && "border-gray-200"
                                      )}
                                    >
                                      <input
                                        type="radio"
                                        value={0}
                                        id="workspace-type"
                                        name="workspace-type"
                                        checked={type === 0}
                                        onChange={changedType}
                                        className="h-4 w-4 mt-3 cursor-pointer text-theme-600 border-gray-300 focus:ring-theme-500"
                                        aria-labelledby="workspace-type-0-label"
                                        aria-describedby="workspace-type-0-description"
                                      />
                                      <div className="ml-3 flex flex-col">
                                        <span
                                          id="workspace-type-0-label"
                                          className={clsx("block text-sm font-medium", type === 0 && "text-theme-900", type !== 0 && "text-gray-900")}
                                        >
                                          {t("app.workspaces.types.PRIVATE")}
                                        </span>

                                        <span
                                          id="workspace-type-0-description"
                                          className={clsx("block text-sm", type === 0 && "text-theme-700", type !== 0 && "text-gray-500")}
                                        >
                                          {t("app.workspaces.typesDescription.PRIVATE")}
                                        </span>
                                      </div>
                                    </label>

                                    <label
                                      className={clsx(
                                        "relative border py-2 px-4 flex cursor-pointer focus:outline-none",
                                        type === 1 && "bg-theme-50 border-theme-200 z-10",
                                        type !== 1 && "border-gray-200"
                                      )}
                                    >
                                      <input
                                        type="radio"
                                        value={1}
                                        id="workspace-type"
                                        name="workspace-type"
                                        checked={type === 1}
                                        onChange={changedType}
                                        className="h-4 w-4 mt-3 cursor-pointer text-theme-600 border-gray-300 focus:ring-theme-500"
                                        aria-labelledby="workspace-type-1-label"
                                        aria-describedby="workspace-type-1-description"
                                      />
                                      <div className="ml-3 flex flex-col">
                                        <span
                                          id="workspace-type-1-label"
                                          className={clsx("block text-sm font-medium", type === 1 && "text-theme-900", type !== 1 && "text-gray-900")}
                                        >
                                          {t("app.workspaces.types.PUBLIC")}
                                        </span>
                                        <span
                                          id="workspace-type-1-description"
                                          className={clsx("block text-sm", type === 1 && "text-theme-700", type !== 1 && "text-gray-500")}
                                        >
                                          {t("app.workspaces.typesDescription.PUBLIC")}
                                        </span>
                                      </div>
                                    </label>
                                  </div>
                                </fieldset>
                              </div>
                            </div>
                            {/*Workspace Type: End */}
                            {/*Workspace Registration Number */}
                            <div>
                              <label htmlFor="registration-number" className="block text-xs font-medium text-gray-700 truncate">
                                {t("models.workspace.registrationNumber")}
                              </label>
                              <div className="mt-1 flex rounded-md shadow-sm w-full">
                                <input
                                  type="text"
                                  id="registration-number"
                                  name="registration-number"
                                  autoComplete="off"
                                  required
                                  defaultValue={data.workspace?.registrationNumber || actionData?.fields?.registrationNumber}
                                  disabled={type !== 1}
                                  className={clsx(
                                    "w-full flex-1 focus:ring-theme-500 focus:border-theme-500 block min-w-0 rounded-md sm:text-sm border-gray-300",
                                    type !== 1 && "bg-gray-100 cursor-not-allowed"
                                  )}
                                />
                              </div>
                            </div>
                            {/*Workspace Registration Number: End */}

                            {/*Workspace Registration Date */}
                            <div>
                              <label htmlFor="registration-date" className="block text-xs font-medium text-gray-700 truncate">
                                {t("models.workspace.registrationDate")}
                              </label>
                              <div className="mt-1 flex rounded-md shadow-sm w-full">
                                <input
                                  type="date"
                                  id="registration-date"
                                  name="registration-date"
                                  required
                                  defaultValue={registrationDate}
                                  disabled={type !== 1}
                                  className={clsx(
                                    "w-full flex-1 focus:ring-theme-500 focus:border-theme-500 block min-w-0 rounded-md sm:text-sm border-gray-300",
                                    type !== 1 && "bg-gray-100 cursor-not-allowed"
                                  )}
                                />
                              </div>
                            </div>
                            {/*Workspace Registration Date: End */}
                            {/*Workspace Users */}
                            <div className="col-span-2">
                              <label htmlFor="users[]" className="block text-xs font-medium text-gray-700 truncate">
                                {t("models.user.plural")}
                              </label>
                              <div className="mt-2 rounded-md w-full space-y-2">
                                {users.map((user, idx) => {
                                  return <input hidden key={idx} type="text" id="users[]" name="users[]" value={user.id} readOnly />;
                                })}
                                <input
                                  type="text"
                                  id="users"
                                  name="users"
                                  autoComplete="off"
                                  disabled
                                  value={currentUsersDescription()}
                                  readOnly
                                  className="bg-gray-100 cursor-not-allowed w-full flex-1 focus:ring-theme-500 focus:border-theme-500 block min-w-0 rounded-md sm:text-sm border-gray-300"
                                />
                                <button type="button" onClick={selectWorkspaceUsers} className="flex items-center space-x-1 text-xs text-theme-600">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  <span className="uppercase font-medium">{t("app.workspaces.actions.selectWorkspaceUsers")}</span>
                                </button>
                              </div>
                            </div>
                            {/*Workspace Users: End */}
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div>
                              <button
                                className={clsx(
                                  "inline-flex items-center px-3 py-2 border space-x-2 border-gray-300 shadow-sm sm:text-sm font-medium sm:rounded-md text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
                                )}
                                type="button"
                                onClick={remove}
                              >
                                <div>{t("shared.delete")}</div>
                              </button>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                className={clsx(
                                  "inline-flex items-center px-3 py-2 border space-x-2 border-gray-300 shadow-sm sm:text-sm font-medium sm:rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
                                )}
                                type="button"
                                onClick={close}
                              >
                                <div>{t("shared.cancel")}</div>
                              </button>
                              <button
                                className={clsx(
                                  "inline-flex items-center px-3 py-2 border space-x-2 border-transparent shadow-sm sm:text-sm font-medium sm:rounded-md text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
                                )}
                                type="submit"
                              >
                                <div>{t("shared.save")}</div>
                              </button>
                            </div>
                          </div>
                        </Form>
                      );
                    } else {
                      return <div></div>;
                    }
                  })()}
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <ConfirmModal ref={confirmRemove} onYes={yesRemove} />
      <ErrorModal ref={errorModal} />
      <SuccessModal ref={successModal} onClosed={close} />
      <SelectUsers ref={selectUsers} onSelected={selectedUsers} items={data.tenantUsers.map((f) => f.user)} />
    </div>
  );
}
