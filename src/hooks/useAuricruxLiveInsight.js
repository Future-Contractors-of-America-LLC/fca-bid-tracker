import { useEffect, useState } from "react";
import { submitAuricruxAction } from "../api/auricruxActionsClient";

export default function useAuricruxLiveInsight({
  enabled = true,
  targetObjectType = "Project",
  targetObjectId = "",
  sourceRoute = "",
  rationale = "",
  fallbackNextAction = "",
}) {
  const [liveNextAction, setLiveNextAction] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !targetObjectId || !rationale) {
      setLiveNextAction("");
      return undefined;
    }

    let cancelled = false;
    const route =
      sourceRoute || (typeof window !== "undefined" ? window.location.pathname : "/portal/platform");

    (async () => {
      setLoading(true);
      try {
        const payload = await submitAuricruxAction({
          mode: "recommend",
          targetObjectType,
          targetObjectId,
          rationale,
          sourceRoute: route,
        });
        if (!cancelled) {
          setLiveNextAction(payload?.guidance?.reply || "");
        }
      } catch {
        if (!cancelled) setLiveNextAction("");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, targetObjectType, targetObjectId, sourceRoute, rationale]);

  return {
    nextAction: liveNextAction || fallbackNextAction,
    liveNextAction,
    loading,
    isLive: Boolean(liveNextAction),
  };
}
