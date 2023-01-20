import {
  LiveReload,
  Outlet,
  LinksFunction,
  Links,
  useCatch,
  MetaFunction,
  Meta,
  Scripts,
  ScrollRestoration,
  LoaderFunction,
  useLoaderData,
  ActionFunction,
  Link,
} from "remix";
import styles from "./styles/app.css";
import { useSetupTranslations } from "remix-i18next";
import { createUserSession, getUserInfo } from "./utils/session.server";
import { loadRootData, useRootData } from "./utils/data/useRootData";
import TopBanner from "./components/ui/banners/TopBanner";

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = () => {
  const description = `Remix SaaS kit with everything you need to start your SaaS app.`;
  return {
    charset: "utf-8",
    description,
    keywords: "Remix,saas,tailwindcss,typescript,starter",
    "og:image": "https://yahooder.sirv.com/saasfrontends/remix/ss/cover.png",
    "og:card": "summary_large_image",
    "og:creator": "@AlexandroMtzG",
    "og:site": "https://saasfrontends.com",
    "og:title": "Remix SaaS kit",
    "og:description": description,
    "twitter:image": "https://yahooder.sirv.com/saasfrontends/remix/remix-thumbnail.png",
    "twitter:card": "summary_large_image",
    "twitter:creator": "@AlexandroMtzG",
    "twitter:site": "@SaasFrontends",
    "twitter:title": "Remix SaaS kit",
    "twitter:description": description,
  };
};

function Document({ children, title = `Remix SaasFrontend` }: { children: React.ReactNode; title?: string }) {
  const data = useRootData();
  return (
    <html lang={data?.locale ?? "en"} className={data?.lightOrDarkMode === "dark" ? "dark" : ""}>
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <title>{title}</title>
        <link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <Links />
      </head>
      <body className="min-h-screen text-gray-800 dark:text-white bg-white dark:bg-slate-900 max-w-full max-h-full">
        <TopBanner />
        {children}
        <Scripts />
        <LiveReload />
        <ScrollRestoration />

        <script async defer src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
        <noscript>
          <img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" />
        </noscript>
      </body>
    </html>
  );
}

export let loader: LoaderFunction = async ({ request }) => {
  return loadRootData(request);
};

export const action: ActionFunction = async ({ request }) => {
  const userInfo = await getUserInfo(request);
  const form = await request.formData();
  const type = form.get("type");
  const redirect = form.get("redirect")?.toString();
  if (type === "toggleLightOrDarkMode") {
    const current = userInfo?.lightOrDarkMode ?? "dark";
    const lightOrDarkMode = current === "dark" ? "light" : "dark";
    return createUserSession(
      {
        userId: userInfo?.userId ?? "",
        currentTenantId: userInfo?.currentTenantId ?? "",
        currentWorkspaceId: userInfo?.currentWorkspaceId ?? "",
        // locale: userInfo?.currentWorkspaceId ?? "en",
        lightOrDarkMode,
      },
      redirect
    );
  }
  if (type === "setLocale") {
    return createUserSession(
      {
        userId: userInfo?.userId,
        currentTenantId: userInfo?.currentTenantId,
        currentWorkspaceId: userInfo?.currentWorkspaceId,
        lightOrDarkMode: userInfo?.lightOrDarkMode,
      },
      redirect
    );
  }
};

export default function App() {
  let { locale } = useLoaderData<{ locale: string }>();
  useSetupTranslations(locale);
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <div>
        <h1>
          {caught.status} {caught.statusText}
        </h1>
      </div>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document title="Uh-oh!">
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
    </Document>
  );
}
