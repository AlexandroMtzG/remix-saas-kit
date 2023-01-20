import { useLocation } from "react-router-dom";
import EmptyState from "./EmptyState";

export default function PreviewEmptyStates() {
  const currentRoute = useLocation().pathname;
  return (
    <div className="space-y-2 w-full">
      <EmptyState
        onClick={() => alert("Clicked")}
        captions={{
          new: "Button",
          thereAreNo: "There are no...",
          description: "Description...",
        }}
        icon="plus"
      />
      <EmptyState
        to={currentRoute}
        captions={{
          new: "Link",
          thereAreNo: "There are no...",
          description: "Description...",
        }}
      />
    </div>
  );
}
