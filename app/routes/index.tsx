import Features from "~/components/front/Features";
import Footer from "~/components/front/Footer";
import Hero from "~/components/front/Hero";
import JoinNow from "~/components/front/JoinNow";
import { Language } from "remix-i18next";
import { getUserInfo } from "~/utils/session.server";
import { MetaFunction, LoaderFunction, json, useCatch, Link } from "remix";
import { i18nHelper } from "~/locale/i18n.utils";

export const meta: MetaFunction = () => ({
  title: "Remix SaasFrontend",
});

type LoaderData = {
  authenticated: boolean;
  i18n: Record<string, Language>;
};

export let loader: LoaderFunction = async ({ request }) => {
  const { translations } = await i18nHelper(request);
  try {
    const userInfo = await getUserInfo(request);
    const data: LoaderData = {
      authenticated: (userInfo?.userId ?? "").length > 0,
      i18n: translations,
    };
    return json(data);
  } catch (e) {
    console.error({
      error: e,
    });
    return json({
      i18n: translations,
    });
  }
};

export default function IndexRoute() {
  return (
    <div>
      <div className="relative overflow-hidden bg-white dark:bg-gray-900 text-gray-800 dark:text-slate-200">
        <Hero />
        <Features className="relative z-10" />
        <JoinNow />
        <Footer />
      </div>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <div>
      <h1>{`${caught.status} ${caught.statusText}`}</h1>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="px-4 py-4">
      <div className="mx-auto w-full space-y-2 rounded-md border-2 border-dashed border-gray-300 bg-white p-12 text-center shadow-md">
        <div className="flex flex-col justify-center space-y-1">
          <div className="mx-auto text-red-500">
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <div className="text-2xl font-bold">Error</div>
        </div>
        <div className="text-gray-800">{error.message}</div>
        <Link to="." className="text-sm text-gray-500 underline">
          Click here to try again
        </Link>
        {error.stack && (
          <div className="pt-4">
            <div className="border-t border-dashed border-gray-300 pt-3 text-left text-sm text-gray-600">{error.stack}</div>
          </div>
        )}
      </div>
    </div>
  );
}
