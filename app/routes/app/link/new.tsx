import { useTranslation } from "react-i18next";
import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import { ActionFunction, json, LoaderFunction, MetaFunction, useLoaderData, useLocation } from "remix";
import { createLink, getLinksCount } from "~/utils/db/links.db.server";
import { i18n } from "~/locale/i18n.server";
import { getUserInfo } from "~/utils/session.server";
import NewLink from "~/components/app/links/pending/NewLink";
import { getUserByEmail } from "~/utils/db/users.db.server";
import { getUserWorkspacesByUserId } from "~/utils/db/workspaces.db.server";
import { LinkStatus } from "~/application/enums/core/links/LinkStatus";
import { Link } from "@prisma/client";
import { getTenantMember } from "~/utils/db/tenants.db.server";
import { TenantUserRole } from "~/application/enums/core/tenants/TenantUserRole";
import { sendEmail } from "~/utils/email.server";
import { loadAppData } from "~/utils/data/useAppData";

export const meta: MetaFunction = () => ({
  title: "New link | Remix SaasFrontend",
});

type LoaderData = {
  linksCount: number;
};
export let loader: LoaderFunction = async ({ request }) => {
  const userInfo = await getUserInfo(request);

  const data: LoaderData = {
    linksCount: await getLinksCount(userInfo.currentWorkspaceId, [LinkStatus.PENDING, LinkStatus.LINKED]),
  };
  return json(data);
};

export type NewLinkActionData = {
  error?: string;
  success?: string;
  link?: Link;
};
const badRequest = (data: NewLinkActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  let t = await i18n.getFixedT(request, "translations");

  const userInfo = await getUserInfo(request);
  const appData = await loadAppData(request);

  const form = await request.formData();
  const email = form.get("email")?.toString().toLowerCase().trim() ?? "";
  const workspaceName = form.get("workspace-name")?.toString() ?? "";
  const inviteeIsProvider = Boolean(form.get("invitee-is-provider"));
  if (!email || !workspaceName) {
    return badRequest({ error: t("shared.missingFields") });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return badRequest({ error: t("api.errors.userNotRegistered") });
  }
  if (user.id === userInfo.userId) {
    return badRequest({ error: t("app.links.invitation.cannotInviteSelf") });
  }

  const workspaces = await getUserWorkspacesByUserId(user.id);
  const workspaceMember = workspaces.find((f) => f.workspace.name === workspaceName);
  if (!workspaceMember) {
    return badRequest({
      error: t("app.links.invitation.notFound", [email, workspaceName]),
    });
  }
  if (workspaceMember.workspace.tenantId === userInfo.currentTenantId) {
    return badRequest({ error: t("app.links.invitation.cannotInviteCurrentTenant") });
  }
  const tenantMember = await getTenantMember(user.id, workspaceMember.workspace.tenantId);
  if (!tenantMember || (tenantMember.role !== TenantUserRole.OWNER && tenantMember.role !== TenantUserRole.ADMIN)) {
    return badRequest({ error: t("app.links.invitation.inviteOwnersOrAdmins") });
  }

  const link = await createLink({
    createdByUserId: userInfo.userId,
    createdByWorkspaceId: userInfo.currentWorkspaceId,
    providerWorkspaceId: inviteeIsProvider ? workspaceMember.workspaceId : userInfo.currentWorkspaceId,
    clientWorkspaceId: inviteeIsProvider ? userInfo.currentWorkspaceId : workspaceMember.workspaceId,
    status: LinkStatus.PENDING,
    userInvitedId: user.id,
  });

  if (!link) {
    return badRequest({ error: "Could not create link" });
  }

  await sendEmail(user.email, "invite-user-to-link-workspace", {
    action_url: process.env.REMIX_SERVER_URL + `/app/links/pending`,
    name: user.firstName,
    invite_sender_name: appData.user?.firstName,
    invite_sender_email: appData.user?.email,
    workspace_invitee: workspaceName,
    workspace_creator: appData.currentWorkspace?.name,
    invitation_role: inviteeIsProvider ? "as a provider" : "as a client",
  });

  const data: NewLinkActionData = {
    link,
    success: t("app.links.pending.invitationSentDescription", [email]),
  };
  return json(data);
};

export default function NewLinkRoute() {
  const data = useLoaderData<LoaderData>();
  const { t } = useTranslation("translations");
  return (
    <div>
      <Breadcrumb
        menu={[
          {
            title: t("models.link.plural"),
            routePath: "/app/links/pending",
          },
          {
            title: t("app.links.new"),
            routePath: "/app/link/new",
          },
        ]}
      />
      <div className="lg:py-8 max-w-2xl mx-auto">
        <div>
          <NewLink linksCount={data.linksCount} />
        </div>
      </div>
    </div>
  );
}
