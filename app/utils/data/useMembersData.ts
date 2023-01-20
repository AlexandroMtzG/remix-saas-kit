import { useMatches } from "remix";
import { getWorkspaces } from "../workspaces.api";

export type MembersLoaderData = {
  users: Awaited<ReturnType<typeof getWorkspaces>>;
};

export function useMembersData(): MembersLoaderData {
  return (useMatches().find((f) => f.pathname === "/app/settings/members")?.data ?? {}) as MembersLoaderData;
}
