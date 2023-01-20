import { Link, useLocation, useNavigate } from "react-router-dom";

import clsx from "clsx";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export interface TabItem {
  name: any;
  routePath?: string;
}

interface Props {
  className?: string;
  tabs: TabItem[];
  asLinks?: boolean;
  onSelected?: (idx: number) => void;
}

export default function Tabs({ className = "", tabs = [], asLinks = true, onSelected }: Props) {
  const { t } = useTranslation("translations");

  const navigate = useNavigate();
  const location = useLocation();

  const [selected, setSelected] = useState(0);

  function selectTab(idx: number) {
    const tab = tabs[idx];
    if (asLinks) {
      if (tab?.routePath) {
        navigate(tab.routePath);
      }
    } else {
      setSelected(idx);
      if (onSelected) {
        onSelected(idx);
      }
    }
  }
  function isCurrent(idx: number) {
    return currentTab() === tabs[idx];
  }
  const currentTab = () => {
    if (asLinks) {
      return tabs.find((element) => element.routePath && location.pathname + location.search === element.routePath);
    } else {
      return tabs[selected];
    }
  };
  return (
    <div className={className}>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          {t("app.shared.tabs.select")}
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full focus:ring-theme-500 focus:border-theme-500 border-gray-300 rounded-sm"
          onChange={(e) => selectTab(Number(e.target.value))}
          value={selected}
        >
          {tabs.map((tab, idx) => {
            return (
              <option key={tab.name} value={Number(idx)}>
                {tab.name}
              </option>
            );
          })}
        </select>
      </div>
      <div className="hidden sm:block">
        {(() => {
          if (asLinks) {
            return (
              <nav className="flex space-x-4" aria-label="Tabs">
                {tabs
                  .filter((f) => f.routePath)
                  .map((tab, idx) => {
                    return (
                      <Link
                        key={tab.name}
                        to={tab.routePath ?? ""}
                        className={clsx(
                          "truncate border",
                          isCurrent(idx) ? "bg-theme-100 text-theme-700 border border-theme-200" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
                          "px-3 py-2 font-medium text-sm rounded-sm border-transparent"
                        )}
                        aria-current={isCurrent(idx) ? "page" : undefined}
                      >
                        {tab.name}
                      </Link>
                    );
                  })}
              </nav>
            );
          } else {
            return (
              <nav className="flex space-x-4" aria-label="Tabs">
                {tabs.map((tab, idx) => {
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => selectTab(idx)}
                      className={clsx(
                        "truncate border",
                        isCurrent(idx) ? "bg-theme-100 text-theme-700 border border-theme-200" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
                        "px-3 py-2 font-medium text-sm rounded-sm border-transparent"
                      )}
                    >
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            );
          }
        })()}
      </div>
    </div>
  );
}
