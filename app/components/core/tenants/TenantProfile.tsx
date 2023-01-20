import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Loading from "~/components/ui/loaders/Loading";
import { useEffect, useRef, useState } from "react";
import ConfirmModal from "~/components/ui/modals/ConfirmModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { TenantDto } from "~/application/dtos/core/tenants/TenantDto";
import DateUtils from "~/utils/shared/DateUtils";

interface Props {
  id?: string;
}

export default function TenantProfile({ id = "" }: Props) {
  const { t } = useTranslation("translations");
  const navigate = useNavigate();

  // const confirmDelete = useRef<RefConfirmModal>(null);
  const successModalDeleted = useRef<RefSuccessModal>(null);
  const errorModal = useRef<RefErrorModal>(null);

  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<TenantDto>({} as TenantDto);

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function reload() {
    setLoading(true);
    services.tenants
      .get(id)
      .then((response) => {
        setItem(response);
      })
      .finally(() => {
        setLoading(false);
      });
  }
  function confirmedDelete() {
    setLoading(true);
    services.tenants
      .adminDelete(id)
      .then(() => {
        successModalDeleted.current?.show(t("shared.deleted"), t("app.tenants.actions.deleted"));
      })
      .catch((error) => {
        errorModal.current?.show(t("shared.error"), t(error));
      })
      .finally(() => {
        setLoading(false);
      });
  }
  function successModalDeletedClosed() {
    navigate("/admin/tenants");
  }
  function dateMonthDayYear(value: Date | undefined) {
    return DateUtils.dateMonthDayYear(value);
  }

  return (
    <div>
      <div className="pt-2 space-y-2 mx-auto px-4 sm:px-6 lg:px-8">
        {(() => {
          if (loading) {
            return <Loading />;
          } else {
            return (
              <div>
                <div className="relative min-h-screen">
                  <main className="py-4">
                    <div className="max-w-5xl mx-auto md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl">
                      <div className="flex items-center space-x-5 truncate">
                        <div className="flex-shrink-0">
                          <div className="relative text-black">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              x="0px"
                              y="0px"
                              width="48"
                              height="48"
                              viewBox="0 0 172 172"
                              className="h-16 w-16"
                              fill="currentColor"
                            >
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
                            <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
                          </div>
                          <p className="text-sm font-medium text-gray-500 truncate">
                            {t("shared.createdBy")}
                            {item.createdByUser && (
                              <span>
                                {t("shared.by")}
                                <span className="text-gray-900">{item?.createdByUser?.email}</span>
                              </span>
                            )}
                            {t("shared.in")}
                            {item.createdAt && <time>{dateMonthDayYear(item.createdAt)}</time>}
                          </p>
                        </div>
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
                                  <dd className="mt-1 text-sm text-gray-900">{item.name}</dd>
                                </div>

                                <div className="sm:col-span-1">
                                  <dt className="text-sm font-medium text-gray-500">{t("models.workspace.plural")}</dt>
                                  <dd className="mt-1 text-sm text-gray-900">{item.workspaces && <span>{item.workspaces.length}</span>}</dd>
                                </div>
                                <div className="sm:col-span-2">
                                  <dt className="text-sm font-medium text-gray-500">{t("models.user.plural")}</dt>
                                  <dd className="mt-1 text-sm text-gray-900">{item.users && <span>{item.users.length}</span>}</dd>
                                </div>
                              </dl>
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  </main>
                </div>
              </div>
            );
          }
        })()}
      </div>
      <SuccessModal ref={successModalDeleted} onClosed={successModalDeletedClosed} />
      <ConfirmModal onYes={confirmedDelete} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}
