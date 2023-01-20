import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import ContractDetails from "~/components/app/contracts/ContractDetails";
import { ActionFunction, json, LoaderFunction, MetaFunction, redirect, useActionData, useLoaderData } from "remix";
import { ContractWithDetails, deleteContract, getContract, updateContract } from "~/utils/db/contracts.db.server";
import { i18n } from "~/locale/i18n.server";
import { getUserInfo } from "~/utils/session.server";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { useRef, useEffect } from "react";
import { loadAppData } from "~/utils/data/useAppData";
import { sendEmail } from "~/utils/email.server";
import { sendContract } from "~/utils/app/ContractUtils";

export const meta: MetaFunction = () => ({
  title: "Contract | Remix SaasFrontend",
});

type LoaderData = {
  item: ContractWithDetails | null;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  const item = await getContract(params.id);
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
  const userInfo = await getUserInfo(request);
  
  if (!params.id) {
    return badRequest({ error: t("shared.notFound") });
  }
  const form = await request.formData();

  const type = form.get("type")?.toString();
  const name = form.get("name")?.toString();
  const description = form.get("description")?.toString();
  const file = form.get("file")?.toString();
  const status = Number(form.get("status"));

  if (type === "edit") {
    if (!name) {
      return badRequest({ error: "Name required" });
    } else if (!description) {
      return badRequest({ error: "Description required" });
    } else if (!file) {
      return badRequest({ error: "File required" });
    }
    await updateContract(params.id, userInfo.userId, {
      name,
      description,
      file,
      status,
    });

    return json({ success: t("shared.updated") });
  } else if (type === "delete") {
    const existing = await getContract(params.id);
    if (!existing) {
      return badRequest({ error: t("shared.notFound") });
    }
    await deleteContract(params.id);

    return redirect("/app/contracts?status=all");
  } else if (type === "send") {
    const contract = await getContract(params.id);
    if (!contract) {
      return badRequest({ error: t("shared.notFound") });
    }

    sendContract(request, contract)

    return json({success: "Contract sent"});
  }

  return badRequest({ error: t("shared.invalidForm") });
};

export default function ContractRoute() {
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
      <Breadcrumb
        menu={[
          {
            title: t("app.contracts.title"),
            routePath: "/app/contracts?status=pending",
          },
        ]}
      ></Breadcrumb>
      <div className="pt-2 space-y-2 mx-auto px-4 sm:px-6 lg:px-8">
        {data.item ? <ContractDetails item={data.item} /> : <div>{t("shared.notFound")}</div>}
        <ErrorModal ref={errorModal} />
      </div>
    </div>
  );
}
