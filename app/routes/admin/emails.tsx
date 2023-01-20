import { EmailTemplateDto } from "~/application/dtos/core/email/EmailTemplateDto";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import clsx from "~/utils/shared/ClassesUtils";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActionFunction, Form, json, LoaderFunction, MetaFunction, redirect, useActionData, useCatch, useLoaderData, useSubmit, useTransition } from "remix";
import { createPostmarkTemplate, getPostmarkTemplates, sendEmail } from "~/utils/email.server";
import emailTemplates from "~/application/emails/emailTemplates.server";
import { useAppData } from "~/utils/data/useAppData";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import { i18n } from "~/locale/i18n.server";
import Loading from "~/components/ui/loaders/Loading";

export const meta: MetaFunction = () => ({
  title: "Emails | Remix SaasFrontend",
});

type LoaderData = {
  onPostmark: boolean;
  items: EmailTemplateDto[];
};

export let loader: LoaderFunction = async ({ request }) => {
  const items = await getPostmarkTemplates();
  if (items.length > 0) {
    return json({
      onPostmark: true,
      items,
    });
  }

  const data: LoaderData = {
    onPostmark: false,
    items: await emailTemplates(),
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
  onPostmark?: boolean;
  items?: EmailTemplateDto[];
};
const success = (data: ActionData) => json(data, { status: 200 });
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  let t = await i18n.getFixedT(request, "translations");

  const form = await request.formData();
  const type = form.get("type")?.toString();
  if (type === "create-postmark-emails") {
    const items = await getPostmarkTemplates();
    if (items.length > 0) {
      return redirect("/admin/emails");
    }
    try {
      const templates = await emailTemplates();
      const template = templates.find((f) => f.type === "layout");
      if (template) {
        await createPostmarkTemplate(template);
      }
      templates
        .filter((f) => f.type === "standard")
        .forEach(async (item) => {
          await createPostmarkTemplate(item, template?.alias);
        });

      return success({
        onPostmark: true,
        items: await getPostmarkTemplates(),
      });
    } catch (e: any) {
      return badRequest({ error: e?.toString() });
    }
  } else if (type === "send-test") {
    const email = form.get("email")?.toString();
    const alias = form.get("alias")?.toString();
    if (!email) {
      return badRequest({ error: "Invalid email" });
    }
    if (!alias) {
      return badRequest({ error: "Invalid template" });
    }
    await sendEmail(email, alias, {});
    return success({
      success: "Test email sent",
    });
  }
  return badRequest({
    error: t("shared.invalidForm"),
  });
};

export default function EmailsRoute() {
  const appData = useAppData();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation("translations");
  const submit = useSubmit();
  const transition = useTransition();
  const loading = transition.state === "submitting" || transition.state === "loading";

  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);

  const [items] = useState<EmailTemplateDto[]>(actionData?.items ?? data.items);
  const headers = [
    {
      title: t("admin.emails.created"),
    },
    // {
    //   title: t("admin.emails.name"),
    // },
    {
      title: t("admin.emails.alias"),
    },
    {
      title: t("admin.emails.subject"),
    },
    {
      title: t("shared.actions"),
    },
  ];

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
    if (actionData?.success) {
      successModal.current?.show(t("shared.success"), actionData.success);
    }
  }, [actionData]);

  function templateUrl(item: EmailTemplateDto) {
    return `https://account.postmarkapp.com/servers/${item.associatedServerId}/templates/${item.templateId}/edit`;
  }

  function createPostmarkEmails() {
    const form = new FormData();
    form.set("type", "create-postmark-emails");
    submit(form, {
      method: "post",
    });
  }
  function sendTest(item: EmailTemplateDto): void {
    const email = window.prompt("Email", appData.user?.email);
    if (!email || email.trim() === "") {
      return;
    }
    const form = new FormData();
    form.set("type", "send-test");
    form.set("alias", item.alias);
    form.set("email", email);
    submit(form, {
      method: "post",
    });
  }

  return (
    <div>
      <div className="bg-white shadow-sm border-b border-gray-300 w-full py-2">
        <div className="mx-auto max-w-5xl xl:max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 space-x-2">
          <h1 className="flex-1 font-bold flex items-center truncate">{t("admin.emails.title")}</h1>
          <Form method="post" className="flex items-center space-x-2">
            <ButtonSecondary to="." disabled={loading}>
              {t("shared.reload")}
            </ButtonSecondary>
            <ButtonSecondary type="button" onClick={createPostmarkEmails} disabled={loading || data.onPostmark}>
              {t("admin.emails.createAll")}
            </ButtonSecondary>
          </Form>
        </div>
      </div>
      <div className="pt-2 space-y-2 mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl xl:max-w-7xl">
        <div className="flex flex-col">
          {(() => {
            if (loading) {
              return <Loading />;
            } else if (items.length === 0) {
              return (
                <EmptyState
                  className="bg-white"
                  captions={{
                    thereAreNo: t("admin.emails.noEmails"),
                    description: t("admin.emails.noEmailsDescription"),
                  }}
                />
              );
            } else {
              return (
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
                                  className="text-xs px-1.5 py-2 max-w-xs text-left font-medium text-gray-500 tracking-wider select-none truncate"
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
                          {items.map((item, idx) => {
                            return (
                              <tr key={idx}>
                                <td className="px-1.5 py-2 max-w-xs truncate whitespace-nowrap text-sm text-gray-600">
                                  <div className="flex justify-center">
                                    {(() => {
                                      if (data.onPostmark) {
                                        return (
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-theme-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                              fillRule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        );
                                      } else {
                                        return (
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                              fillRule="evenodd"
                                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        );
                                      }
                                    })()}
                                  </div>
                                </td>
                                {/* <td className="px-1.5 py-2 max-w-xs truncate whitespace-nowrap text-sm text-gray-600">{item.name}</td> */}
                                <td className="px-1.5 py-2 max-w-xs truncate whitespace-nowrap text-sm text-gray-600">{item.alias}</td>
                                <td className="px-1.5 py-2 max-w-xs truncate whitespace-nowrap text-sm text-gray-600">{item.subject}</td>
                                <td className="px-1.5 py-2 max-w-xs truncate whitespace-nowrap text-sm text-gray-600">
                                  {data.onPostmark && (
                                    <div className="flex items-center space-x-2">
                                      <a
                                        href={templateUrl(item)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={clsx("text-theme-600 hover:text-theme-800 hover:underline")}
                                      >
                                        {t("shared.edit")}
                                      </a>
                                      <button
                                        disabled={item.alias.includes("layout")}
                                        type="button"
                                        onClick={() => sendTest(item)}
                                        className={clsx(
                                          item.alias.includes("layout") ? "text-gray-300" : "text-theme-600 hover:text-theme-800 hover:underline"
                                        )}
                                      >
                                        {t("admin.emails.sendTest")}
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            }
          })()}
        </div>
      </div>
      <SuccessModal ref={successModal} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <div>Server Error: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();
  return <div>Client Error: {caught.status}</div>;
}
