import { useTranslation } from "react-i18next";
import { Transition } from "@headlessui/react";
import { Fragment, useRef, useState } from "react";
import clsx from "~/utils/shared/ClassesUtils";
import { useOuterClick } from "~/utils/shared/KeypressUtils";
import { useNavigate } from "react-router-dom";
import { Tenant, TenantUser } from "@prisma/client";
import { getMyTenants, getTenant, getTenantUser } from "~/utils/db/tenants.db.server";
import { ActionFunction, Form, useLoaderData, useLocation, useSubmit } from "remix";

interface Props {
  className?: string;
  onAdd?: () => void;
}

type LoaderData = {
  myTenants: Awaited<ReturnType<typeof getMyTenants>>;
  currentTenant?: Tenant;
};

export default function TenantSelector({ className, onAdd }: Props) {
  const data = useLoaderData<LoaderData>();
  const { t } = useTranslation("translations");
  const navigate = useNavigate();
  const submit = useSubmit();
  const location = useLocation();

  const inputSearch = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(false);
  const [search, setSearch] = useState("");

  function closeDropdownTenant() {
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
      if (data.myTenants?.length === 1) {
        changeTenant(data.myTenants[0]);
      }
    }
  }
  function changeTenant(tenantUser: any) {
    setSearch("");
    closeDropdownTenant();
    setLoading(true);

    const form = new FormData();
    form.set("type", "set-tenant");
    form.set("tenantId", tenantUser.tenant.id);
    form.set("redirectTo", location.pathname + location.search);
    submit(form, {
      method: "post",
      action: "/app",
    });
    // services.users
    //   .updateDefaultTenant(tenant.id)
    //   .then((response) => {
    //     UserUtils.logged(response, navigate);
    //     window.location.reload();
    //   })
    //   .finally(() => {
    //     setLoading(false);
    //   });
  }
  function addTenant() {
    closeDropdownTenant();
    if (onAdd) {
      onAdd();
    }
  }
  // function getPlanFromTenant(tenant: Tenant): string {
  //   if (tenant.products && tenant.products.length > 0 && tenant.products[0].subscriptionProduct) {
  //     return t(tenant.products[0].subscriptionProduct.title).toString();
  //   } else {
  //     if (tenant.subdomain === "admin") {
  //       return "Admin";
  //     } else {
  //       return t("settings.subscription.notSubscribed").toString();
  //     }
  //   }
  // }
  // const currentTenant = useSelector((state: RootState): TenantDto => {
  //   return state.tenant.current ?? ({ name: "Undefinded" } as TenantDto);
  // });
  // const myTenants = useSelector((state: RootState): TenantDto[] => {
  //   return state.tenant.tenants
  //     .filter((f) => !search || f.name.toLowerCase().includes(search.toLowerCase()))
  //     .sort((x, y) => {
  //       if (x.name && y.name) {
  //         return (x.name > y.name ? 1 : -1) ?? 1;
  //       }
  //       return 1;
  //     });
  // });

  const clickOutside = useOuterClick(() => setOpened(false));

  return (
    <div ref={clickOutside} className={clsx(className, "relative shadow-2xl")}>
      <span className="inline-block w-full rounded-sm shadow-sm">
        <button
          onClick={toggleDropDown}
          type="button"
          aria-haspopup="listbox"
          aria-expanded="true"
          aria-labelledby="listbox-label"
          className="bg-slate-800 hover:bg-theme-700 hover:text-theme-50 truncate text-slate-300 cursor-pointer w-full pl-3 py-2 text-left focus:outline-none transition ease-in-out duration-150 sm:leading-5 rounded-sm shadow-sm pr-7"
        >
          <span className="font-bold">{data.currentTenant?.name}</span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-5 w-5 text-slate-200" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
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
        <div
          className={clsx(
            "z-40 absolute object-top mt-1 w-full rounded-sm bg-white shadow-lg",
            opened ? "z-40 absolute object-top mt-1 w-full rounded-sm bg-white shadow-lg" : "hidden"
          )}
        >
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
              disabled={loading}
              id="search"
              ref={inputSearch}
              placeholder={t("shared.searchDot")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              onKeyUp={keyUp}
              className="focus:ring-theme-500 focus:border-theme-500 block w-full rounded-none rounded-l-sm pl-10 sm:text-sm px-3 py-2 bg-gray-100 text-sm focus:outline-none"
            />
          </div>
          <ul
            tabIndex={-1}
            role="listbox"
            aria-labelledby="listbox-label"
            className="max-h-60 rounded-sm text-sm leading-5 shadow-xs overflow-auto focus:outline-none sm:text-sm sm:leading-5"
          >
            {data.myTenants.map((tenantUser, index) => {
              return (
                <li key={index} role="option">
                  <button
                    type="button"
                    onClick={() => changeTenant(tenantUser)}
                    className="w-full text-left text-gray-900 cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 border-b border-gray-200 focus:outline-none"
                  >
                    <div>
                      <span className="font-medium">{tenantUser.tenant.name}</span>
                      {tenantUser.tenant.id === data.currentTenant?.id && (
                        <span className="text-slate-500 absolute inset-y-0 right-0 flex items-center pr-4 -mt-4">
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                      <p className="text-xs invisible">{/* {getPlanFromTenant(tenant)} */}</p>
                    </div>
                  </button>
                </li>
              );
            })}
            <button
              onClick={addTenant}
              role="option"
              className="w-full text-left font-bold text-slate-800 cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 focus:outline-none"
            >
              {t("settings.tenant.create")}
            </button>

            {/*More options... */}
          </ul>
        </div>
      </Transition>
    </div>
  );
}
