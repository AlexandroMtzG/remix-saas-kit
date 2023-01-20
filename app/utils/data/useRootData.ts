import { json, useMatches } from "remix";
import { getUserInfo } from "../session.server";
import { i18n } from "~/locale/i18n.server";

export type AppRootData = {
  locale: string;
  lightOrDarkMode: string;
};

export function useRootData(): AppRootData {
  return (useMatches().find((f) => f.pathname === "/" || f.pathname === "")?.data ?? {}) as AppRootData;
}

export async function loadRootData(request: Request) {
  let locale = await i18n.getLocale(request);
  const userInfo = await getUserInfo(request);
  const data: AppRootData = {
    lightOrDarkMode: userInfo?.lightOrDarkMode ?? "dark",
    locale,
  };
  return json(data);
}
