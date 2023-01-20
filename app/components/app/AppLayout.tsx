import { ReactNode, useEffect, useRef, useState } from "react";
import SidebarLayout from "../layouts/SidebarLayout";
import { useAppData } from "~/utils/data/useAppData";
import TenantNew from "../core/settings/tenant/TenantNew";

interface Props {
  layout: "app" | "admin";
  children: ReactNode;
}

export default function AppLayout({ layout, children }: Props) {
  const appData = useAppData();

  const [addingTenant, setAddingTenant] = useState(false);

  return (
    <div key={appData.currentWorkspace?.id}>
      <SidebarLayout layout={layout} onAddTenant={() => setAddingTenant(true)}>
        {children}
      </SidebarLayout>
      {addingTenant && (
        <TenantNew
          onClosed={() => {
            setAddingTenant(false);
          }}
        />
      )}
    </div>
  );
}
