import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SelectEmployees, { RefSelectEmployees } from "~/components/app/employees/SelectEmployees";
import SelectContractMembers, { RefSelectContractMembers } from "~/components/app/contracts/SelectContractMembers";
import LinkSelector, { RefLinkSelector } from "~/components/app/links/selectors/LinkSelector";
import { AddContractMemberDto } from "~/application/contracts/app/contracts/AddContractMemberDto";
import { ContractMemberRole } from "~/application/enums/app/contracts/ContractMemberRole";
import { FileBase64 } from "~/application/dtos/shared/FileBase64";
import clsx from "~/utils/shared/ClassesUtils";
import IconWorkers from "~/assets/icons/IconWorkers";
import IconSign from "~/assets/icons/IconSign";
import UploadDocument from "~/components/ui/uploaders/UploadDocument";
import IconContract from "~/assets/icons/IconContract";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import Loading from "~/components/ui/loaders/Loading";
import { updateItem } from "~/utils/shared/ObjectUtils";
import PdfPreview from "~/components/ui/pdf/PdfViewer";
import { loadAppData, useAppData } from "~/utils/data/useAppData";
import { ActionFunction, Form, json, LoaderFunction, MetaFunction, redirect, useActionData, useLoaderData, useSubmit, useTransition } from "remix";
import { getLink, getLinksWithMembers, LinkWithWorkspacesAndMembers } from "~/utils/db/links.db.server";
import { i18n } from "~/locale/i18n.server";
import { getUserInfo } from "~/utils/session.server";
import { Employee } from "@prisma/client";
import { createContract, getContract, getMonthlyContractsCount } from "~/utils/db/contracts.db.server";
import { getEmployees } from "~/utils/db/app/employees.db.server";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import { ContractStatus } from "~/application/enums/app/contracts/ContractStatus";
import { sendEmail } from "~/utils/email.server";
import { sendContract } from "~/utils/app/ContractUtils";

export const meta: MetaFunction = () => ({
  title: "New contract | Remix SaasFrontend",
});

type LoaderData = {
  links: LinkWithWorkspacesAndMembers[];
  preselectLink: LinkWithWorkspacesAndMembers | undefined;
  employees: Employee[];
  monthlyContractsCount: number;
};
export let loader: LoaderFunction = async ({ request, params }) => {
  const userInfo = await getUserInfo(request);

  const url = new URL(request.url);
  const preselectLinkIdQueryParam = url.searchParams.get("l");
  let preselectLink: LinkWithWorkspacesAndMembers | undefined;
  const links = await getLinksWithMembers(userInfo.currentWorkspaceId);
  if (preselectLinkIdQueryParam) {
    preselectLink = links.find((f) => f.id === preselectLinkIdQueryParam);
  }
  const data: LoaderData = {
    links,
    preselectLink,
    employees: await getEmployees(userInfo.currentWorkspaceId),
    monthlyContractsCount: await getMonthlyContractsCount(userInfo.currentTenantId),
  };
  return json(data);
};

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  let t = await i18n.getFixedT(request, "translations");

  const userInfo = await getUserInfo(request);

  const form = await request.formData();
  const linkId = form.get("link-id")?.toString();
  const name = form.get("name")?.toString();
  const description = form.get("description")?.toString();
  const file = form.get("contract-file")?.toString();
  const employees = form.getAll("employees[]").map((f: FormDataEntryValue) => {
    return JSON.parse(f.toString()) as Employee;
  });
  const members = form.getAll("members[]").map((f: FormDataEntryValue) => {
    return JSON.parse(f.toString()) as AddContractMemberDto;
  });

  if (!name) {
    return badRequest({ error: t("app.contracts.errors.nameRequired") });
  } else if (!description) {
    return badRequest({ error: t("app.contracts.errors.descriptionRequired") });
  } else if (!file) {
    return badRequest({ error: t("app.contracts.errors.fileRequired") });
  } else if (!linkId) {
    return badRequest({ error: t("app.contracts.errors.linkRequired") });
  } else if (!members || members.filter((f) => f.role === ContractMemberRole.SIGNATORY).length < 2) {
    return badRequest({ error: t("app.contracts.errors.atLeastNSignatories") });
  }

  const link = await getLink(linkId);
  if (!link) {
    return badRequest({ error: "Invalid link" });
  }

  const createdContract = await createContract(
    {
      createdByUserId: userInfo.userId,
      linkId: linkId,
      name,
      description,
      file,
      status: ContractStatus.PENDING,
    },
    members,
    employees
  );

  if (!createdContract) {
    return badRequest({ error: "Could not create contract" });
  }
  const contract = await getContract(createdContract.id);

  if (contract) {
    await sendContract(request, contract)
  }

  return redirect("/app/contract/" + createdContract.id);
};

