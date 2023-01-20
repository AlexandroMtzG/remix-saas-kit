import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { AppUsageType } from "~/application/enums/app/usages/AppUsageType";
import { TenantUserRole } from "~/application/enums/core/tenants/TenantUserRole";
import IconContractArchived from "~/assets/icons/IconContractArchived";
import IconContractCheck from "~/assets/icons/IconContractCheck";
import IconContractClock from "~/assets/icons/IconContractClock";
import IconSign from "~/assets/icons/IconSign";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import Loading from "~/components/ui/loaders/Loading";
import DateUtils from "~/utils/shared/DateUtils";
import { LinkWithWorkspaces, LinkWithWorkspacesAndContracts, LinkWithWorkspacesAndMembers } from "~/utils/db/links.db.server";
import { useAppData } from "~/utils/data/useAppData";
import { Workspace } from "@prisma/client";
import { useSubmit } from "remix";

interface Props {
  item: LinkWithWorkspacesAndContracts;
}

export default function LinkProfile({ item }: Props) {
  const appData = useAppData();
  const { t } = useTranslation("translations");
  const navigate = useNavigate();
  const submit = useSubmit();

  const confirmDelete = useRef<RefConfirmModal>(null);
  const successModalDeleted = useRef<RefSuccessModal>(null);
  const errorModal = useRef<RefErrorModal>(null);

  const [loading, setLoading] = useState(false);
  const [openOptions, setOpenOptions] = useState(false);

  const [workspace, setWorkspace] = useState<Workspace | undefined>();

  useEffect(() => {
    if (whoAmI(item) === 0) {
      setWorkspace(item.clientWorkspace);
    } else {
      setWorkspace(item.providerWorkspace);
    }
  }, [item]);

  // function reloadContracts() {
  //   services.contracts.getAllByLink(link.id).then((response) => {
  //     setContracts(response);
  //   });
  // }
  function deleteLink() {
    closeOptions();
    confirmDelete.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }
  function confirmedDelete() {
    const form = new FormData();
    form.set("type", "delete");
    submit(form, {
      method: "post",
    });
  }
  function successModalDeletedClosed() {
    if (item.providerWorkspaceId === appData.currentWorkspace?.id) {
      navigate("/app/links/clients");
    } else {
      navigate("/app/links/providers");
    }
  }
  function closeOptions() {
    setOpenOptions(false);
  }
  function toggleOptions() {
    setOpenOptions(!openOptions);
  }
  function dateMonthDayYear(value: Date | undefined) {
    return DateUtils.dateMonthDayYear(value);
  }
  function dateDM(value: Date | undefined) {
    return DateUtils.dateDM(value);
  }
  function whoAmI(item: LinkWithWorkspaces) {
    const currentWorkspaceId = appData.currentWorkspace?.id ?? "";
    if (currentWorkspaceId === item.providerWorkspaceId) {
      return 0;
    }
    return 1;
  }

  return (
    <div>
      <div className="pt-2 space-y-2 mx-auto px-4 sm:px-6 lg:px-8">
        {(() => {
          if (loading) {
            return <Loading />;
          } else if (workspace?.id) {
            return (
              <div>
                <div className="relative min-h-screen">
                  <main className="py-4">
                    <div className="max-w-5xl mx-auto md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl">
                      <div className="flex items-center space-x-5 truncate">
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="48" height="48" viewBox="0 0 172 172" className="h-16 w-16">
                              <g
                                fill="none"
                                fillRule="nonzero"
                                stroke="none"
                                strokeWidth="1"
                                strokeLinecap="butt"
                                strokeLinejoin="miter"
                                strokeMiterlimit="10"
                                strokeDashoffset="0"
                                fontFamily="none"
                                fontWeight="none"
                                fontSize="none"
                                textAnchor="none"
                              >
                                <path d="M0,172v-172h172v172z" fill="none" />
                                <g fill="currentColor">
                                  <path
                                    d="M150.5,150.5h-129v-114.66667c0,-7.88333 6.45,-14.33333 14.33333,-14.33333h100.33333c7.88333,0 14.33333,6.45 14.33333,14.33333z"
                                    fill="#a3bffa"
                                  />
                                  <path d="M21.5,150.5h129v7.16667h-129z" fill="#667eea" />
                                  <path
                                    d="M111.08333,96.75h21.5v17.91667h-21.5zM75.25,96.75h21.5v17.91667h-21.5zM39.41667,96.75h21.5v17.91667h-21.5zM111.08333,125.41667h21.5v17.91667h-21.5zM39.41667,125.41667h21.5v17.91667h-21.5zM111.08333,68.08333h21.5v17.91667h-21.5zM75.25,68.08333h21.5v17.91667h-21.5zM39.41667,68.08333h21.5v17.91667h-21.5zM111.08333,39.41667h21.5v17.91667h-21.5zM75.25,39.41667h21.5v17.91667h-21.5zM39.41667,39.41667h21.5v17.91667h-21.5zM75.25,125.41667h21.5v32.25h-21.5z"
                                    fill="#5a67d8"
                                  />
                                </g>
                              </g>
                            </svg>
                          </div>
                        </div>
                        <div className="truncate">
                          <div className="flex items-center space-x-2">
                            <h1 className="text-2xl font-bold text-gray-900">{workspace.name}</h1>
                          </div>
                          {item.createdByUser && (
                            <p className="text-sm font-medium text-gray-500 truncate">
                              <span>
                                {t("shared.added")} {t("shared.by")} <span className="text-gray-900">{item.createdByUser.email} </span>
                              </span>
                              <span>
                                {t("shared.in")} {<time>{dateMonthDayYear(workspace.createdAt)}</time>}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-6 flex justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-reverse sm:space-y-0 sm:space-x-3 md:mt-0 md:flex-row md:space-x-3 justify-end">
                        {/*Options */}
                        <span className="relative inline-flex justify-end rounded-md">
                          <Link
                            to={"/app/contract/new?l=" + item.id}
                            className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-r-0 border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-theme-500 focus:border-theme-500 truncate"
                          >
                            <IconSign className="-ml-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                            {t("app.contracts.new.title")}
                          </Link>
                          <span className="-ml-px relative block">
                            <button
                              onClick={toggleOptions}
                              type="button"
                              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-theme-500 focus:border-theme-500"
                              id="option-menu-button"
                              aria-expanded="true"
                              aria-haspopup="true"
                            >
                              <span className="sr-only">{t("app.shared.buttons.openOptions")}</span>
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path
                                  fillRule="evenodd"
                                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>

                            <Transition
                              as={Fragment}
                              show={openOptions}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <div
                                className="origin-top-right absolute right-0 mt-2 -mr-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby="option-menu-button"
                                tabIndex={-1}
                              >
                                <div className="py-1" role="none">
                                  {/*Active: "bg-gray-100 text-gray-900", Not Active: "text-gray-700" */}

                                  <Link
                                    to="."
                                    className="w-full text-left text-gray-700 block px-4 py-2 text-sm hover:bg-gray-50 focus:outline-none"
                                    role="menuitem"
                                    tabIndex={-1}
                                    id="option-menu-item-0"
                                  >
                                    <div>{t("shared.reload")}</div>
                                  </Link>

                                  {appData.isOwnerOrAdmin && (
                                    <button
                                      type="button"
                                      onClick={deleteLink}
                                      className="w-full text-left text-gray-700 block px-4 py-2 text-sm hover:bg-gray-50 focus:outline-none"
                                      role="menuitem"
                                      tabIndex={-1}
                                      id="option-menu-item-2"
                                    >
                                      {t("shared.delete")}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </Transition>
                          </span>
                        </span>
                        {/*Options: End */}
                      </div>
                    </div>

                    <div className="mt-8 max-w-3xl mx-auto grid grid-cols-1 gap-3 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3 xl:gap-6">
                      <div className="space-y-6 lg:col-start-1 lg:col-span-2">
                        {/*Description list*/}
                        <section aria-labelledby="applicant-information-title">
                          <div className="bg-white shadow sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                              <h2 id="applicant-information-title" className="text-lg leading-6 font-medium text-gray-900">
                                {t("app.links.profile.company")}
                              </h2>
                              <p className="mt-1 max-w-2xl text-sm text-gray-500">{t("app.links.profile.general")}</p>
                            </div>
                            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3">
                                <div className="sm:col-span-3">
                                  <dt className="text-sm font-medium text-gray-500">{t("models.workspace.name")}</dt>
                                  <dd className="mt-1 text-sm text-gray-900">{workspace.name}</dd>
                                </div>

                                <div className="sm:col-span-2">
                                  <dt className="text-sm font-medium text-gray-500">{t("app.workspaces.typesDescription.PUBLIC")}</dt>
                                  <dd className="mt-1 text-sm text-gray-900">
                                    {(() => {
                                      if (workspace.type === 1) {
                                        return (
                                          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                                            {t("shared.yes")}
                                          </span>
                                        );
                                      } else {
                                        return (
                                          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                            {t("shared.no")}
                                          </span>
                                        );
                                      }
                                    })()}
                                  </dd>
                                </div>

                                <div className="sm:col-span-3">
                                  <dt className="text-sm font-medium text-gray-500">{t("models.workspace.businessMainActivity")}</dt>
                                  <dd className="mt-1 text-sm text-gray-900">{workspace.businessMainActivity}</dd>
                                </div>
                              </dl>
                            </div>
                          </div>
                        </section>
                      </div>

                      <section aria-labelledby="timeline-title" className="lg:col-start-3 lg:col-span-1">
                        <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
                          <h2 id="timeline-title" className="text-lg font-medium text-gray-900">
                            {t("app.shared.activity.title")}
                          </h2>

                          {/*Activity Feed */}
                          <div className="mt-6 flow-root">
                            <ul role="list" className="-mb-8">
                              <li>
                                <div className="relative pb-8">
                                  {item.contracts.length > 0 && (
                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                  )}
                                  <div className="relative flex space-x-3">
                                    <div>
                                      <span className="h-8 w-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center ring-8 ring-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                          />
                                        </svg>
                                      </span>
                                    </div>
                                    <div className="min-w-0 flex-1 flex justify-between space-x-2">
                                      <div>
                                        {item.createdByUser && (
                                          <p className="text-sm text-gray-500">
                                            {t("shared.added")} {t("shared.by")}{" "}
                                            <span className="text-gray-900">
                                              {item.createdByUser.firstName} {item.createdByUser.lastName}
                                            </span>
                                          </p>
                                        )}
                                      </div>
                                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                        <time>{dateDM(workspace.createdAt)}</time>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </li>
                              {item.contracts.map((contract, idx) => {
                                return (
                                  <li key={idx}>
                                    <div className="relative pb-8">
                                      {idx < item.contracts.length - 1 && (
                                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                      )}
                                      <div className="relative flex space-x-3">
                                        <div className="flex-shrink-0">
                                          {contract.status === 0 && <IconContractClock className="h-8 w-8 text-yellow-500" />}
                                          {contract.status === 1 && <IconContractCheck className="h-8 w-8 text-teal-500" />}
                                          {contract.status === 2 && <IconContractArchived className="h-8 w-8 text-gray-500" />}
                                        </div>
                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-2">
                                          <div className="truncate">
                                            <p className="text-sm text-gray-500">
                                              <Link to={"/app/contract/" + contract.id} className="font-medium text-gray-600 underline hover:text-gray-700">
                                                {contract.name}
                                              </Link>
                                            </p>
                                          </div>
                                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                            {contract.createdAt && <time>{dateDM(contract.createdAt)}</time>}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      </section>
                    </div>
                  </main>
                </div>
              </div>
            );
          } else {
            return <div></div>;
          }
        })()}
      </div>
      <SuccessModal ref={successModalDeleted} onClosed={successModalDeletedClosed} />
      <ConfirmModal ref={confirmDelete} onYes={confirmedDelete} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}
