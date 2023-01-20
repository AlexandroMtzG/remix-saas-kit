import { useTranslation } from "react-i18next";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { useEffect, useRef, useState } from "react";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import { TenantUserRole } from "~/application/enums/core/tenants/TenantUserRole";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import Loading from "~/components/ui/loaders/Loading";
import { ActionFunction, json, LoaderFunction, MetaFunction, useActionData, useLoaderData, useSubmit, useTransition } from "remix";
import { adminGetAllUsers, deleteUser, getUser, updateUserPassword } from "~/utils/db/users.db.server";
import { createUserSession, getUserInfo, setLoggedUser } from "~/utils/session.server";
import { i18n } from "~/locale/i18n.server";
import { Tenant, TenantUser, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { UserType } from "~/application/enums/core/users/UserType";

export const meta: MetaFunction = () => ({
  title: "Users | Remix SaasFrontend",
});

type LoaderData = {
  items: Awaited<ReturnType<typeof adminGetAllUsers>>;
};

export let loader: LoaderFunction = async ({ request }) => {
  const items = await adminGetAllUsers();
  const data: LoaderData = {
    items,
  };
  return json(data);
};

enum ActionType {
  Impersonate = "impersonate",
  ChangePassword = "change-password",
  DeleteUser = "delete-user",
}
type ActionData = {
  error?: string;
  success?: string;
};
const success = (data: ActionData) => json(data, { status: 200 });
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  const userInfo = await getUserInfo(request);
  let t = await i18n.getFixedT(request, "translations");

  const form = await request.formData();
  const type: ActionType = form.get("type")?.toString() as ActionType;
  const userId = form.get("user-id")?.toString();
  const user = await getUser(userId);

  if (!userId || !user || !type) {
    return badRequest({ error: "Form not submitted correctly." });
  }
  switch (type) {
    case ActionType.Impersonate: {
      const userSession = await setLoggedUser(user);
      if (!userSession) {
        return badRequest({
          error: t("shared.notFound"),
        });
      }
      return createUserSession(
        {
          ...userInfo,
          ...userSession,
        },
        "/app/dashboard"
      );
    }
    case ActionType.ChangePassword: {
      const passwordNew = form.get("password-new")?.toString();
      if (!passwordNew || passwordNew.length < 8) {
        return badRequest({ error: "Set a password with 8 characters minimum" });
      } else if (user?.type === UserType.Admin) {
        return badRequest({ error: "You cannot change password for admin user" });
      }

      const passwordHash = await bcrypt.hash(passwordNew, 10);
      await updateUserPassword({ passwordHash }, user?.id);

      return success({ success: t("shared.updated") });
    }
    case ActionType.DeleteUser: {
      // TODO: CANCEL TENANTS SUBSCRIPTIONS, DELETE TENANTS, WORKSPACES AND SUBSCRIPTIONS
      await deleteUser(userId);
      return success({ success: t("shared.deleted") });
    }
    default: {
      return badRequest({ error: "Form not submitted correctly." });
    }
  }
};

