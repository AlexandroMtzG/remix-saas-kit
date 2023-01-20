import { Link } from "react-router-dom";
import { MouseEventHandler, ReactNode } from "react";
import clsx from "clsx";

interface Props {
  className?: string;
  type?: "button" | "submit" | "reset" | undefined;
  to?: string;
  target?: string;
  disabled?: boolean;
  destructive?: boolean;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function ButtonTertiary({ className = "", type = "button", onClick, disabled, destructive, to, target, children }: Props) {
  return (
    <span>
      {(() => {
        if (!to) {
          return (
            <button
              onClick={onClick}
              type={type}
              disabled={disabled}
              className={clsx(
                className,
                "underline inline-flex space-x-2 items-center px-1 py-2 text-sm font-medium focus:outline-none",
                disabled && "cursor-not-allowed opacity-75",
                !destructive && "text-theme-600",
                destructive && "text-gray-600",
                !disabled && !destructive && "hover:text-theme-800 focus:text-theme-900",
                !disabled && destructive && "hover:text-gray-800 focus:text-gray-900"
              )}
            >
              {children}
            </button>
          );
        } else {
          return (
            <Link
              to={to}
              target={target}
              className={clsx(
                className,
                "underline inline-flex space-x-2 items-center px-1 py-2 text-sm font-medium focus:outline-none",
                disabled && "cursor-not-allowed opacity-75",
                !destructive && "text-theme-600",
                destructive && "text-gray-600",
                !disabled && !destructive && "hover:text-theme-800 focus:text-theme-900",
                !disabled && destructive && "hover:text-gray-800 focus:text-gray-900"
              )}
            >
              {children}
            </Link>
          );
        }
      })()}
    </span>
  );
}
