import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import Loading from "~/components/ui/loaders/Loading";
import DateUtils from "~/utils/shared/DateUtils";
import { useRef, useState, useEffect, FormEvent } from "react";
import clsx from "~/utils/shared/ClassesUtils";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import { useSubmit } from "remix";
import { EmployeeWithCreatedByUser } from "~/utils/db/app/employees.db.server";

interface Props {
  item: EmployeeWithCreatedByUser;
}

export default function EmployeeProfile({ item }: Props) {
  const { t } = useTranslation("translations");
  const navigate = useNavigate();
  const submit = useSubmit();

  const firstNameInput = useRef<HTMLInputElement>(null);
  const confirmSave = useRef<RefConfirmModal>(null);
  const confirmDeleteEmployee = useRef<RefConfirmModal>(null);
  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);
  const successModalDeleted = useRef<RefSuccessModal>(null);

  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadProfile(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadProfile(item: EmployeeWithCreatedByUser) {
    setFirstName(item?.firstName ?? "");
    setLastName(item?.lastName ?? "");
    setEmail(item?.email ?? "");
  }

  function edit() {
    setEditing(true);
    firstNameInput.current?.focus();
    firstNameInput.current?.select();
  }

  function save(e: FormEvent) {
    e.preventDefault();
    if (thereAreNoChanges()) {
      errorModal.current?.show(t("shared.error"), t("shared.noChanges"));
    } else {
      confirmSave.current?.show(t("shared.saveChanges"), t("shared.yes"), t("shared.cancel"));
    }
  }
  function deleteEmployee() {
    confirmDeleteEmployee.current?.show(t("shared.confirmDelete"), t("shared.yes"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }
  function successModalDeletedClosed() {
    navigate("/app/employees");
  }
  function confirmedDeleteEmployee() {
    const form = new FormData();
    form.set("type", "delete");
    submit(form, {
      method: "post",
    });
    setEditing(false);
  }
  function saveConfirm() {
    const form = new FormData();
    form.set("type", "edit");
    form.set("employee-id", item.id);
    form.set("email", email);
    form.set("first-name", firstName);
    form.set("last-name", lastName);
    submit(form, {
      method: "post",
    });
  }
  function cancel() {
    loadProfile(item);
    setEditing(false);
  }
  function dateMonthDayYear(value: Date | undefined) {
    return DateUtils.dateMonthDayYear(value);
  }
  const thereAreNoChanges = () => {
    if (item) {
      return firstName === item.firstName && lastName === item.lastName && email === item.email;
    }
    return true;
  };

  return (
    <div>
      <div className="pt-2 space-y-2 mx-auto px-4 sm:px-6 lg:px-8">
        {(() => {
          if (loading) {
            return <Loading />;
          } else if (item && item.id) {
            return (
              <div>
                <div className="relative min-h-screen">
                  <main className="py-4">
                    <div className="max-w-5xl mx-auto md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl">
                      <div className="flex items-center space-x-5 truncate">
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <span className="inline-block h-16 w-16 rounded-full overflow-hidden bg-gray-100">
                              <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            </span>
                          </div>
                        </div>
                        <div className="truncate">
                          <div className="flex items-center space-x-2">
                            <h1 className="text-2xl font-bold text-gray-900">{item.firstName}</h1>
                          </div>
                          {item.createdByUser && (
                            <p className="text-sm font-medium text-gray-500 truncate">
                              {t("shared.added")} {t("shared.by")}{" "}
                              <span className="text-gray-900">
                                {item.createdByUser.firstName} {item.createdByUser.lastName}
                              </span>
                              {item.createdAt && (
                                <span>
                                  {" "}
                                  {t("shared.in")} <time>{dateMonthDayYear(item.createdAt)}</time>
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-reverse sm:space-y-0 sm:space-x-3 md:mt-0 md:flex-row md:space-x-3">
                        <ButtonSecondary onClick={edit}>{t("shared.edit")}</ButtonSecondary>
                      </div>
                    </div>

                    <div className="mt-8 max-w-3xl mx-auto lg:max-w-7xl">
                      <div>
                        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
                          <div className="lg:col-span-1">
                            <div className="px-4 sm:px-0">
                              <h3 className="text-lg font-medium leading-6 text-gray-900">{t("app.employees.profile.title")}</h3>
                              <p className="mt-1 text-sm text-gray-600">{t("app.employees.profile.general")}</p>
                            </div>
                          </div>
                          <div className="mt-5 lg:mt-0 lg:col-span-2">
                            <form onSubmit={save} method="POST">
                              <div className="shadow overflow-hidden sm:rounded-md">
                                <div className="px-4 py-5 bg-white sm:p-6">
                                  <div className="grid grid-cols-6 gap-6">
                                    <div className="col-span-6 lg:col-span-3">
                                      <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                                        {t("models.employee.firstName")}
                                      </label>
                                      <input
                                        type="text"
                                        ref={firstNameInput}
                                        name="first-name"
                                        id="first-name"
                                        autoComplete="first-name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        disabled={!editing}
                                        className={clsx(
                                          "mt-1 focus:ring-theme-500 focus:border-theme-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md",
                                          !editing && "bg-gray-100"
                                        )}
                                      />
                                    </div>

                                    <div className="col-span-6 lg:col-span-3">
                                      <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                                        {t("models.employee.lastName")}
                                      </label>
                                      <input
                                        type="text"
                                        name="last-name"
                                        id="last-name"
                                        autoComplete="last-name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        disabled={!editing}
                                        className={clsx(
                                          "mt-1 focus:ring-theme-500 focus:border-theme-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md",
                                          !editing && "bg-gray-100"
                                        )}
                                      />
                                    </div>

                                    <div className="col-span-6">
                                      <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                                        {t("models.employee.email")}
                                      </label>
                                      <input
                                        type="email"
                                        name="email-address"
                                        id="email-address"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={!editing}
                                        className={clsx(
                                          "mt-1 focus:ring-theme-500 focus:border-theme-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md",
                                          !editing && "bg-gray-100"
                                        )}
                                      />
                                    </div>
                                  </div>
                                </div>
                                {editing && (
                                  <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-between">
                                    <div>
                                      <button
                                        type="button"
                                        onClick={deleteEmployee}
                                        disabled={!editing}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
                                      >
                                        {t("shared.delete")}
                                      </button>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <button
                                        type="button"
                                        onClick={cancel}
                                        disabled={!editing}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
                                      >
                                        {t("shared.cancel")}
                                      </button>
                                      <button
                                        type="submit"
                                        disabled={!editing || thereAreNoChanges()}
                                        className={clsx(
                                          "inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500",
                                          !editing || (thereAreNoChanges() && " opacity-50 cursor-not-allowed")
                                        )}
                                      >
                                        {t("shared.save")}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
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
      <SuccessModal ref={successModal} />
      <SuccessModal ref={successModalDeleted} onClosed={successModalDeletedClosed} />
      <ErrorModal ref={errorModal} />
      <ConfirmModal ref={confirmSave} onYes={saveConfirm} />
      <ConfirmModal ref={confirmDeleteEmployee} onYes={confirmedDeleteEmployee} />
    </div>
  );
}
