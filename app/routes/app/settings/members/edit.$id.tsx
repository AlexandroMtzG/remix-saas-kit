import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Transition } from "@headlessui/react";
import { FormEvent, Fragment, useEffect, useRef, useState } from "react";
import { TenantUserRole } from "~/application/enums/core/tenants/TenantUserRole";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import { useEscapeKeypress } from "~/utils/shared/KeypressUtils";
import SelectWorkspaces, { RefSelectWorkspaces } from "~/components/core/workspaces/SelectWorkspaces";
import { TenantUser, User, Workspace, WorkspaceUser } from "@prisma/client";
import { ActionFunction, Form, json, LoaderFunction, MetaFunction, redirect, useActionData, useLoaderData, useSubmit, useTransition } from "remix";
import { deleteTenantUser, getTenantMember, getTenantUser, getTenantUsers, updateTenantUser } from "~/utils/db/tenants.db.server";
import { i18n } from "~/locale/i18n.server";
import { getUserWorkspaces, getWorkspace, getWorkspaces, updateUsersWorkspaces } from "~/utils/db/workspaces.db.server";
import { getUserInfo } from "~/utils/session.server";
import clsx from "clsx";
import { useAppData } from "~/utils/data/useAppData";

export const meta: MetaFunction = () => ({
  title: "Edit member | Remix SaasFrontend",
});

type LoaderData = {
  member: (TenantUser & { user: User }) | null;
  tenantWorkspaces: Workspace[];
  userWorkspaces: Workspace[];
};

