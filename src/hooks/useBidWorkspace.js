import { useCallback, useEffect, useMemo, useState } from "react";
import { appendAutomationLog } from "../sessionAutomationLog";
import { appendCommercialLog } from "../sessionCommercialLog";
import { updateBidWorkspace, writeBidWorkspace } from "../bidWorkspaceStore";
import { fetchWorkflowBids, mutateWorkflowBid } from "../api/workflowClient";

export default function useBidWorkspace() {
  const [bids, setBids] = useState([]);
  const [meta, setMeta] = useState({
    backingSource: "loading",
    persistenceState: "Loading bid workflow from FCA Contractor Command…",
    loadError: "",
    lastSyncedAt: null,
  });

  const reloadBids = useCallback(async () => {
    setMeta((current) => ({
      ...current,
      backingSource: "loading",
      persistenceState: "Loading bid workflow from FCA Contractor Command…",
      loadError: "",
    }));
    try {
      const payload = await fetchWorkflowBids();
      const saved = writeBidWorkspace(payload.items || []);
      setBids(saved);
      setMeta({
        backingSource: payload.backingSource || "api-workflow-store",
        persistenceState: "API bid workflow spine active",
        loadError: "",
        lastSyncedAt: new Date().toISOString(),
      });
      return saved;
    } catch (err) {
      setBids([]);
      setMeta({
        backingSource: "api-error",
        persistenceState: "Unable to load bids from FCA Contractor Command",
        loadError: err?.message || "Unable to load bid workflow state.",
        lastSyncedAt: null,
      });
      return [];
    }
  }, []);

  useEffect(() => {
    reloadBids();
  }, [reloadBids]);

  return useMemo(
    () => ({
      bids,
      meta,
      reloadBids,
      async updateBidStatus(bidId, status, detail) {
        try {
          const payload = await mutateWorkflowBid("update-status", { bidId, status, detail });
          const saved = updateBidWorkspace((current) =>
            current.map((bid) => (bid.id === bidId ? payload.bid : bid))
          );
          setBids(saved);
          setMeta({
            backingSource: payload.backingSource || "api-workflow-store",
            persistenceState: "API bid workflow mutation active",
            loadError: "",
            lastSyncedAt: new Date().toISOString(),
          });
          const updatedBid = payload.bid;
          appendAutomationLog({
            type: "bid-status",
            title: `${updatedBid.package} moved to ${status}`,
            detail: detail || `Auricrux changed ${updatedBid.package} to ${status} inside the bid workspace.`,
            route: "/portal/bids",
          });
          appendCommercialLog({
            type: "bid-revenue",
            title: `${updatedBid.package} commercial posture updated`,
            detail: detail || `Auricrux advanced ${updatedBid.package} to ${status} and preserved the revenue-continuity move.`,
            route: "/portal/bids",
          });
          return saved;
        } catch (err) {
          setMeta((current) => ({
            ...current,
            loadError: err?.message || "Bid update failed. Retry when the workspace API is available.",
          }));
          throw err;
        }
      },
      async clearBidBlocker(bidId, detail = "Approval blocker cleared and package ready for next commercial move.") {
        try {
          const payload = await mutateWorkflowBid("clear-blocker", { bidId, detail });
          const saved = updateBidWorkspace((current) =>
            current.map((bid) => (bid.id === bidId ? payload.bid : bid))
          );
          setBids(saved);
          setMeta({
            backingSource: payload.backingSource || "api-workflow-store",
            persistenceState: "API bid workflow mutation active",
            loadError: "",
            lastSyncedAt: new Date().toISOString(),
          });
          const updatedBid = payload.bid;
          appendAutomationLog({ type: "bid-repair", title: `${updatedBid.package} blocker cleared`, detail, route: "/portal/bids" });
          appendCommercialLog({ type: "bid-repair", title: `${updatedBid.package} approval path restored`, detail, route: "/portal/bids" });
          return saved;
        } catch (err) {
          setMeta((current) => ({
            ...current,
            loadError: err?.message || "Unable to clear bid blocker.",
          }));
          throw err;
        }
      },
      async updateBidQualification(bidId, updates, detail = "Qualification command surface updated.") {
        try {
          const payload = await mutateWorkflowBid("update-qualification", { bidId, updates, detail });
          const saved = updateBidWorkspace((current) =>
            current.map((bid) => (bid.id === bidId ? payload.bid : bid))
          );
          setBids(saved);
          setMeta({ backingSource: payload.backingSource || "api-workflow-store", persistenceState: "API bid workflow mutation active", loadError: "", lastSyncedAt: new Date().toISOString() });
          const updatedBid = payload.bid;
          appendAutomationLog({ type: "bid-qualification", title: `${updatedBid.package} qualification updated`, detail, route: "/portal/bids" });
          appendCommercialLog({ type: "bid-qualification", title: `${updatedBid.package} qualification posture updated`, detail, route: "/portal/bids" });
          return saved;
        } catch (err) {
          setMeta((current) => ({
            ...current,
            loadError: err?.message || "Unable to update bid qualification.",
          }));
          throw err;
        }
      },
      async routeBidToEstimate(bidId, detail = "Qualified opportunity routed into estimate production.") {
        try {
          const payload = await mutateWorkflowBid("route-to-estimate", { bidId, detail });
          const saved = updateBidWorkspace((current) =>
            current.map((bid) => (bid.id === bidId ? payload.bid : bid))
          );
          setBids(saved);
          setMeta({ backingSource: payload.backingSource || "api-workflow-store", persistenceState: "API bid workflow mutation active", loadError: "", lastSyncedAt: new Date().toISOString() });
          const updatedBid = payload.bid;
          appendAutomationLog({ type: "bid-estimate-handoff", title: `${updatedBid.package} routed to estimate`, detail, route: "/portal/bids" });
          appendCommercialLog({ type: "bid-estimate-handoff", title: `${updatedBid.package} moved into estimate production`, detail, route: "/portal/bids" });
          return saved;
        } catch (err) {
          setMeta((current) => ({
            ...current,
            loadError: err?.message || "Unable to route bid to estimate.",
          }));
          throw err;
        }
      },
      async createBid(fields, detail = "Created a real opportunity on the production spine.") {
        try {
          const payload = await mutateWorkflowBid("create-bid", { ...fields, detail, sourceRoute: "/portal/bids" });
          const saved = updateBidWorkspace((current) => [payload.bid, ...current.filter((bid) => bid.id !== payload.bid.id)]);
          setBids(saved);
          setMeta({
            backingSource: payload.backingSource || "api-workflow-store",
            persistenceState: "Production bid created on governed spine",
            loadError: "",
            lastSyncedAt: new Date().toISOString(),
          });
          appendAutomationLog({
            type: "bid-create",
            title: `${payload.bid.package} created`,
            detail,
            route: "/portal/bids",
          });
          appendCommercialLog({
            type: "bid-create",
            title: `${payload.bid.package} added to qualification board`,
            detail,
            route: "/portal/bids",
          });
          return payload.bid;
        } catch (err) {
          setMeta((current) => ({
            ...current,
            loadError: err?.message || "Unable to create opportunity.",
          }));
          throw err;
        }
      },
      async markWonAndCreateProject(bidId, detail = "Won work converted into job setup.") {
        try {
          const payload = await mutateWorkflowBid("mark-won-create-project", { bidId, detail });
          const saved = updateBidWorkspace((current) =>
            current.map((bid) => (bid.id === bidId ? payload.bid : bid))
          );
          setBids(saved);
          setMeta({ backingSource: payload.backingSource || "api-workflow-store", persistenceState: "API bid-to-project conversion active", loadError: "", lastSyncedAt: new Date().toISOString() });
          const updatedBid = payload.bid;
          appendAutomationLog({ type: "bid-awarded", title: `${updatedBid.package} converted into project`, detail, route: "/portal/projects" });
          appendCommercialLog({ type: "bid-awarded", title: `${updatedBid.package} moved into job setup`, detail, route: "/portal/projects" });
          return payload;
        } catch (err) {
          setMeta((current) => ({
            ...current,
            loadError: err?.message || "Unable to convert bid to project.",
          }));
          throw err;
        }
      },
    }),
    [bids, meta, reloadBids]
  );
}
