import { useEffect, useState } from "react";
import { fetchImmersiveNextActions } from "../api/immersiveClient";
import useCustomerSession from "./useCustomerSession";
import useProjectWorkspace from "./useProjectWorkspace";

function readProjectIdFromLocation() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("projectId") || "";
}

export default function useImmersiveNextActions() {
  const { session } = useCustomerSession();
  const { activeProject } = useProjectWorkspace();
  const projectId = readProjectIdFromLocation() || activeProject?.id || "";
  const userId = session?.email || session?.customerId || "";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchImmersiveNextActions({
      projectId: projectId || undefined,
      userId: userId || undefined,
    })
      .then((payload) => setItems(payload.items || []))
      .catch((loadError) => {
        setItems([]);
        setError(loadError.message || "Unable to load immersive next actions.");
      })
      .finally(() => setLoading(false));
  }, [projectId, userId]);

  const topAction = items[0] || null;

  return {
    items,
    topAction,
    loading,
    error,
    hasActions: items.length > 0,
  };
}
