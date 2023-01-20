import { useTranslation } from "react-i18next";
import { TenantUserRole } from "~/application/enums/core/tenants/TenantUserRole";
import { UserType } from "~/application/enums/core/users/UserType";
import MembersListAndTable from "~/components/core/settings/members/MembersListAndTable";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { useRef, useState } from "react";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import { getTenantMember, getTenantUsers } from "~/utils/db/tenants.db.server";
import { ActionFunction, json, Link, LoaderFunction, MetaFunction, Outlet, redirect, useLoaderData, useNavigate } from "remix";
import { getUserInfo } from "~/utils/session.server";
import { useAppData } from "~/utils/data/useAppData";
import { TenantUser } from "@prisma/client";
import { deleteUserInvitation, getUserInvitation, getUserInvitations } from "~/utils/db/tenantUserInvitations.db.server";
import MemberInvitationsListAndTable from "~/components/core/settings/members/MemberInvitationsListAndTable";

export const meta: MetaFunction = () => ({
  title: "Members | Remix SaasFrontend",
});

type LoaderData = {
  users: Awaited<ReturnType<typeof getTenantUsers>>;
  pendingInvitations: Awaited<ReturnType<typeof getUserInvitations>>;
};
export let loader: LoaderFunction = async ({ request }) => {
  const userInfo = await getUserInfo(request);
  const users = await getTenantUsers(userInfo?.currentTenantId);
  const pendingInvitations = await getUserInvitations(userInfo?.currentTenantId);
  const currentTenantUser = await getTenantMember(userInfo?.userId, userInfo?.currentTenantId);
  if (currentTenantUser?.role !== TenantUserRole.OWNER && currentTenantUser?.role !== TenantUserRole.ADMIN) {
    return redirect("/app/unauthorized");
  }
  const data: LoaderData = {
    users,
    pendingInvitations,
  };
  return json(data);
};

type ActionData = {
  success?: string;
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const type = form.get("type")?.toString();
  if (type === "delete-invitation") {
    const invitationId = form.get("invitation-id")?.toString() ?? "";
    const invitation = await getUserInvitation(invitationId);
    if (!invitation) {
      return badRequest({
        error: "Invitation not found",
      });
    }
    await deleteUserInvitation(invitation.id);
    return json({ success: "Invitation deleted" });
  }
};

export default function MembersRoute() {
  const appData = useAppData();
  const data = useLoaderData<LoaderData>();
  const { t } = useTranslation("translations");
  const navigate = useNavigate();

  const errorModal = useRef<RefErrorModal>(null);
  const confirmUpgrade = useRef<RefConfirmModal>(null);

  const [searchInput, setSearchInput] = useState("");

  const [acceptedUser] = useState<TenantUser | null>(null);

  function yesUpdateSubscription() {
    navigate("/app/settings/subscription");
  }

  const maxUsers = (): number => {
    if (appData.user?.type === UserType.Admin) {
      return 0;
    }
    return appData.currentTenant?.features?.maxUsers ?? 0;
  };
  const maxUsersReached = () => {
    return maxUsers() > 0 && (data.users?.length ?? 0) >= maxUsers();
  };
  const filteredItems = () => {
    if (!data.users) {
      return [];
    }
    return data.users.filter(
      (f) =>
        f.user.firstName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.user.lastName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.user.email?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.user.phone?.toString().toUpperCase().includes(searchInput.toUpperCase())
    );
  };
  const sortedItems = () => {
    if (!data.users) {
      return [];
    }
    const filtered = filteredItems()
      .slice()
      .sort((x, y) => {
        return x.role > y.role ? -1 : 1;
      });
    return filtered.sort((x, y) => {
      return x.role > y.role ? 1 : -1;
    });
  };

  return (
    <div>
      <div className="py-4 space-y-2 mx-auto max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        <div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="flex items-center justify-between w-full space-x-2">
                <div className="relative flex items-center w-full flex-grow">
                  <div className="focus-within:z-10 absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
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
                <Link
                  to="/app/settings/members/new"
                  className="inline-flex space-x-2 items-center px-2 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>

                  <div>{t("shared.new")}</div>
                </Link>
              </div>
            </div>
            <div>
              <MembersListAndTable items={sortedItems()} />

              {data.pendingInvitations.length > 0 && <MemberInvitationsListAndTable items={data.pendingInvitations} />}

              {maxUsersReached() && (
                <div>
                  <WarningBanner title={t("app.subscription.errors.limitReached")} text={t("app.subscription.errors.limitReachedUsers", [maxUsers])} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ErrorModal ref={errorModal} />
      <ConfirmModal ref={confirmUpgrade} onYes={yesUpdateSubscription} />
      <Outlet />
    </div>
  );
}
