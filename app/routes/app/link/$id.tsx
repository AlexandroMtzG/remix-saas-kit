import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import LinkProfile from "~/components/app/links/all/LinkProfile";
import { ActionFunction, json, LoaderFunction, MetaFunction, redirect, useActionData, useLoaderData } from "remix";
import { deleteLink, getLink, LinkWithWorkspaces, LinkWithWorkspacesAndContracts } from "~/utils/db/links.db.server";
import { i18n } from "~/locale/i18n.server";
import { useEffect, useRef } from "react";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";

export const meta: MetaFunction = () => ({
  title: "Link | Remix SaasFrontend",
});

type LoaderData = {
  item: LinkWithWorkspacesAndContracts | null;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  const item = await getLink(params.id);
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
  console.log({ form });
  const type = form.get("type")?.toString();
  if (type === "delete") {
    const existing = await getLink(params.id);
    if (!existing) {
      return badRequest({ error: t("shared.notFound") });
    }
    await deleteLink(params.id);
    return redirect("/app/links/all");
  }

  return badRequest({ error: "Form not submitted correctly." });
};

export default function EditLinkRoute() {
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
      <Breadcrumb menu={[{ title: t("models.link.plural"), routePath: "/app/links/all" }]} />
      {data.item && <LinkProfile item={data.item} />}
      <ErrorModal ref={errorModal} />
    </div>
  );
}
