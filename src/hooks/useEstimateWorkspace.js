import { useEffect, useMemo, useState } from "react";
import { readCustomerSession } from "../customerSession";
import { appendAutomationLog } from "../sessionAutomationLog";
import { appendCommercialLog } from "../sessionCommercialLog";
import { readEstimateWorkspace, updateEstimateWorkspace } from "../estimateWorkspaceStore";

function stampHistoryEntry(label, detail) {
  return {
    at: new Date().toISOString(),
    label,
    detail,
  };
}

function filterEstimatesForSession(estimates) {
  const session = readCustomerSession();
  if (!session?.authenticated) return estimates;
  const allowed = session.projectAccess?.projectIds || [];
  if (!allowed.length) return estimates;
  return estimates.filter((estimate) => allowed.includes(estimate.projectId));
}

export default function useEstimateWorkspace() {
  const [estimates, setEstimates] = useState(() => filterEstimatesForSession(readEstimateWorkspace()));

  useEffect(() => {
    setEstimates(filterEstimatesForSession(readEstimateWorkspace()));
  }, []);

  return useMemo(
    () => ({
      estimates,
      getEstimateForBid(bidId) {
        return estimates.find((estimate) => estimate.bidId === bidId) || null;
      },
      generateTakeoff(bidId, detail = "Auricrux generated a structured takeoff from linked evidence.") {
        const saved = updateEstimateWorkspace((current) =>
          current.map((estimate) =>
            estimate.bidId !== bidId
              ? estimate
              : {
                  ...estimate,
                  takeoffStatus: "Takeoff refreshed",
                  estimateStatus: "Estimate build in progress",
                  evidenceSummary: detail,
                  takeoffItems: [
                    {
                      id: `TKO-${estimate.projectId.replace(/[^A-Za-z0-9]/g, "")}-${estimate.takeoffItems.length + 1}`,
                      label: "Auricrux scope gap review",
                      quantity: "1",
                      unit: "PKG",
                      source: "Auricrux evidence brief",
                      status: "Generated",
                    },
                    ...estimate.takeoffItems,
                  ],
                  lastActionAt: new Date().toISOString(),
                  actionHistory: [
                    stampHistoryEntry("Takeoff generated", detail),
                    ...estimate.actionHistory,
                  ].slice(0, 12),
                }
          )
        );

        setEstimates(filterEstimatesForSession(saved));
        const updated = saved.find((estimate) => estimate.bidId === bidId);
        if (updated) {
          appendAutomationLog({
            type: "estimate-takeoff",
            title: `${updated.package} takeoff refreshed`,
            detail,
            route: "/portal/bids",
          });
          appendCommercialLog({
            type: "estimate-takeoff",
            title: `${updated.package} preconstruction evidence deepened`,
            detail,
            route: "/portal/bids",
          });
        }
        return saved;
      },
      buildEstimate(bidId, detail = "Auricrux converted takeoff evidence into estimate continuity and proposal posture.") {
        const saved = updateEstimateWorkspace((current) =>
          current.map((estimate) =>
            estimate.bidId !== bidId
              ? estimate
              : {
                  ...estimate,
                  estimateStatus: "Estimate ready for review",
                  proposalStatus: "Proposal narrative ready",
                  costBasis: detail,
                  scopeNarrative: `Auricrux aligned ${estimate.package} takeoff items, linked files, and proposal continuity for ${estimate.canonicalProjectId}.`,
                  lastActionAt: new Date().toISOString(),
                  actionHistory: [
                    stampHistoryEntry("Estimate built", detail),
                    ...estimate.actionHistory,
                  ].slice(0, 12),
                }
          )
        );

        setEstimates(filterEstimatesForSession(saved));
        const updated = saved.find((estimate) => estimate.bidId === bidId);
        if (updated) {
          appendAutomationLog({
            type: "estimate-build",
            title: `${updated.package} estimate ready`,
            detail,
            route: "/portal/bids",
          });
          appendCommercialLog({
            type: "estimate-build",
            title: `${updated.package} estimate continuity activated`,
            detail,
            route: "/portal/bids",
          });
        }
        return saved;
      },
    }),
    [estimates]
  );
}
