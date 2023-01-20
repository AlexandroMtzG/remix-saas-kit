import { ActionFunction, json, LoaderFunction, MetaFunction, Outlet, useCatch } from "remix";
import AppLayout from "~/components/app/AppLayout";
import { loadAppData } from "~/utils/data/useAppData";
import { useAppAction } from "~/utils/actions/useAppAction";
import { requireAdminUser } from "~/utils/loaders.middleware";

export const meta: MetaFunction = () => ({
  title: "Admin | Remix SaasFrontend",
});

export const action: ActionFunction = async ({ request }) => {
  return useAppAction(request, "/admin/tenants");
};

export let loader: LoaderFunction = async ({ request }) => {
  const data = await loadAppData(request);
  await requireAdminUser(request);
  return json(data);
};

export default function AdminRoute() {
  return (
    <AppLayout layout="admin">
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