export default function NewContractRoute() {
  const appData = useAppData();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation("translations");
  const submit = useSubmit();
  const transition = useTransition();
  const loading = transition.state === "loading" || transition.state === "submitting";

  const inputName = useRef<HTMLInputElement>(null);
  const errorModal = useRef<RefErrorModal>(null);
  const selectEmployees = useRef<RefSelectEmployees>(null);
  const selectContractMembers = useRef<RefSelectContractMembers>(null);
  const linkSelector = useRef<RefLinkSelector>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState<LinkWithWorkspacesAndMembers | null>(null);
  const [linkId, setLinkId] = useState("");
  const [contractFile, setContractFile] = useState("");
  const [members, setMembers] = useState<AddContractMemberDto[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (data.preselectLink) {
      linkSelector.current?.select(data.preselectLink);
    }
  }, []);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
  }, [actionData]);

  function addMember() {
    if (!link || !link.id) {
      errorModal.current?.show(t("shared.missingFields"), t("app.contracts.errors.linkRequired"));
    } else {
      selectContractMembers.current?.show(
        link,
        members.map((f) => f.userId)
      );
    }
  }
  function addEmployee() {
    selectEmployees.current?.show(employees.map((f) => f.id));
  }
  function removeFile() {
    setContractFile("");
  }
  function removeMember(index: number) {
    setMembers(members.filter((_x, i) => i !== index));
  }
  function removeEmployee(index: number) {
    setEmployees(employees.filter((_x, i) => i !== index));
  }
  function save() {
    const form = new FormData();
    form.set("link-id", link?.id ?? "");
    form.set("name", name);
    form.set("description", description);
    form.set("contract-file", contractFile);
    members.forEach((item) => {
      form.append("members[]", JSON.stringify(item));
    });
    employees.forEach((item) => {
      form.append("employees[]", JSON.stringify(item));
    });
    submit(form, {
      method: "post",
    });
  }
  // function confirmedSave() {
  //   setLoading(true);
  //   services.contracts
  //     .create({
  //       linkId,
  //       // clientWorkspaceId: clientWorkspaceId,
  //       name,
  //       description,
  //       file: contractFile,
  //       members,
  //       employees,
  //     })
  //     .then((response: ContractDto) => {
  //       navigate("/app/contract/" + response.id);
  //     })
  //     .catch((error) => {
  //       errorModal.current?.show(t("shared.error"), t(error));
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // }
  function droppedContractFile(files: FileBase64[]) {
    if (files.length > 0) {
      const mb = files[0].file.size / 1048576;
      if (mb >= 20) {
        errorModal.current?.show(t("shared.error"), t("app.contracts.errors.maxFileReached"));
      } else {
        setContractFile(files[0].base64);
      }
    }
  }
  function selectedLink(id: string, _link: LinkWithWorkspacesAndMembers) {
    setLinkId(id);
    setLink(_link);
    // nextTick(() => {
    inputName.current?.focus();
    inputName.current?.select();
    // });
  }
  function selectedEmployees(items: Employee[]) {
    setEmployees(items);
  }
  function selectedContractMembers(items: AddContractMemberDto[]) {
    setMembers(items);
  }
  const imProvider = () => {
    return appData.currentWorkspace?.id === link?.providerWorkspaceId;
  };
  const monthlyContracts = appData.mySubscription?.subscriptionProduct.monthlyContracts ?? 0;
  const maxContractsReached = () => {
    if (!appData.mySubscription) {
      return true;
    } else {
      return monthlyContracts > 0 && data.monthlyContractsCount >= monthlyContracts;
    }
  };

  return (
    <div>
      <Breadcrumb
        menu={[
          {
            title: t("app.contracts.title"),
            routePath: "/app/contracts?status=pending",
          },
          {
            title: t("app.contracts.new.title"),
            routePath: "/app/contract/new",
          },
        ]}
      />
      <div className="lg:py-8 max-w-2xl mx-auto">
        <div>
          {(() => {
            if (maxContractsReached()) {
              return (
                <div>
                  <WarningBanner
                    redirect="/app/settings/subscription"
                    title={t("app.subscription.errors.limitReached")}
                    text={t("app.subscription.errors.limitReachedContracts", [monthlyContracts])}
                  />
                </div>
              );
            } else {
              return (
                <Form method="post">
                  <div className="sm:space-y-4 divide-y divide-gray-200">
                    <div className="bg-white py-6 px-8 shadow-lg border border-gray-200 space-y-6">
                      <div className="flex items-center space-x-3 justify-between">
                        <div>
                          <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{t("app.contracts.new.title")}</h3>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{t("app.contracts.new.description")}</p>
                        </div>
                        <IconContract className="h-8 w-8 text-gray-800" />
                      </div>

                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-6">
                          <label htmlFor="link" className="block text-xs font-medium text-gray-700 truncate">
                            {t("models.link.object")}
                          </label>
                          <LinkSelector ref={linkSelector} className="mt-1 w-full" onSelected={selectedLink} items={data.links} />
                        </div>

                        <div className="sm:col-span-6">
                          <label htmlFor="name" className="block text-xs font-medium text-gray-700 truncate">
                            {t("shared.name")}
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm w-full">
                            <input
                              id="name"
                              name="name"
                              ref={inputName}
                              type="text"
                              autoComplete="off"
                              required
                              value={name}
                              onChange={(e) => setName(e.currentTarget.value)}
                              placeholder={t("app.contracts.placeholders.name")}
                              className="w-full flex-1 focus:ring-theme-500 focus:border-theme-500 block min-w-0 rounded-md sm:text-sm border-gray-300"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-6">
                          <label htmlFor="description" className="block text-xs font-medium text-gray-700 truncate">
                            {t("shared.description")}
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm w-full">
                            <textarea
                              id="description"
                              name="description"
                              rows={3}
                              autoComplete="off"
                              required
                              value={description}
                              onChange={(e) => setDescription(e.currentTarget.value)}
                              placeholder={t("app.contracts.placeholders.description")}
                              className="w-full flex-1 focus:ring-theme-500 focus:border-theme-500 block min-w-0 rounded-md sm:text-sm border-gray-300"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-6">
                          <label className="block text-xs font-medium text-gray-700 truncate">{t("shared.file")}</label>
                          <div className="mt-1">
                            {(() => {
                              if (contractFile) {
                                return <PdfPreview file={contractFile} editing={true} onRemoveFile={removeFile} />;
                              } else {
                                return (
                                  <UploadDocument
                                    accept=".pdf"
                                    description={t("shared.onlyFileTypes", [".PDF"])}
                                    onDroppedFiles={droppedContractFile}
                                    icon={<IconContract className="mx-auto h-10 w-10 text-gray-400" />}
                                  />
                                );
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white py-6 px-8 shadow-lg border border-gray-200">
                      <div className="flex items-center space-x-3 justify-between">
                        <div>
                          <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{t("app.contracts.signatories")}</h3>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{t("app.contracts.new.addSignatories")}.</p>
                        </div>
                        <IconSign className="h-8 w-8 text-gray-800" />
                      </div>
                      <div>
                        {members.map((member, idxMember) => {
                          return (
                            <div key={idxMember} className="grid grid-cols-6 items-center space-x-2 relative py-3 gap-1">
                              <button
                                type="button"
                                disabled={members.length <= 1}
                                className={clsx(
                                  "absolute origin-top-right right-0 top-0 mt-1 mr-0 inline-flex items-center px-1.5 py-1.5 border-gray-300 text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-theme-500",
                                  members.length <= 1 && "text-gray-400 cursor-not-allowed",
                                  members.length > 1 && "text-gray-700 hover:bg-gray-50"
                                )}
                                onClick={() => removeMember(idxMember)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                              <div className="col-span-6 sm:col-span-2">
                                <label htmlFor="full-name" className="block text-xs font-medium text-gray-700 truncate">
                                  {t("account.shared.fullName")}
                                </label>
                                <div className="mt-1">
                                  <input
                                    id="full-name"
                                    // :ref="'fullName-' + idxMember"
                                    value={member.name}
                                    required
                                    type="text"
                                    name="full-name"
                                    placeholder={t("account.shared.name")}
                                    disabled
                                    autoComplete="full-name"
                                    className="bg-gray-100 cursor-not-allowed shadow-sm focus:ring-theme-500 focus:border-theme-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  />
                                </div>
                              </div>

                              <div className="col-span-3 sm:col-span-2">
                                <div className="flex items-start space-x-2">
                                  <div className="flex-grow">
                                    <label htmlFor="email" className="block text-xs font-medium text-gray-700 truncate">
                                      {t("account.shared.email")}
                                    </label>
                                    <div className="mt-1">
                                      <input
                                        id="email"
                                        value={member.email}
                                        name="email"
                                        type="email"
                                        disabled
                                        placeholder={
                                          member.role === 0 ? t("app.contracts.placeholders.signatoryEmail") : t("app.contracts.placeholders.spectatorEmail")
                                        }
                                        autoComplete="email"
                                        required
                                        className="bg-gray-100 cursor-not-allowed shadow-sm focus:ring-theme-500 focus:border-theme-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="col-span-3 sm:col-span-2">
                                <div className="flex items-start space-x-2">
                                  <div className="flex-grow">
                                    <label htmlFor="role" className="block text-xs font-medium text-gray-700 truncate">
                                      {t("shared.role")}
                                    </label>
                                    <div className="mt-1">
                                      <select
                                        id="role"
                                        value={member.role}
                                        onChange={(e) => {
                                          updateItem(
                                            members,
                                            setMembers,
                                            member.userId,
                                            {
                                              role: Number(e.target.value),
                                            },
                                            "userId"
                                          );
                                          // const index = members.findIndex((x) => x.userId === member.userId);
                                          // const updated = members[index];
                                          // updated.role = Number(e.target.value);
                                          // setMembers([...members.slice(0, index), updated, ...members.slice(index + 1)]);
                                        }}
                                        autoComplete="email"
                                        className="shadow-sm focus:ring-theme-500 focus:border-theme-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                      >
                                        <option value={0}>{t("app.contracts.signatory")}</option>
                                        <option value={1}>{t("app.contracts.spectator")}</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <button type="button" onClick={addMember} className="mt-6 flex items-center space-x-1 text-xs text-theme-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="uppercase font-medium">{t("app.contracts.actions.selectSignatoryOrSpectator")}</span>
                        </button>
                      </div>
                    </div>

                    {imProvider() && (
                      <div className="bg-white py-6 px-8 shadow-lg border border-gray-200">
                        <div className="flex items-center space-x-3 justify-between">
                          <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{t("models.employee.plural")}</h3>
                            <p className="mt-1 text-sm text-gray-500">{t("app.employees.actions.select")}.</p>
                          </div>
                          <IconWorkers className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <div>
                            {employees.map((employee, idxEmployee) => {
                              return (
                                <div key={idxEmployee} className="relative mt-1 grid grid-cols-6 items-center space-x-2 py-3 gap-1">
                                  <button
                                    type="button"
                                    className="text-gray-700 hover:bg-gray-50 absolute origin-top-right right-0 top-0 mr-0 inline-flex items-center px-1.5 py-1.5 border-gray-300 text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-theme-500"
                                    onClick={() => removeEmployee(idxEmployee)}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                  <div className="col-span-6 sm:col-span-2">
                                    <label htmlFor="full-name" className="block text-xs font-medium text-gray-700 truncate">
                                      {t("models.employee.fullName")}
                                    </label>
                                    <div className="mt-1">
                                      <input
                                        id="employee-first-name-"
                                        // :ref="'employee-first-name-' + idxEmployee"
                                        value={employee.firstName}
                                        type="text"
                                        name="employee-first-name-"
                                        placeholder={t("models.employee.object") + " " + (idxEmployee + 1)}
                                        autoComplete="off"
                                        required
                                        disabled
                                        className="bg-gray-100 cursor-not-allowed text-gray-800 shadow-sm focus:ring-theme-500 focus:border-theme-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-span-3 sm:col-span-2">
                                    <label htmlFor="full-name" className="block text-xs font-medium text-gray-700 truncate">
                                      {t("models.employee.lastName")}
                                    </label>
                                    <div className="mt-1">
                                      <input
                                        id="employee-last-name"
                                        value={employee.lastName}
                                        type="text"
                                        name="employee-last-name"
                                        autoComplete="off"
                                        required
                                        disabled
                                        className="bg-gray-100 cursor-not-allowed text-gray-800 shadow-sm focus:ring-theme-500 focus:border-theme-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-span-3 sm:col-span-2">
                                    <label htmlFor="email" className="block text-xs font-medium text-gray-700 truncate">
                                      {t("models.employee.email")}
                                    </label>
                                    <div className="mt-1">
                                      <input
                                        id="email"
                                        value={employee.email}
                                        type="text"
                                        name="email"
                                        autoComplete="off"
                                        required
                                        disabled
                                        className="bg-gray-100 cursor-not-allowed text-gray-800 shadow-sm focus:ring-theme-500 focus:border-theme-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            <div className="flex items-center space-x-3">
                              <button type="button" onClick={addEmployee} className="mt-6 flex items-center space-x-1 text-xs text-theme-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span className="uppercase font-medium">{t("app.employees.actions.selectEmployees")}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="py-5">
                    <div className="flex justify-end py-3 px-4 lg:px-0 lg:py-0">
                      <LoadingButton
                        type="button"
                        disabled={loading}
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
                        onClick={save}
                      >
                        {t("app.contracts.new.save")}
                      </LoadingButton>
                    </div>
                  </div>
                </Form>
              );
            }
          })()}
        </div>
      </div>
      <SelectEmployees ref={selectEmployees} items={data.employees} onSelected={selectedEmployees} />
      <SelectContractMembers ref={selectContractMembers} onSelected={selectedContractMembers} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}
