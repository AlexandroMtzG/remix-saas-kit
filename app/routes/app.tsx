import { ActionFunction, json, LoaderFunction, MetaFunction, Outlet, useCatch } from "remix";
import AppLayout from "~/components/app/AppLayout";
import { useAppAction } from "~/utils/actions/useAppAction";
import { loadAppData } from "~/utils/data/useAppData";
import { requireAuthorization } from "~/utils/loaders.middleware";

export const meta: MetaFunction = () => ({
  title: "App | Remix SaasFrontend",
});

export const action: ActionFunction = async ({ request }) => {
  return useAppAction(request);
};

export let loader: LoaderFunction = async ({ request }) => {
  const data = await loadAppData(request);
  const currentPath = new URL(request.url).pathname;
  await requireAuthorization(currentPath, data.currentRole);
  return json(data);
};

export default function AppRoute() {
  return (
    <AppLayout layout="app">
      <Outlet />
    </AppLayout>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <div>Server Error: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();
  return <div>Client Error: {caught.status}</div>;
}
