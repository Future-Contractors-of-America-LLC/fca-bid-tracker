import { useEffect, useState } from "react";
import { submitAuricruxAction } from "../api/auricruxActionsClient";
import { sendAuricruxMessage } from "../api/auricruxClient";

export default function useAuricruxLiveInsight({
  enabled = true,
  targetObjectType = "Project",
  targetObjectId = "",
  sourceRoute = "",
  rationale = "",
  fallbackNextAction = "",
  useOperationalChat = false,
}) {
  const [liveNextAction, setLiveNextAction] = useState("");
  const [loading, setLoading] = useState(false);
  const [operational, setOperational] = useState(false);

  useEffect(() => {
    if (!enabled || !targetObjectId || !rationale) {
      setLiveNextAction("");
      setOperational(false);
      return undefined;
    }

    let cancelled = false;
    const route =
      sourceRoute || (typeof window !== "undefined" ? window.location.pathname : "/portal/platform");

    (async () => {
      setLoading(true);
      try {
        if (useOperationalChat) {
          const payload = await sendAuricruxMessage({
            message: rationale,
            route,
            context: {
              targetObjectType,
              targetObjectId,
              bidId: targetObjectType === "Bid" ? targetObjectId : undefined,
              projectId: targetObjectType === "Project" ? targetObjectId : undefined,
            },
          });
          if (!cancelled) {
            setLiveNextAction(payload?.reply || "");
            setOperational(Boolean(payload?.operational));
          }
          return;
        }

        const payload = await submitAuricruxAction({
          mode: "recommend",
          targetObjectType,
          targetObjectId,
          rationale,
          sourceRoute: route,
        });
        if (!cancelled) {
          setLiveNextAction(payload?.guidance?.reply || "");
          setOperational(false);
        }
      } catch {
        if (!cancelled) {
          setLiveNextAction("");
          setOperational(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, targetObjectType, targetObjectId, sourceRoute, rationale, useOperationalChat]);

  return {
    nextAction: liveNextAction || fallbackNextAction,
    liveNextAction,
    loading,
    isLive: Boolean(liveNextAction),
    operational,
  };
}