export let loader: LoaderFunction = async ({ request, params }) => {
  if (!params.id) {
    return null;
  }
  const userInfo = await getUserInfo(request);
  const member = await getTenantUser(params.id);
  const userWorkspaces = await getUserWorkspaces(userInfo?.currentTenantId, member?.userId);
  const tenantWorkspaces = await getWorkspaces(userInfo?.currentTenantId);
  const data: LoaderData = {
    member,
    userWorkspaces: userWorkspaces?.map((f) => f.workspace) ?? [],
    tenantWorkspaces,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
  fields?: {
    email: string;
    firstName: string;
    lastName: string;
    role: number;
    workspaces: string[];
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
  const userInfo = await getUserInfo(request);
  const form = await request.formData();
  const type = form.get("type")?.toString();
  const email = form.get("email")?.toString().toLowerCase().trim();
  const firstName = form.get("firstName")?.toString() ?? "";
  const lastName = Number(form.get("lastName")) ?? "";
  const role = Number(form.get("tenant-user-role"));
  const workspaces = form.getAll("workspaces[]").map((f) => f.toString());

  const tenantUsers = await getTenantUsers(userInfo?.currentTenantId);
  const owners = tenantUsers?.filter((f) => f.role === TenantUserRole.OWNER);
  if (owners?.length === 1 && owners?.find((f) => f.user.email === email) && role !== TenantUserRole.OWNER) {
    return badRequest({
      error: t("api.errors.cannotBeWithoutOwner"),
    });
  }

  if (type === "edit") {
    if (workspaces.length === 0) {
      return badRequest({
        error: t("account.tenant.members.errors.atLeastOneWorkspace"),
      });
    }

    const tenantUser = await getTenantUser(id);
    if (!tenantUser) {
      return badRequest({
        error: t("shared.notFound"),
      });
    }
    await updateTenantUser(id, { role });
    workspaces.forEach(async (workspaceId) => {
      const workspace = await getWorkspace(workspaceId);
      console.log({ workspace: workspace?.name });
    });
    await updateUsersWorkspaces(tenantUser?.userId, workspaces);

    return redirect("/app/settings/members");
  } else if (type === "delete") {
    const currentTenantUser = await getTenantMember(userInfo?.userId, userInfo?.currentTenantId);
    if (currentTenantUser?.role !== TenantUserRole.OWNER && currentTenantUser?.role !== TenantUserRole.ADMIN) {
      return unauthorized({
        error: t("account.tenant.onlyAdmin"),
      });
    }
    try {
      await deleteTenantUser(id);
    } catch (e: any) {
      return badRequest({
        error: e.toString(),
      });
    }
    return redirect("/app/settings/members");
  }
};

interface Props {
  maxSize?: string;
}

export default function EditMemberRoute({ maxSize = "sm:max-w-lg" }: Props) {
  const appData = useAppData();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation("translations");
  const navigate = useNavigate();
  const submit = useSubmit();
  const transition = useTransition();
  const loading = transition.state === "submitting" || transition.state === "loading";

  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);
  const selectWorkspaces = useRef<RefSelectWorkspaces>(null);
  const confirmRemove = useRef<RefConfirmModal>(null);

  // const [item, setItem] = useState<TenantUserDto | null>(null);
  const [showing, setShowing] = useState(false);
  // const [loading, setLoading] = useState(false);
  // const [email, setEmail] = useState("");
  // const [firstName, setFirstName] = useState("");
  // const [lastName, setLastName] = useState("");
  // const [phone, setPhone] = useState("");
  const [role, setRole] = useState<TenantUserRole>(actionData?.fields?.role ?? data.member?.role ?? TenantUserRole.MEMBER);
  const roleOptions = [
    {
      value: TenantUserRole.OWNER,
      name: t("settings.profile.roles.OWNER"),
      description: t("settings.profile.permissions.OWNER"),
    },
    {
      value: TenantUserRole.ADMIN,
      name: t("settings.profile.roles.ADMIN"),
      description: t("settings.profile.permissions.ADMIN"),
    },
    {
      value: TenantUserRole.MEMBER,
      name: t("settings.profile.roles.MEMBER"),
      description: t("settings.profile.permissions.MEMBER"),
    },
    {
      value: TenantUserRole.GUEST,
      name: t("settings.profile.roles.GUEST"),
      description: t("settings.profile.permissions.GUEST"),
    },
  ];
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

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
    setWorkspaces(data.userWorkspaces ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function close() {
    navigate("/app/settings/members");
  }
  function save(e: FormEvent) {
    e.preventDefault();
    if (workspaces.length === 0) {
      errorModal.current?.show(t("shared.error"), t("account.tenant.members.errors.atLeastOneWorkspace"));
      return;
    }
  }
  function remove() {
    confirmRemove.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"));
  }
  function yesRemove() {
    if (appData.currentRole === TenantUserRole.MEMBER || appData.currentRole === TenantUserRole.GUEST) {
      errorModal.current?.show(t("account.tenant.onlyAdmin"));
    } else {
      const form = new FormData();
      form.set("type", "delete");
      submit(form, {
        method: "post",
      });
    }
  }
  function selectUserWorkspaces() {
    selectWorkspaces.current?.show(workspaces.map((f) => f.id));
  }
  function selectedWorkspaces(items: Workspace[]) {
    setWorkspaces(items);
  }
  function changedRole(e: any) {
    const _role: TenantUserRole = Number(e.target.value);
    setRole(_role);
  }

  const currentWorkspacesDescription = (workspaces: Workspace[]) => {
    if (workspaces.length === 0) {
      return t("app.workspaces.seletAtLeastOne");
    }
    return workspaces.map((f) => f.name).join(", ");
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
                    <h4 className="text-lg font-medium">{t("settings.members.actions.edit")}</h4>
                  </div>
                  {(() => {
                    if (!data.member) {
                      return <div>{t("shared.notFound")}</div>;
                    } else if (data.member) {
                      return (
                        <Form method="post" className="space-y-4">
                          <input hidden type="text" name="type" value="edit" readOnly />
                          <div className="grid grid-cols-2 gap-2">
                            {/*Email */}
                            <div className="col-span-2">
                              <label htmlFor="email" className="block text-xs font-medium text-gray-700 truncate">
                                {t("models.user.email")}
                              </label>
                              <div className="mt-1 flex rounded-md shadow-sm w-full">
                                <input
                                  type="email"
                                  id="email"
                                  name="email"
                                  autoComplete="off"
                                  readOnly
                                  defaultValue={data.member?.user.email || actionData?.fields?.email}
                                  className={clsx(
                                    "w-full flex-1 focus:ring-theme-500 focus:border-theme-500 block min-w-0 rounded-md sm:text-sm border-gray-300",
                                    true && "bg-gray-100 cursor-not-allowed"
                                  )}
                                />
                              </div>
                            </div>
                            {/*Email: End */}

                            {/*User First Name */}
                            <div>
                              <label htmlFor="first-name" className="block text-xs font-medium text-gray-700 truncate">
                                {t("models.user.firstName")}
                              </label>
                              <div className="mt-1 flex rounded-md shadow-sm w-full">
                                <input
                                  type="text"
                                  id="first-name"
                                  name="first-name"
                                  autoComplete="off"
                                  readOnly
                                  defaultValue={data.member?.user.firstName || actionData?.fields?.firstName}
                                  className={clsx(
                                    "w-full flex-1 focus:ring-theme-500 focus:border-theme-500 block min-w-0 rounded-md sm:text-sm border-gray-300",
                                    true && "bg-gray-100 cursor-not-allowed"
                                  )}
                                />
                              </div>
                            </div>
                            {/*User First Name: End */}

                            {/*User Last Name */}
                            <div>
                              <label htmlFor="last-name" className="block text-xs font-medium text-gray-700 truncate">
                                {t("models.user.lastName")}
                              </label>
                              <div className="mt-1 flex rounded-md shadow-sm w-full">
                                <input
                                  type="text"
                                  id="last-name"
                                  name="last-name"
                                  autoComplete="off"
                                  readOnly
                                  defaultValue={data.member?.user.lastName || actionData?.fields?.lastName}
                                  className={clsx(
                                    "w-full flex-1 focus:ring-theme-500 focus:border-theme-500 block min-w-0 rounded-md sm:text-sm border-gray-300",
                                    true && "bg-gray-100 cursor-not-allowed"
                                  )}
                                />
                              </div>
                            </div>
                            {/*User Last Name: End */}

                            {/*User Role */}
                            <div className="col-span-2">
                              <label htmlFor="last-name" className="block text-xs font-medium text-gray-700 truncate">
                                {t("models.user.role")}
                              </label>
                              <div className="mt-1 rounded-md shadow-sm w-full">
                                <fieldset>
                                  <legend className="sr-only">{t("models.user.role")}</legend>
                                  <div className="bg-white rounded-md -space-y-px">
                                    {roleOptions.map((option, idxRole) => {
                                      return (
                                        <label
                                          key={idxRole}
                                          className={clsx(
                                            "rounded-tl-md rounded-tr-md relative border py-2 px-4 flex cursor-pointer focus:outline-none",
                                            role === option.value && "bg-theme-50 border-theme-200 z-10",
                                            role !== option.value && "border-gray-200",
                                            idxRole === 0 && "rounded-tl-md rounded-tr-md",
                                            idxRole === roleOptions.length - 1 && "rounded-bl-md rounded-br-md"
                                          )}
                                        >
                                          <input
                                            type="radio"
                                            name="tenant-user-role"
                                            className="h-4 w-4 mt-3 cursor-pointer text-theme-600 border-gray-300 focus:ring-theme-500"
                                            aria-labelledby="tenant-user-role-0-label"
                                            aria-describedby="tenant-user-role-0-description"
                                            value={option.value}
                                            checked={role === option.value}
                                            onChange={changedRole}
                                          />
                                          <div className="ml-3 flex flex-col">
                                            <span
                                              id="tenant-user-role-0-label"
                                              className={clsx(
                                                "block text-sm font-medium",
                                                role === option.value && "text-theme-900",
                                                role !== option.value && "text-gray-900"
                                              )}
                                            >
                                              {option.name}
                                            </span>

                                            <span
                                              id="tenant-user-role-0-description"
                                              className={clsx(
                                                "block text-sm",
                                                role === option.value && "text-theme-700",
                                                role !== option.value && "text-gray-500"
                                              )}
                                            >
                                              {option.description}
                                            </span>
                                          </div>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </fieldset>
                              </div>
                            </div>
                            {/*User Role: End */}

                            {/*User Workspaces */}
                            <div className="col-span-2">
                              <label htmlFor="description" className="block text-xs font-medium text-gray-700 truncate">
                                {t("models.workspace.plural")}
                              </label>
                              <div className="mt-2 rounded-md w-full space-y-2">
                                {workspaces.map((workspace, idx) => {
                                  return <input hidden key={idx} type="text" id="workspaces[]" name="workspaces[]" value={workspace.id} readOnly />;
                                })}
                                <input
                                  type="text"
                                  id="description"
                                  autoComplete="off"
                                  disabled
                                  value={currentWorkspacesDescription(workspaces)}
                                  className="bg-gray-100 cursor-not-allowed w-full flex-1 focus:ring-theme-500 focus:border-theme-500 block min-w-0 rounded-md sm:text-sm border-gray-300"
                                />
                                <button type="button" onClick={selectUserWorkspaces} className="flex items-center space-x-1 text-xs text-theme-600">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  <span className="uppercase font-medium">{t("app.workspaces.actions.selectUserWorkspaces")}</span>
                                </button>
                              </div>
                            </div>
                            {/*User Workspaces: End */}
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            {(() => {
                              if (loading) {
                                return (
                                  <div className="text-theme-700 text-sm">
                                    <div>{t("shared.loading")}...</div>
                                  </div>
                                );
                              } else {
                                return (
                                  <div>
                                    <button
                                      disabled={loading}
                                      className={clsx(
                                        "inline-flex items-center px-3 py-2 border space-x-2 border-gray-300 shadow-sm sm:text-sm font-medium sm:rounded-md text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500",
                                        loading && "bg-gray-100 cursor-not-allowed"
                                      )}
                                      type="button"
                                      onClick={remove}
                                    >
                                      <div>{t("shared.delete")}</div>
                                    </button>
                                  </div>
                                );
                              }
                            })()}

                            <div className="flex items-center space-x-2">
                              <button
                                disabled={loading}
                                className={clsx(
                                  "inline-flex items-center px-3 py-2 border space-x-2 border-gray-300 shadow-sm sm:text-sm font-medium sm:rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500",
                                  loading && "bg-gray-100 cursor-not-allowed"
                                )}
                                type="button"
                                onClick={close}
                              >
                                <div>{t("shared.cancel")}</div>
                              </button>
                              <button
                                disabled={loading}
                                className={clsx(
                                  "inline-flex items-center px-3 py-2 border space-x-2 border-transparent shadow-sm sm:text-sm font-medium sm:rounded-md text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500",
                                  loading && "opacity-50 cursor-not-allowed"
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
      <SelectWorkspaces ref={selectWorkspaces} onSelected={selectedWorkspaces} items={data.tenantWorkspaces} />
    </div>
  );
}
