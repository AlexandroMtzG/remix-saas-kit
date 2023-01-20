import { Link } from "react-router-dom";
import { Transition } from "@headlessui/react";
import { Fragment, ReactNode, useRef, useState } from "react";
import TenantSelector from "./selectors/TenantSelector";
import WorkspaceSelector from "./selectors/WorkspaceSelector";
import SidebarMenu from "./SidebarMenu";
import LayoutSelector from "../ui/selectors/LayoutSelector";
import LocaleSelector from "../ui/selectors/LocaleSelector";
import ChatSupportButton from "./buttons/ChatSupportButton";
import PendingInvitationsButton from "./buttons/PendingInvitationsButton";
import ProfileButton from "./buttons/ProfileButton";
import QuickActionsButton from "./buttons/QuickActionsButton";
import LogoLight from "~/assets/img/logo-light.png";
import IconLight from "~/assets/img/icon-light.png";
import CurrentSubscriptionButton from "./buttons/CurrentSubscriptionButton";
import { useAppData } from "~/utils/data/useAppData";

interface Props {
  layout: "app" | "admin";
  children: ReactNode;
  onAddTenant?: () => void;
}

export default function SidebarLayout({ layout, onAddTenant, children }: Props) {
  const appData = useAppData();
  const mainElement = useRef<HTMLElement>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100 text-gray-800">
      {/*Mobile sidebar */}

      <div className="md:hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 flex z-40">
            <Transition
              as={Fragment}
              show={sidebarOpen}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0">
                <div className="absolute inset-0 bg-gray-800 opacity-75" />
              </div>
            </Transition>

            <Transition
              as={Fragment}
              show={sidebarOpen}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="relative flex-1 flex flex-col max-w-xs w-full pb-4 bg-gray-900">
                <div className="absolute top-0 right-0 -mr-14 p-1 mt-2">
                  <button
                    className="flex items-center justify-center h-12 w-12 rounded-sm focus:outline-none focus:bg-gray-600"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    <svg className="text-white h-7 w-7" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-5 flex-1 h-0 overflow-y-auto">
                  <nav className="px-2 space-y-2">
                    {layout === "app" && (
                      <>
                        <TenantSelector className="text-sm" onAdd={onAddTenant} />
                        <WorkspaceSelector className="text-sm" />
                      </>
                    )}
                    <SidebarMenu layout={layout} onSelected={() => setSidebarOpen(!sidebarOpen)} />
                  </nav>
                </div>
              </div>
            </Transition>
            <div className="flex-shrink-0 w-14">{/*Dummy element to force sidebar to shrink to fit close icon */}</div>
          </div>
        )}
      </div>

      {/*Desktop sidebar */}
      <div
        className={
          sidebarOpen
            ? "hidden transition ease-in duration-1000"
            : "overflow-x-hidden hidden md:flex md:flex-shrink-0 border-r dark:border-r-0 border-theme-200 dark:border-theme-800 shadow-sm dark:shadow-lg"
        }
      >
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 shadow-md bg-theme-600">
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-3 bg-gray-900 select-none">
                {layout === "app" && (
                  <>
                    <TenantSelector className="text-xs sm:text-sm" onAdd={onAddTenant} />
                    <WorkspaceSelector className="text-xs sm:text-sm" onAdd={() => setSidebarOpen(false)} onSelected={() => setSidebarOpen(false)} />
                  </>
                )}
                <SidebarMenu layout={layout} />
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/*Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative flex-shrink-0 flex h-14 bg-white shadow-inner border-b border-gray-200">
          <button
            className="px-4 border-r border-gray-200 text-gray-600 focus:outline-none focus:bg-gray-100 focus:text-gray-600"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg className="h-5 w-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>

          <div className="flex-1 px-3 flex justify-between">
            <div className="flex-1 flex items-center flex-shrink-0">
              <div className="w-full flex md:ml-0">
                <div className="align-baseline w-full text-slate-200 pl-1">
                  <nav className="lg:hidden">
                    <Link to="/app/dashboard">
                      <img alt="Logo" className="h-7 w-auto sm:hidden" src={IconLight} />
                      <img alt="Logo" className="h-7 w-auto hidden sm:block" src={LogoLight} />
                    </Link>
                  </nav>
                  <nav className="hidden lg:flex items-center text-base leading-5 font-medium">
                    <Link to="/app/dashboard">
                      <img alt="Logo" className="hidden sm:block h-7 sm:h-8 w-auto" src={LogoLight} />
                    </Link>
                  </nav>
                </div>
              </div>
            </div>
            <div className="flex items-center md:ml-6 space-x-2">
              {/* {layout === "admin" && <LayoutSelector className="text-sm" />} */}
              {/* {layout === "admin" && <LocaleSelector className="text-sm" />} */}
              {layout === "app" && <CurrentSubscriptionButton />}
              {layout === "app" && appData.isOwnerOrAdmin && <PendingInvitationsButton />}
              {layout === "app" && <ChatSupportButton />}
              {layout === "app" && <QuickActionsButton />}
              <ProfileButton />
            </div>
          </div>
        </div>

        <main ref={mainElement} className="flex-1 focus:outline-none overflow-y-auto bg-gray-50" tabIndex={0}>
          <div key={appData.currentWorkspace?.id ?? ""} className="pb-20 sm:pb-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
