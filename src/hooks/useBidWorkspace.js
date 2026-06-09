import { useEffect, useMemo, useState } from "react";
import { appendAutomationLog } from "../sessionAutomationLog";
import { appendCommercialLog } from "../sessionCommercialLog";
import { readBidWorkspace, updateBidWorkspace } from "../bidWorkspaceStore";
import { updateProjectWorkspace } from "../projectWorkspaceStore";

function stampHistoryEntry(label, detail) {
  return {
    at: new Date().toISOString(),
    label,
    detail,
  };
}

function normalizeProjectId(bidId, indexSeed = 0) {
  const numericPart = String(bidId || indexSeed + 1).replace(/[^0-9]/g, "") || `${indexSeed + 1}`;
  return `PRJ-${numericPart.padStart(3, "0")}`;
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
      convertBidToProject(bidId, detail = "Won bid converted into a project root with audit continuity.") {
        const saved = updateBidWorkspace((current) =>
          current.map((bid) =>
            bid.id !== bidId
              ? bid
              : {
                  ...bid,
                  status: "Won",
                  blocker: "Conversion cleared",
                  nextCommercialMove: detail,
                  lastActionAt: new Date().toISOString(),
                  actionHistory: [
                    stampHistoryEntry("Converted to project", detail),
                    ...bid.actionHistory,
                  ].slice(0, 12),
                }
          )
        );

        setBids(saved);
        const updatedBid = saved.find((bid) => bid.id === bidId);
        if (!updatedBid) return saved;

        updateProjectWorkspace((current) => {
          const existing = current.find((project) => project.sourceBidId === bidId);
          if (existing) {
            return current.map((project) =>
              project.sourceBidId !== bidId
                ? project
                : {
                    ...project,
                    stage: "Project Setup",
                    nextAction: "Upload kickoff package and review document briefing",
                    commercialFocus: updatedBid.scopePackage,
                    auditSummary: `Bid ${updatedBid.package} remains linked to ${project.id} with conversion continuity active.`,
                    lastActionAt: new Date().toISOString(),
                    actionHistory: [
                      stampHistoryEntry("Bid conversion reaffirmed", detail),
                      ...(project.actionHistory || []),
                    ].slice(0, 12),
                  }
            );
          }

          const nextProjectId = normalizeProjectId(bidId, current.length);
          return [
            {
              id: nextProjectId,
              title: `${updatedBid.package} Project Workspace`,
              customer: updatedBid.package.includes("A-117") ? "FCA Pilot Customer" : updatedBid.package,
              sourceBidId: bidId,
              stage: "Project Setup",
              nextAction: "Upload kickoff package and review document briefing",
              owner: updatedBid.estimator || "Estimator Team",
              due: updatedBid.dueDate || "TBD",
              superintendent: "Pending assignment",
              permitStatus: "Awaiting project setup release",
              siteStatus: "Bid converted; job-start packet pending",
              commercialFocus: updatedBid.scopePackage,
              fileCount: 0,
              latestBriefingSummary: "No document briefing recorded yet.",
              auditSummary: `Converted from ${updatedBid.package} with bid-to-project continuity preserved.`,
              lastActionAt: new Date().toISOString(),
              actionHistory: [stampHistoryEntry("Project created from bid", detail)],
            },
            ...current,
          ];
        });

        appendAutomationLog({
          type: "bid-project-conversion",
          title: `${updatedBid.package} converted to project`,
          detail,
          route: "/portal/projects",
        });
        appendCommercialLog({
          type: "bid-project-conversion",
          title: `${updatedBid.package} moved into project execution spine`,
          detail,
          route: "/portal/projects",
        });

        return saved;
      },
    }),
    [bids]
  );
}
