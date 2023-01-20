import Footer from "~/components/front/Footer";
import Header from "~/components/front/Header";
import AllComponentsList from "~/components/ui/AllComponentsList";
import { json, LoaderFunction, MetaFunction } from "remix";
import { useTranslation } from "react-i18next";
import { i18n } from "~/locale/i18n.server";

export const meta: MetaFunction = () => ({
  title: "Components | Remix SaasFrontend",
});

export let loader: LoaderFunction = async ({ request }) => {
  return json({
    i18n: await i18n.getTranslations(request, ["translations"]),
  });
};

export default function ComponentsRoute() {
  const { t } = useTranslation("translations");
  return (
    <div>
      <Header />
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-col sm:align-center">
            <div className="relative mx-auto py-12 sm:py-6 w-full">
              <svg className="absolute left-full transform translate-x-1/2" width="404" height="404" fill="none" viewBox="0 0 404 404" aria-hidden="true">
                <defs>
                  <pattern id="85737c0e-0916-41d7-917f-596dc7edfa27" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="404" height="404" fill="url(#85737c0e-0916-41d7-917f-596dc7edfa27)" />
              </svg>
              <svg
                className="absolute right-full bottom-0 transform -translate-x-1/2"
                width="404"
                height="404"
                fill="none"
                viewBox="0 0 404 404"
                aria-hidden="true"
              >
                <defs>
                  <pattern id="85737c0e-0916-41d7-917f-596dc7edfa27" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="404" height="404" fill="url(#85737c0e-0916-41d7-917f-596dc7edfa27)" />
              </svg>
              <div className="text-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-800 sm:text-4xl">{t("admin.components.title")}</h2>
                <p className="mt-4 text-lg leading-6 text-gray-500">{t("admin.components.headline")}</p>
              </div>
              <div className="mt-12">
                <AllComponentsList />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
}
