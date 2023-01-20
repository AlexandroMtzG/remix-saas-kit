import { useTranslation } from "react-i18next";
import { Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { WorkspaceDto } from "~/application/dtos/core/workspaces/WorkspaceDto";
import { useNavigate } from "react-router-dom";
import { useOuterClick } from "~/utils/shared/KeypressUtils";
import { getMyWorkspaces, getWorkspace } from "~/utils/db/workspaces.db.server";
import { useLoaderData, useLocation, useSubmit } from "remix";
import { Workspace, WorkspaceUser } from "@prisma/client";

interface Props {
  className?: string;
  onAdd?: () => void;
  onSelected?: () => void;
}

type LoaderData = {
  myWorkspaces: Awaited<ReturnType<typeof getMyWorkspaces>>;
  currentWorkspace?: Awaited<ReturnType<typeof getWorkspace>>;
};

export default function WorkspaceSelector({ className, onAdd, onSelected }: Props) {
  const data = useLoaderData<LoaderData>();
  const { t } = useTranslation("translations");
  const navigate = useNavigate();
  const submit = useSubmit();
  const location = useLocation();

  const inputSearch = useRef<HTMLInputElement>(null);

  const [opened, setOpened] = useState(false);
  const [search, setSearch] = useState("");

  // useEffect(() => {
  //   if (!currentWorkspace && workspaces && workspaces.length > 0) {
  //     const defaultWorkspace = workspaces.find((f) => f.default);
  //     if (defaultWorkspace) {
  //       change(defaultWorkspace);
  //     } else {
  //       change(workspaces[0]);
  //     }
  //   }
  //   if (!workspaces) {
  //     services.workspaces.getAllWorkspaces(true);
  //   }
  // }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function addWorkspace() {
    if (onAdd) {
      onAdd();
    }
    closeDropdown();
    navigate("/app/settings/workspaces/new");
  }
  function closeDropdown() {
    setOpened(false);
  }
  function toggleDropDown() {
    setOpened(!opened);
    if (opened) {
      // nextTick(() => {
      inputSearch.current?.focus();
      inputSearch.current?.select();
      // });
    }
  }
  function keyUp(event: any) {
    if (event.keyCode == 13) {
      if (sortedItems().length === 1) {
        change(sortedItems()[0]);
      }
    }
  }
  function change(workspace: WorkspaceUser & { workspace: Workspace }) {
    setSearch("");
    if (onSelected) {
      onSelected();
    }
    closeDropdown();
    const form = new FormData();
    form.set("type", "set-workspace");
    form.set("workspaceId", workspace.workspaceId);
    form.set("redirectTo", location.pathname + location.search);
    submit(form, {
      method: "post",
      action: "/app",
    });
  }
  const sortedItems = () => {
    return (
      data.myWorkspaces
        ?.filter((f) => !search || f.workspace.name.toLowerCase().includes(search.toLowerCase()))
        .sort((x, y) => {
          if (x.workspace.name && y.workspace.name) {
            return (x.workspace.name > y.workspace.name ? 1 : -1) ?? 1;
          }
          return 1;
        }) ?? []
    );
  };

  const clickOutside = useOuterClick(() => setOpened(false));

  return (
    <div className={className} ref={clickOutside}>
      <div className="relative text-left w-auto">
        <span className="inline-block w-full rounded-sm shadow-sm">
          <button
            className="bg-slate-800 hover:bg-theme-600 hover:text-theme-50 truncate text-slate-300 cursor-pointer w-full pl-3 py-2 text-left focus:outline-none transition ease-in-out duration-150 sm:leading-5 rounded-sm shadow-sm"
            onClick={toggleDropDown}
          >
            <div className="font-bold truncate pr-7 sm:hidden">
              {(() => {
                if (data.currentWorkspace) {
                  return <span className="truncate">{data.currentWorkspace.name}</span>;
                } else {
                  return <span className="text-gray-600">- {t("app.workspaces.select")} -</span>;
                }
              })()}
            </div>
            <div className="font-bold truncate pr-7 hidden sm:block sm:w-full">
              {(() => {
                if (data.currentWorkspace) {
                  return <span className="mt-4 truncate">{data.currentWorkspace.name}</span>;
                } else {
                  return <span className="mt-4 text-gray-600">- {t("app.workspaces.select")} -</span>;
                }
              })()}
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
        </span>

        {/*Select popover, show/hide based on select state. */}
        <Transition
          as={Fragment}
          show={opened}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <div className="z-40 absolute object-top mt-1 w-full rounded-sm bg-white shadow-lg">
            <div className="m-1 border border-gray-100 relative flex items-stretch flex-grow focus-within:z-10">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {/*Heroicon name: solid/users */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                id="search"
                ref={inputSearch}
                placeholder={t("shared.searchDot")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="none"
                onKeyUp={keyUp}
                className="focus:ring-theme-500 focus:border-theme-500 block w-full rounded-none rounded-l-sm pl-10 sm:text-sm px-3 py-2 bg-gray-100 text-sm focus:outline-none"
              />
            </div>
            <div className="max-h-60 rounded-sm text-sm leading-5 shadow-xs overflow-auto focus:outline-none sm:text-sm sm:leading-5">
              {sortedItems().map((userWorkspace, index) => {
                return (
                  <button
                    key={index}
                    role="option"
                    title={userWorkspace.workspace.name}
                    className="text-left w-full text-gray-900 cursor-pointer select-none relative py-2 pl-3 pr-5 hover:bg-gray-100 border-gray-100 font-medium truncate focus:outline-none"
                    onClick={() => change(userWorkspace)}
                  >
                    {userWorkspace.workspace.name}
                  </button>
                );
              })}
              <button
                onClick={addWorkspace}
                role="option"
                className="text-theme-600 w-full text-sm text-left font-bold cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 hover:text-theme-700"
              >
                {t("shared.add")}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
}
