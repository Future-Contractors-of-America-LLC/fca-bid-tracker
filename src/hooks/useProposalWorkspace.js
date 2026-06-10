import { useEffect, useMemo, useState } from "react";
import { appendAutomationLog } from "../sessionAutomationLog";
import { appendCommercialLog } from "../sessionCommercialLog";
import { fetchProposals, mutateProposal } from "../api/commercialClient";

export default function useProposalWorkspace() {
  const [proposals, setProposals] = useState([]);
  const [meta, setMeta] = useState({ backingSource: "loading", lastSyncedAt: null, persistenceState: "Proposal workspace loading" });

  useEffect(() => {
    let active = true;
    async function hydrate() {
      try {
        const payload = await fetchProposals();
        if (!active) return;
        setProposals(payload.items || []);
        setMeta({ backingSource: payload.backingSource || "api-commercial-store", lastSyncedAt: new Date().toISOString(), persistenceState: "API proposal workspace active" });
      } catch {
        if (!active) return;
        setMeta({ backingSource: "unavailable", lastSyncedAt: null, persistenceState: "Proposal workspace unavailable" });
      }
    }
    hydrate();
    return () => { active = false; };
  }, []);

  return useMemo(() => ({
    proposals,
    meta,
    async advanceProposal(proposalId, status, detail, nextAction) {
      const payload = await mutateProposal("advance-proposal", { proposalId, status, detail, nextAction });
      setProposals((current) => current.map((item) => item.proposalId === proposalId ? payload.proposal : item));
      setMeta({ backingSource: payload.backingSource || "api-commercial-store", lastSyncedAt: new Date().toISOString(), persistenceState: "Proposal mutation active" });
      appendAutomationLog({ type: "proposal-advance", title: `${proposalId} moved to ${status}`, detail, route: "/portal/proposals" });
      appendCommercialLog({ type: "proposal-advance", title: `${proposalId} customer package advanced`, detail, route: "/portal/proposals" });
      return payload;
    },
  }), [proposals, meta]);
}
