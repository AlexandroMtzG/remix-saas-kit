import Header from "~/components/front/Header";
import Icon from "~/components/front/Icon";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import RemixLight from "~/assets/img/remix-light.png";
import RemixDark from "~/assets/img/remix-dark.png";
import clsx from "~/utils/shared/ClassesUtils";

interface Props {
  t: (t: string) => string;
}

export default function Hero() {
  const { t } = useTranslation("translations");
  return (
    <div className="relative">
      <Header />
      <div className="hidden sm:block sm:absolute sm:inset-y-0 sm:h-full sm:w-full" aria-hidden="true">
        <div className="relative h-full max-w-7xl mx-auto">
          <svg
            className="absolute right-full transform translate-y-1/4 translate-x-1/4 lg:translate-x-1/2"
            width="404"
            height="784"
            fill="none"
            viewBox="0 0 404 784"
          >
            <defs>
              <pattern id="f210dbf6-a58d-4871-961e-36d5016a0f49" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="4" height="4" className="text-gray-200 dark:text-gray-800" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="404" height="784" fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)" />
          </svg>
          <svg
            className="absolute left-full transform -translate-y-3/4 -translate-x-1/4 md:-translate-y-1/2 lg:-translate-x-1/2 text-gray-200 dark:text-gray-800"
            width="404"
            height="784"
            fill="none"
            viewBox="0 0 404 784"
          >
            <defs>
              <pattern id="5d0dd344-b041-4d26-bec4-8d33ea57ec9b" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="4" height="4" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="404" height="784" fill="url(#5d0dd344-b041-4d26-bec4-8d33ea57ec9b)" />
          </svg>
        </div>
      </div>
      <div className="relative z-10 px-6 pt-16 md:pt-24 pb-16 md:pb-24 space-y-3">
        <Icon className="hidden lg:flex mx-auto h-9 w-auto" />
        <h1 className="relative z-10 pb-6 text-3xl sm:text-5xl md:text-6xl lg:text-7.5xl font-extrabold tracking-snug text-center leading-11 sm:leading-15 md:leading-18 lg:leading-22 text-gray-900 dark:text-white">
          <span className="flex space-x-1 justify-center items-center">
            {/* <span className="text-theme-500 dark:text-white">{t("front.hero.headline1")}</span> */}
            <span className="">
              <img className={clsx("h-7 sm:h-11 md:h-14 pt-0.5", "hidden dark:block w-auto mx-auto")} src={RemixDark} alt="Logo" />
              <img className={clsx("h-7 sm:h-11 md:h-14 pt-0.5", "dark:hidden w-auto mx-auto")} src={RemixLight} alt="Logo" />
            </span>
            <span className="dark:text-cyan-300">{t("front.hero.headline2")}</span>
          </span>
          <span className="dark:text-white">
            to <span className="dark:text-green-300">{t("front.hero.build")}</span> {t("front.hero.yourOwn")}{" "}
            <span className="dark:text-yellow-300">{t("front.hero.saas")}</span>
          </span>
        </h1>
        <div className="relative z-10 pb-10 text-gray-500 text-lg md:text-2xl text-center leading-normal md:leading-9">
          <p className="sm:text-lg max-w-2xl mx-auto">{t("front.hero.headline4")}</p>
        </div>

        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <div className="rounded-md shadow">
            <Link
              to="/register"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md bg-rose-500 text-theme-50 hover:bg-theme-600 md:py-4 md:text-lg md:px-10"
            >
              Start today
            </Link>
          </div>
          <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
            <Link
              to="/contact"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-theme-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
            >
              Contact us
            </Link>
          </div>
        </div>

        <p className="text-gray-500 flex justify-center">No credit card required.</p>
      </div>
    </div>
  );
}
