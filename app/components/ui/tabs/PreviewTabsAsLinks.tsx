import { useLocation } from "react-router-dom";
import Tabs from "./Tabs";

export default function PreviewTabsAsLinks() {
  const currentRoute = useLocation().pathname;
  return (
    <div className="space-y-2 w-full">
      <Tabs
        asLinks={true}
        className="w-full sm:w-auto"
        tabs={[
          { name: "Home", routePath: "/" },
          { name: "Components", routePath: currentRoute },
        ]}
      />
    </div>
  );
}