export default function AdminUsersRoute() {
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation("translations");
  const submit = useSubmit();
  const transition = useTransition();
  const loading = transition.state === "loading" || transition.state === "submitting";

  const confirmDelete = useRef<RefConfirmModal>(null);
  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);

  const [searchInput, setSearchInput] = useState("");
  const headers = [
    {
      title: t("models.user.object"),
    },
    {
      title: t("models.user.tenants"),
    },
    {
      title: t("shared.actions"),
    },
  ];

  useEffect(() => {
    if (actionData?.success) {
      successModal.current?.show(actionData?.success);
    }
    if (actionData?.error) {
      errorModal.current?.show(actionData?.error);
    }
  }, [actionData]);

  function impersonate(user: User) {
    const form = new FormData();
    form.set("type", ActionType.Impersonate);
    form.set("user-id", user.id);
    submit(form, {
      method: "post",
    });
  }
  function changePassword(user: User) {
    const password = prompt(t("settings.profile.changePassword") + " - " + user.email);
    if (password && confirm("[ADMINISTRATOR] Update password for user " + user.email + "?")) {
      const form = new FormData();
      form.set("type", ActionType.ChangePassword);
      form.set("user-id", user.id);
      form.set("password-new", password);
      submit(form, {
        method: "post",
      });
    }
  }
  function getUserTenants(user: User & { tenants: (TenantUser & { tenant: Tenant })[] }) {
    return user.tenants.map((f) => `${f.tenant?.name} (${t("settings.profile.roles." + TenantUserRole[f.role])})`).join(", ");
  }
  function deleteUser(item: User) {
    if (confirmDelete.current) {
      confirmDelete.current.setValue(item);
      confirmDelete.current.show(t("shared.delete"), t("shared.delete"), t("shared.cancel"), t("admin.users.deleteWarning"));
    }
  }
  function confirmDeleteUser(item: User) {
    const form = new FormData();
    form.set("type", ActionType.DeleteUser);
    form.set("user-id", item.id);
    submit(form, {
      method: "post",
    });
  }
  const filteredItems = () => {
    if (!data.items) {
      return [];
    }
    const filtered = data.items.filter((f) => f.firstName?.toString()?.toUpperCase().includes(searchInput.toUpperCase()));

    return filtered.sort((x, y) => {
      if (x.createdAt && y.createdAt) {
        return (x.createdAt > y.createdAt ? -1 : 1) ?? -1;
      }
      return -1;
    });
  };

  return (
    <div>
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          <h1 className="flex-1 font-bold flex items-center truncate">
            {t("models.user.plural")}
            {!loading && (
              <span className="ml-2 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-800 border border-gray-300">
                {filteredItems().length}
              </span>
            )}
          </h1>
          <div className="flex items-center space-x-2 h-9">
            <ButtonSecondary to="." type="button">
              {t("shared.reload")}
            </ButtonSecondary>
          </div>
        </div>
      </div>
      <div className="pt-2 space-y-2 mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl xl:max-w-7xl">
        {(() => {
          if (loading) {
            return <Loading />;
          } else {
            return (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex items-center justify-start w-full">
                    <div className="relative flex items-center w-full">
                      <div className="focus-within:z-10 absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="buscador"
                        id="buscador"
                        className="w-full focus:ring-theme-500 focus:border-theme-500 block rounded-md pl-10 sm:text-sm border-gray-300"
                        placeholder={t("shared.searchDot")}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                {(() => {
                  if (filteredItems().length === 0) {
                    return (
                      <div>
                        <EmptyState
                          className="bg-white"
                          captions={{
                            thereAreNo: t("app.workspaces.errors.noUsers"),
                          }}
                        />
                      </div>
                    );
                  } else {
                    return (
                      <div>
                        <div>
                          <div className="flex flex-col">
                            <div className="overflow-x-auto">
                              <div className="py-2 align-middle inline-block min-w-full">
                                <div className="shadow overflow-hidden border border-gray-200 sm:rounded-lg">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        {headers.map((header, idx) => {
                                          return (
                                            <th
                                              key={idx}
                                              scope="col"
                                              className="text-xs px-3 py-2 text-left font-medium text-gray-500 tracking-wider select-none truncate"
                                            >
                                              <div className="flex items-center space-x-1 text-gray-500">
                                                <div>{header.title}</div>
                                              </div>
                                            </th>
                                          );
                                        })}
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {filteredItems().map((item, idx) => {
                                        return (
                                          <tr key={idx}>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                              <div className="flex items-center space-x-4">
                                                <div>
                                                  <div className="text-sm font-medium text-gray-900">
                                                    {item.firstName} {item.lastName}
                                                  </div>
                                                  <div className="text-sm text-gray-500">{item.email}</div>
                                                </div>
                                              </div>
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                              {item.tenants && item.tenants.length > 0 ? <span>{getUserTenants(item)}</span> : <span>?</span>}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                              <div className="flex items-center space-x-2">
                                                <ButtonTertiary disabled={item.type === 0} onClick={() => impersonate(item)}>
                                                  {t("models.user.impersonate")}
                                                </ButtonTertiary>
                                                <ButtonTertiary disabled={item.type === 0} onClick={() => changePassword(item)}>
                                                  {t("settings.profile.changePassword")}
                                                </ButtonTertiary>
                                                <ButtonTertiary disabled={item.type === 0} onClick={() => deleteUser(item)} destructive={true}>
                                                  {t("shared.delete")}
                                                </ButtonTertiary>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            );
          }
        })()}
      </div>
      <SuccessModal ref={successModal} />
      <ErrorModal ref={errorModal} />
      <ConfirmModal ref={confirmDelete} onYes={confirmDeleteUser} />
    </div>
  );
}
