import { useEffect, useMemo, useState } from "react";
import { appendAutomationLog } from "../sessionAutomationLog";
import { appendCommercialLog } from "../sessionCommercialLog";
import { readBidWorkspace, updateBidWorkspace } from "../bidWorkspaceStore";

function stampHistoryEntry(label, detail) {
  return {
    at: new Date().toISOString(),
    label,
    detail,
  };
}

export default function useBidWorkspace() {
  const [bids, setBids] = useState(() => readBidWorkspace());

  useEffect(() => {
    setBids(readBidWorkspace());
  }, []);

  return useMemo(
    () => ({
      bids,
      updateBidStatus(bidId, status, detail) {
        const saved = updateBidWorkspace((current) =>
          current.map((bid) =>
            bid.id !== bidId
              ? bid
              : {
                  ...bid,
                  status,
                  blocker: status === "Won" ? "Conversion cleared" : bid.blocker,
                  nextCommercialMove: detail || bid.nextCommercialMove,
                  lastActionAt: new Date().toISOString(),
                  actionHistory: [
                    stampHistoryEntry(`Status changed to ${status}`, detail || `Auricrux moved ${bid.package} into ${status}.`),
                    ...bid.actionHistory,
                  ].slice(0, 12),
                }
          )
        );

        setBids(saved);
        const updatedBid = saved.find((bid) => bid.id === bidId);
        if (updatedBid) {
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
        }

        return saved;
      },
      clearBidBlocker(bidId, detail = "Approval blocker cleared and package ready for next commercial move.") {
        const saved = updateBidWorkspace((current) =>
          current.map((bid) =>
            bid.id !== bidId
              ? bid
              : {
                  ...bid,
                  blocker: "No active blocker",
                  nextCommercialMove: detail,
                  lastActionAt: new Date().toISOString(),
                  actionHistory: [
                    stampHistoryEntry("Blocker cleared", detail),
                    ...bid.actionHistory,
                  ].slice(0, 12),
                }
          )
        );

        setBids(saved);
        const updatedBid = saved.find((bid) => bid.id === bidId);
        if (updatedBid) {
          appendAutomationLog({
            type: "bid-repair",
            title: `${updatedBid.package} blocker cleared`,
            detail,
            route: "/portal/bids",
          });
          appendCommercialLog({
            type: "bid-repair",
            title: `${updatedBid.package} approval path restored`,
            detail,
            route: "/portal/bids",
          });
        }

        return saved;
      },
      updateBidQualification(bidId, updates, detail = "Qualification command surface updated.") {
        const saved = updateBidWorkspace((current) =>
          current.map((bid) =>
            bid.id !== bidId
              ? bid
              : {
                  ...bid,
                  qualification: {
                    ...bid.qualification,
                    ...updates,
                  },
                  nextCommercialMove: updates?.nextGate || detail || bid.nextCommercialMove,
                  lastActionAt: new Date().toISOString(),
                  actionHistory: [
                    stampHistoryEntry("Qualification command updated", detail),
                    ...bid.actionHistory,
                  ].slice(0, 12),
                }
          )
        );

        setBids(saved);
        const updatedBid = saved.find((bid) => bid.id === bidId);
        if (updatedBid) {
          appendAutomationLog({
            type: "bid-qualification",
            title: `${updatedBid.package} qualification updated`,
            detail,
            route: "/portal/bids",
          });
          appendCommercialLog({
            type: "bid-qualification",
            title: `${updatedBid.package} qualification posture updated`,
            detail,
            route: "/portal/bids",
          });
        }

        return saved;
      },
      routeBidToEstimate(bidId, detail = "Qualified opportunity routed into estimate production.") {
        const saved = updateBidWorkspace((current) =>
          current.map((bid) =>
            bid.id !== bidId
              ? bid
              : {
                  ...bid,
                  status: "Qualified",
                  blocker: "No active blocker",
                  nextCommercialMove: detail,
                  qualification: {
                    ...bid.qualification,
                    status: "Ready for estimate",
                    evidence: "Qualification packet verified",
                    nextGate: "Estimator handoff active",
                  },
                  lastActionAt: new Date().toISOString(),
                  actionHistory: [
                    stampHistoryEntry("Routed to estimate", detail),
                    ...bid.actionHistory,
                  ].slice(0, 12),
                }
          )
        );

        setBids(saved);
        const updatedBid = saved.find((bid) => bid.id === bidId);
        if (updatedBid) {
          appendAutomationLog({
            type: "bid-estimate-handoff",
            title: `${updatedBid.package} routed to estimate`,
            detail,
            route: "/portal/bids",
          });
          appendCommercialLog({
            type: "bid-estimate-handoff",
            title: `${updatedBid.package} moved into estimate production`,
            detail,
            route: "/portal/bids",
          });
        }

        return saved;
      },
    }),
    [bids]
  );
}
