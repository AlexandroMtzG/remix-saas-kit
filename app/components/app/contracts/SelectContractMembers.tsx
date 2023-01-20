import { useTranslation } from "react-i18next";
import { Transition } from "@headlessui/react";
import { forwardRef, Fragment, Ref, useImperativeHandle, useRef, useState } from "react";
import { AddContractMemberDto } from "~/application/contracts/app/contracts/AddContractMemberDto";
import { ContractMemberRole } from "~/application/enums/app/contracts/ContractMemberRole";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import { useEscapeKeypress } from "~/utils/shared/KeypressUtils";
import clsx from "~/utils/shared/ClassesUtils";
import IconSign from "~/assets/icons/IconSign";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import { Link, User, Workspace, WorkspaceUser } from "@prisma/client";
import { LinkWithWorkspacesAndMembers } from "~/utils/db/links.db.server";

export interface RefSelectContractMembers {
  show: (link: LinkWithWorkspacesAndMembers, selected: string[]) => void;
}

interface Props {
  maxSize?: string;
  onClosed?: () => void;
  onSelected: (users: AddContractMemberDto[]) => void;
}

const SelectContractMembers = ({ onSelected, onClosed, maxSize = "sm:max-w-lg" }: Props, ref: Ref<RefSelectContractMembers>) => {
  const { t } = useTranslation("translations");

  const errorModal = useRef<RefErrorModal>(null);

  const [showing, setShowing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [items, setItems] = useState<(WorkspaceUser & { workspace: Workspace; user: User })[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useImperativeHandle(ref, () => ({ show }));
  function show(link: LinkWithWorkspacesAndMembers, selected: string[]) {
    setSelected(selected);
    setShowing(true);

    const members: (WorkspaceUser & { workspace: Workspace; user: User })[] = [];
    [...link.providerWorkspace.users, ...link.clientWorkspace.users].forEach((user) => {
      if (!members.find((f) => f.userId === user.userId)) {
        members.push(user);
      }
    });

    setItems(members);
    // reload(_linkId);
  }
  // function reload(linkId) {
  //   setLoading(true);
  //   services.links
  //     .getLinkUsers(linkId)
  //     .then((response) => {
  //       setItems(response);
  //     })
  //     .catch((error) => {
  //       errorModal.current?.show(t("shared.error"), t(error));
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // }
  function close() {
    if (onClosed) {
      onClosed();
    }
    setShowing(false);
  }
  function toggle(item: WorkspaceUser) {
    if (isSelected(item)) {
      setSelected(selected.filter((f) => f !== item.userId));
    } else {
      setSelected((selected) => [...selected, item.userId]);
    }
  }
  function isSelected(item: WorkspaceUser) {
    return selected.find((f) => f === item.userId);
  }
  function accept() {
    const selected: AddContractMemberDto[] = [];
    items.forEach((element) => {
      if (isSelected(element)) {
        const contractMember: AddContractMemberDto = {
          userId: element.userId,
          role: ContractMemberRole.SIGNATORY,
          name: (element.user?.firstName + " " + element.user?.lastName).trim(),
          email: element.user?.email ?? "",
        };
        selected.push(contractMember);
      }
    });
    if (onSelected) {
      onSelected(selected);
    }
    close();
  }
  function getNoMembers() {
    return t("app.tenants.members.noMembers");
  }
  const filteredItems = () => {
    if (!items) {
      return [];
    }
    return items.filter(
      (f) =>
        f.id?.toUpperCase().includes(searchInput.toUpperCase()) ||
        f.workspace?.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.user?.firstName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.user?.lastName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.user?.email?.toString().toUpperCase().includes(searchInput.toUpperCase())
    );
  };

  useEscapeKeypress(close);
  return (
    <div>
      {showing && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition
              as={Fragment}
              show={showing}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-800 opacity-75"></div>
              </div>
            </Transition>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>
            <Transition
              as={Fragment}
              show={showing}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div
                className={clsx(
                  "inline-block align-bottom bg-white rounded-sm px-4 pt-5 pb-4 text-left overflow-visible shadow-xl transform transition-all my-8 sm:align-middle w-full sm:p-6",
                  maxSize
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <div className="just absolute top-0 right-0 -mt-4 pr-4">
                  <button
                    onClick={close}
                    type="button"
                    className="p-1 bg-white hover:bg-gray-200 border border-gray-200 rounded-full text-gray-600 justify-center flex items-center hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">{t("shared.close")}</span>
                    <svg
                      className="h-5 w-5 text-gray-700"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-3">
                  <div className="max-w-lg mx-auto">
                    <div>
                      <div className="text-center">
                        <IconSign className="mx-auto h-12 w-12 text-gray-800" />
                        <h2 className="mt-2 text-lg font-medium text-gray-900">{t("app.contracts.members.add")}</h2>
                        <p className="mt-1 text-sm text-gray-500">{t("app.contracts.members.select")}</p>
                      </div>
                      <form action="#" className="mt-6 flex">
                        <label htmlFor="search" className="sr-only">
                          {t("shared.search")}
                        </label>
                        <input
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          type="text"
                          name="search"
                          id="search"
                          className="shadow-sm focus:ring-theme-500 focus:border-theme-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder={t("shared.searchDot")}
                        />
                      </form>
                    </div>
                    <div className="mt-5">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("models.user.plural")}</h3>

                      {(() => {
                        if (items.length === 0) {
                          return (
                            <div>
                              <EmptyState
                                className="bg-white"
                                to="/app/settings/members/new"
                                captions={{
                                  new: t("shared.add"),
                                  thereAreNo: getNoMembers(),
                                }}
                                icon="plus"
                              />
                            </div>
                          );
                        } else {
                          return (
                            <div>
                              <ul role="list" className="mt-4 border-t border-b border-gray-200 divide-y divide-gray-200">
                                {filteredItems().map((item, idx) => {
                                  return (
                                    <li className="py-2 flex items-center justify-between space-x-3" key={idx}>
                                      {item.user && (
                                        <div className="min-w-0 flex-1 flex items-center space-x-3">
                                          <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-gray-900 truncate">
                                              {item.user.firstName} {item.user.lastName} <span className="text-xs font-normal">({item.user.email})</span>
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">{item.workspace && <span>{item.workspace.name}</span>}</p>
                                          </div>
                                        </div>
                                      )}
                                      {item.user && (
                                        <div className="flex-shrink-0">
                                          <button
                                            onClick={() => toggle(item)}
                                            type="button"
                                            className={clsx(
                                              "inline-flex items-center py-2 px-3 border border-transparent rounded-full focus:outline-none",
                                              !isSelected(item) && "text-gray-800 bg-gray-100 hover:bg-teal-200",
                                              isSelected(item) && "text-teal-800 bg-teal-100 hover:bg-red-200 "
                                            )}
                                          >
                                            {/*Heroicon name: solid/plus-sm */}

                                            {(() => {
                                              if (!isSelected(item)) {
                                                return (
                                                  <svg
                                                    className="-ml-1 mr-0.5 h-5 w-5"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    aria-hidden="true"
                                                  >
                                                    <path
                                                      fillRule="evenodd"
                                                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                                      clipRule="evenodd"
                                                    />
                                                  </svg>
                                                );
                                              } else {
                                                return (
                                                  <svg
                                                    className="-ml-1 mr-0.5 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                  >
                                                    <path
                                                      fillRule="evenodd"
                                                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                      clipRule="evenodd"
                                                    />
                                                  </svg>
                                                );
                                              }
                                            })()}

                                            {(() => {
                                              if (!isSelected(item)) {
                                                return (
                                                  <span className="text-sm font-medium text-gray-900">
                                                    {t("shared.add")}
                                                    <span className="sr-only">
                                                      {item.user.firstName} {item.user.lastName}
                                                    </span>
                                                  </span>
                                                );
                                              } else {
                                                return (
                                                  <span className="text-sm font-medium text-gray-900">
                                                    {t("shared.remove")}
                                                    <span className="sr-only">
                                                      {item.user.firstName} {item.user.lastName}
                                                    </span>
                                                  </span>
                                                );
                                              }
                                            })()}
                                          </button>
                                        </div>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                              <div className="py-3 text-right flex justify-end">
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={close}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
                                  >
                                    {t("shared.cancel")}
                                  </button>
                                  <button
                                    onClick={accept}
                                    type="submit"
                                    disabled={selected.length === 0}
                                    className={clsx(
                                      "inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500",
                                      selected.length === 0 && " opacity-50 cursor-not-allowed"
                                    )}
                                  >
                                    {t("shared.accept")}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
          <ErrorModal ref={errorModal} />
        </div>
      )}
    </div>
  );
};

export default forwardRef(SelectContractMembers);
