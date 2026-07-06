import { useEffect } from "react";
import { navigateTo } from "../../navigation";
import { centralFetch } from "../../api/backendBase";

export default function PortalWorkspaceRedirect({ target = "/portal/platform" }) {
  useEffect(() => {
    centralFetch("/api/customer-session", { method: "GET" }).catch(() => null);
    navigateTo(target);
  }, [target]);

  return (
    <div style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontFamily: "system-ui, sans-serif" }}>
      Opening workspace...
    </div>
  );
}
