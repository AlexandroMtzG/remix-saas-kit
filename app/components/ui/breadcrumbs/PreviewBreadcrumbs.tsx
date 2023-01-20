import { useLocation } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";

export default function PreviewBreadcrumbs() {
  const currentRoute = useLocation().pathname;
  return (
    <div className="space-y-2 w-full">
      <Breadcrumb
        className="w-full"
        home="/"
        menu={[{ title: "Home", routePath: "/" }, { title: "Components", routePath: currentRoute }, { title: "Breadcrumbs" }]}
      />
    </div>
  );
}
