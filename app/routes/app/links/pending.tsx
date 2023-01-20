import { useTranslation } from "react-i18next";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { AppUsageType } from "~/application/enums/app/usages/AppUsageType";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import Loading from "~/components/ui/loaders/Loading";
import DateUtils from "~/utils/shared/DateUtils";
import { useRef, useState, useEffect } from "react";
import { LoaderFunction, json, useLoaderData, useTransition, ActionFunction, useSubmit, MetaFunction, useActionData } from "remix";
import { LinkWithWorkspaces, getLinks, updateLink, getLink } from "~/utils/db/links.db.server";
import { getUserInfo } from "~/utils/session.server";
import { LinkStatus } from "~/application/enums/core/links/LinkStatus";
import { loadAppData, useAppData } from "~/utils/data/useAppData";
import { sendEmail } from "~/utils/email.server";
import { getUser } from "~/utils/db/users.db.server";

export const meta: MetaFunction = () => ({
  title: "Pending | Remix SaasFrontend",
});

type LoaderData = {
  items: LinkWithWorkspaces[];
};
export let loader: LoaderFunction = async ({ request }) => {
  const userInfo = await getUserInfo(request);
  const items = await getLinks(userInfo.currentWorkspaceId, LinkStatus.PENDING);
  const data: LoaderData = {
    items,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
  items?: LinkWithWorkspaces[];
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  const userInfo = await getUserInfo(request);
  const appData = await loadAppData(request);

  const form = await request.formData();
  const linkId = form.get("link-id")?.toString();
  if (!linkId) {
    return badRequest({ error: "Invalid link" });
  }
  console.log({ form: JSON.stringify(form) });
  const link = await getLink(linkId);
  const accepted = form.get("accepted")?.toString() === "true";

  if (!link) {
    return badRequest({
      error: "Link not found",
    });
  }

  const user = await getUser(link?.createdByUserId);
  if (!user) {
    return badRequest({
      error: "Invalid user",
    });
  }

  await updateLink(linkId, {
    status: accepted ? LinkStatus.LINKED : LinkStatus.REJECTED,
  });

  if (accepted) {
    await sendEmail(user.email, "link-invitation-accepted", {
      action_url: process.env.REMIX_SERVER_URL + `/app/links/all`,
      name: user.firstName,
      user_invitee_name: appData.user?.firstName,
      user_invitee_email: appData.user?.email,
      workspace_invitee: appData.currentWorkspace?.name,
      action_text: "View links",
    });
  } else {
    await sendEmail(user.email, "link-invitation-rejected", {
      action_url: process.env.REMIX_SERVER_URL + `/app/links/all`,
      name: user.firstName,
      email: appData.user?.email,
      workspace: appData.currentWorkspace?.name,
      action_text: "View links",
    });
  }

  return json({
    items: await getLinks(userInfo.currentWorkspaceId, LinkStatus.PENDING),
  });
};

export default function PendingLinksRoute() {
  const appData = useAppData();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation("translations");
  const transition = useTransition();
  const loading = transition.state === "loading";
  const submit = useSubmit();

  const errorModal = useRef<RefErrorModal>(null);
  const modalReject = useRef<RefConfirmModal>(null);
  const modalAccept = useRef<RefConfirmModal>(null);

  const [items] = useState(actionData?.items ?? data.items);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
  }, [actionData]);

  function reject(item: LinkWithWorkspaces) {
    const whoAmIName = whoAmI(item) === 0 ? t("models.provider.object") : t("models.client.object");
    if (modalReject.current) {
      modalReject.current.setValue(item);
      modalReject.current.show(
        t("app.links.invitation.confirmReject"),
        t("shared.reject"),
        t("shared.back"),
        t("app.links.invitation.rejectWarning", [whoAmIName, inviterWorkspace(item).name])
      );
    }
  }
  function accept(item: LinkWithWorkspaces) {
    const whoAmIName = whoAmI(item) === 0 ? t("models.provider.object") : t("models.client.object");
    if (modalAccept.current) {
      modalAccept.current.setValue(item);
      modalAccept.current.show(
        t("app.links.invitation.confirmAccept", [whoAmIName]),
        t("shared.accept"),
        t("shared.back"),
        t("app.links.invitation.acceptWarning", [inviterWorkspace(item).name])
      );
    }
  }
  function accepted(item: LinkWithWorkspaces) {
    item.status = 1;
    const form = new FormData();
    form.set("link-id", item.id);
    form.set("accepted", "true");
    submit(form, {
      method: "post",
    });
  }
  function rejected(item: LinkWithWorkspaces) {
    item.status = 2;
    const form = new FormData();
    form.set("link-id", item.id);
    form.set("accepted", "false");
    submit(form, {
      method: "post",
    });
  }
  function whoAmI(item: LinkWithWorkspaces) {
    const currentWorkspaceId = appData.currentWorkspace?.id ?? "";
    if (currentWorkspaceId === item.providerWorkspaceId) {
      return 0;
    }
    return 1;
  }
  function inviterWorkspace(item: LinkWithWorkspaces) {
    if (item.createdByWorkspaceId === item.providerWorkspaceId) {
      return item.providerWorkspace;
    }
    return item.clientWorkspace;
  }
  function dateAgo(value: Date) {
    return DateUtils.dateAgo(value);
  }

  return (
    <div className="max-w-lg mx-auto pb-12">
      {(() => {
        if (loading) {
          return <Loading />;
        } else {
          return (
            <div>
              {(() => {
                if (items.length === 0) {
                  return (
                    <div>
                      <EmptyState
                        className="bg-white"
                        captions={{
                          thereAreNo: t("app.links.pending.empty"),
                        }}
                      />
                    </div>
                  );
                } else {
                  return (
                    <ul role="list" className="sm:grid grid-cols-1 gap-3">
                      {items.map((item, idx) => {
                        return (
                          <li key={idx} className="col-span-1 bg-white rounded-sm shadow-md divide-y divide-gray-200 border-t sm:border border-gray-300">
                            <div className="w-full flex items-center justify-between p-6 space-x-6">
                              <div className="w-full space-y-2">
                                {item.createdByWorkspaceId !== appData.currentWorkspace?.id && item.createdByUser && (
                                  <div className="flex items-center justify-between space-x-3">
                                    <p className="text-sm font-normal text-gray-700 border-b pb-3 mb-2 w-full">
                                      {item.createdByUser.firstName} ({item.createdByUser.email}) {t("app.links.invitation.hasSentYou")}.
                                    </p>
                                  </div>
                                )}
                                <div className="flex items-center justify-between space-x-3">
                                  <h3 className="text-gray-900 text-sm font-medium truncate">
                                    {whoAmI(item) === 0 ? <span>{item.clientWorkspace.name}</span> : <span>{item.providerWorkspace.name}</span>}
                                  </h3>
                                  {(() => {
                                    if (whoAmI(item) !== 0) {
                                      return (
                                        <span className="flex-shrink-0 inline-block px-2 py-0.5 text-teal-800 text-sm font-medium bg-teal-100 rounded-sm border-teal-300">
                                          {t("models.provider.object")}
                                        </span>
                                      );
                                    } else {
                                      return (
                                        <span className="flex-shrink-0 inline-block px-2 py-0.5 text-purple-800 text-sm font-medium bg-purple-100 rounded-sm border-purple-300">
                                          {t("models.client.object")}
                                        </span>
                                      );
                                    }
                                  })()}
                                </div>
                                <div className="sm:flex sm:items-center sm:space-x-2 sm:justify-between text-gray-500 text-sm">
                                  <p className="truncate">
                                    {whoAmI(item) === 0 ? <span>{item.clientWorkspace.name}</span> : <span>{item.providerWorkspace.name}</span>}
                                  </p>
                                  {item.createdAt && <p className="font-light text-sm truncate">{dateAgo(item.createdAt)}</p>}
                                </div>
                              </div>
                            </div>
                            <div>
                              {(() => {
                                if (item.status === 0 && item.createdByWorkspaceId !== appData.currentWorkspace?.id) {
                                  return (
                                    <div className="-mt-px flex divide-x divide-gray-200">
                                      <div className="w-0 flex-1 flex">
                                        <button
                                          type="button"
                                          onClick={() => reject(item)}
                                          className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-theme-500 focus:outline-none"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                          <span className="ml-3">{t("shared.cancel")}</span>
                                        </button>
                                      </div>
                                      <div className="-ml-px w-0 flex-1 flex">
                                        <button
                                          type="button"
                                          onClick={() => accept(item)}
                                          className="relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-br-lg hover:text-theme-500 focus:outline-none"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                          </svg>

                                          {(() => {
                                            if (whoAmI(item) === 0) {
                                              return <span className="ml-3">{t("shared.accept")}</span>;
                                            } else {
                                              return <span className="ml-3">{t("shared.accept")}</span>;
                                            }
                                          })()}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div className="-mt-px flex divide-x divide-gray-200">
                                      <div className="w-full">
                                        {item.status === 0 && (
                                          <div className="bg-gray-100 w-full relative -mr-px flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-5 w-5 text-gray-400"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                              />
                                            </svg>
                                            <span className="ml-3">{t("app.links.pending.invitationSent")}</span>
                                          </div>
                                        )}
                                        {(() => {
                                          if (item.status === 2) {
                                            <div className="w-full relative -mr-px flex-1 inline-flex items-center justify-center py-4 text-sm bg-red-50 text-red-700 font-medium border border-transparent rounded-bl-lg">
                                              <span className="ml-3">{t("shared.rejected")}</span>
                                            </div>;
                                          } else if (item.status === 1) {
                                            return (
                                              <div className="w-full relative flex-1 inline-flex items-center justify-center py-4 text-sm bg-teal-50 text-teal-700 font-medium border border-transparent rounded-br-lg">
                                                <span className="ml-3">{t("shared.accepted")}</span>
                                              </div>
                                            );
                                          } else {
                                            return <div></div>;
                                          }
                                        })()}
                                      </div>
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  );
                }
              })()}
            </div>
          );
        }
      })()}
      <ConfirmModal ref={modalAccept} onYes={accepted} />
      <ConfirmModal ref={modalReject} onYes={rejected} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}
