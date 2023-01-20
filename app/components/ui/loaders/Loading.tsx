import { useTransition } from "remix";

export default function Loading() {
  const transition = useTransition();
  return (
    <>
      {(transition.state === "submitting" || transition.state === "loading") && (
        <div className="pt-4 space-y-2 pb-4 text-center">
          <div className="h-auto w-full flex justify-center py-12 flex-col text-center space-y-4">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-slate-200 h-20 w-20 mx-auto"></div>
          </div>
        </div>
      )}
    </>
  );
}
