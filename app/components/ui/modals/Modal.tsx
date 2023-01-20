import { Transition } from "@headlessui/react";
import { forwardRef, Fragment, ReactNode, Ref, useImperativeHandle, useState } from "react";
import { useEscapeKeypress } from "~/utils/shared/KeypressUtils";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

export interface RefModal {
  show: () => void;
  close: () => void;
}

interface Props {
  className?: string;
  maxSize?: string;
  children: ReactNode;
  onClosed?: () => void;
}

const Modal = ({ className, maxSize = "sm:max-w-lg", onClosed, children }: Props, ref: Ref<RefModal>) => {
  const { t } = useTranslation("translations");

  const [showing, setShowing] = useState(false);

  useImperativeHandle(ref, () => ({ show, close }));

  function show() {
    setShowing(true);
  }

  function close() {
    setShowing(false);
    if (onClosed) {
      onClosed();
    }
  }

  useEscapeKeypress(close);

  return (
    <Transition.Root show={showing} as={Fragment}>
      <div className={clsx(className, "fixed z-50 inset-0 overflow-y-auto")}>
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-800 opacity-75"></div>
            </div>
          </Transition>

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>
          <Transition
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              v-show="showing"
              className={clsx(
                maxSize,
                "inline-block align-bottom bg-white rounded-sm px-4 pt-5 pb-4 text-left overflow-visible shadow-xl transform transition-all my-8 sm:align-middle w-full sm:p-6"
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="just absolute top-0 right-0 -mt-4 pr-4">
                <button
                  onClick={close}
                  type="button"
                  className="p-1 bg-white hover:bg-gray-200 border border-gray-200 rounded-full text-gray-600 justify-center flex items-center hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-5 w-5 text-gray-700"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-3">{children}</div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition.Root>
  );
};

export default forwardRef(Modal);
