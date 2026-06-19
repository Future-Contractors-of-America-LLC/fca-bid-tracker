import { useCallback, useEffect, useMemo, useState } from "react";
import { appendAutomationLog } from "../sessionAutomationLog";
import { appendCommercialLog } from "../sessionCommercialLog";
import { fetchEstimates, mutateEstimate } from "../api/commercialClient";

export default function useEstimateWorkspace() {
  const [estimates, setEstimates] = useState([]);
  const [meta, setMeta] = useState({ backingSource: "loading", lastSyncedAt: null, persistenceState: "Estimate workspace loading" });

  const refresh = useCallback(async () => {
    const payload = await fetchEstimates();
    setEstimates(payload.items || []);
    setMeta({ backingSource: payload.backingSource || "api-commercial-store", lastSyncedAt: new Date().toISOString(), persistenceState: "API estimate workspace active" });
    return payload;
  }, []);

  useEffect(() => {
    let active = true;
    async function hydrate() {
      try {
        const payload = await refresh();
        if (!active) return;
        void payload;
      } catch {
        if (!active) return;
        setMeta({ backingSource: "unavailable", lastSyncedAt: null, persistenceState: "Estimate workspace unavailable" });
      }
    }
    hydrate();
    return () => { active = false; };
  }, [refresh]);

  return useMemo(() => ({
    estimates,
    meta,
    refresh,
    async advanceEstimate(estimateId, status, detail) {
      const payload = await mutateEstimate("advance-estimate", { estimateId, status, detail });
      setEstimates((current) => current.map((item) => item.estimateId === estimateId ? payload.estimate : item));
      setMeta({ backingSource: payload.backingSource || "api-commercial-store", lastSyncedAt: new Date().toISOString(), persistenceState: "Estimate mutation active" });
      appendAutomationLog({ type: "estimate-advance", title: `${estimateId} moved to ${status}`, detail, route: "/portal/estimates" });
      appendCommercialLog({ type: "estimate-advance", title: `${estimateId} pricing posture advanced`, detail, route: "/portal/estimates" });
      return payload;
    },
    async generateProposal(estimateId, detail) {
      const payload = await mutateEstimate("generate-proposal", { estimateId, detail });
      setEstimates((current) => current.map((item) => item.estimateId === estimateId ? payload.estimate : item));
      setMeta({ backingSource: payload.backingSource || "api-commercial-store", lastSyncedAt: new Date().toISOString(), persistenceState: "Proposal generation active" });
      appendAutomationLog({ type: "proposal-generation", title: `${estimateId} generated proposal package`, detail, route: "/portal/proposals" });
      appendCommercialLog({ type: "proposal-generation", title: `${estimateId} converted into proposal packaging`, detail, route: "/portal/proposals" });
      return payload;
    },
  }), [estimates, meta, refresh]);
}
