import { useEffect } from "react";
import { navigateTo } from "../../navigation";

export default function PortalWorkspaceRedirect({ target = "/portal/platform" }) {
  useEffect(() => {
    navigateTo(target);
  }, [target]);

  return (
    <div style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontFamily: "system-ui, sans-serif" }}>
      Opening workspace...
    </div>
  );
}
