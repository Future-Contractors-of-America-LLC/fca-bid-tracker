import { useState } from "react";
import PortalShell from "../../components/PortalShell";
import { PortalAlert } from "../../components/portal/PortalPrimitives";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useBidWorkspace from "../../hooks/useBidWorkspace";
import useOpportunityWorkspaceDetail from "../../hooks/useOpportunityWorkspaceDetail";
import { convertOpportunityToProject } from "../../api/workflowClient";
import { portalButtonPrimary, portalButtonSecondary } from "../../portalDesignTokens";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const statCardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 12,
  padding: 14,
  background: "#f8fbff",
};

function resolveOpportunityIdentity(requestedPath, routeParams, bids) {
  const fromParam = routeParams?.opportunityId;
  const fromPath = requestedPath?.split("/").filter(Boolean).pop();
  const targetId = fromParam || fromPath || "";
  const bid = bids.find((item) => item.id === targetId) || null;
  return {
    opportunityId: targetId,
    bid,
  };
}

function deriveConversionReadiness(bid) {
  if (!bid) {
    return { canConvertToProject: false, blockingReason: "Opportunity not found" };
  }
  if (bid.linkedProjectId) {
    return { canConvertToProject: false, blockingReason: "Already linked to a project" };
  }
  const ready = bid.status === "Won" || bid.status === "Qualified";
  return {
    canConvertToProject: ready,
    blockingReason: ready ? null : bid.blocker || "Qualify or win the opportunity first",
  };
}

export default function PortalOpportunityDetail({ requestedPath, routeParams = {} }) {
  const { state } = useWorkspaceState();
  const { bids, meta: bidMeta, markWonAndCreateProject } = useBidWorkspace();
  const { opportunityId, bid } = resolveOpportunityIdentity(requestedPath, routeParams, bids);
  const { item, meta, refresh } = useOpportunityWorkspaceDetail(opportunityId, bid);
  const [actionMessage, setActionMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const apiBacked = meta.backingSource === "api-workflow-store";

  const visible = item || (bid
    ? {
        opportunityId: bid.id,
        tenantId: state.tenant.id,
        status: bid.status,
        estimateSummary: {
          estimateId: `EST-${bid.id}`,
          status: bid.qualification?.status || "Discovery in progress",
          versionCount: bid.status === "Qualified" || bid.status === "Won" ? 2 : 1,
        },
        fileSummary: {
          total: 0,
          linked: 0,
          unlinked: 0,
        },
        conversionReadiness: deriveConversionReadiness(bid),
        auricruxSummary: {
          nextAction: bid.qualification?.nextGate || bid.nextCommercialMove,
        },
        serviceLine: "estimating",
        projectIntent: bid.scopePackage,
      }
    : null);

  const canConvert = visible?.conversionReadiness?.canConvertToProject;

  async function handleConvertToProject() {
    if (!opportunityId || !canConvert) return;
    setBusy(true);
    setActionMessage("");
    try {
      try {
        await convertOpportunityToProject(opportunityId, { detail: "Converted from opportunity detail route." });
        setActionMessage("Opportunity converted to an active project.");
      } catch {
        await markWonAndCreateProject(opportunityId, "Converted from opportunity detail route.");
        setActionMessage("Opportunity awarded and project created in workspace.");
      }
      refresh();
    } catch (error) {
      setActionMessage(error.message || "Conversion failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalShell
      title="Opportunity"
      subtitle="Estimate readiness, files, and conversion path for this opportunity."
      activeHref="/portal/bids"
      currentJourney="bid"
      primaryHref="/portal/bids"
      primaryLabel="Open Bid Pipeline"
      workspaceState={state}
    >
      {!apiBacked ? (
        <div style={{ marginBottom: 16 }}>
          <PortalAlert tone="warning" title="Limited opportunity sync">
            Opportunity detail is using workspace continuity. Connect to the API for live bid spine reads and governed project conversion.
          </PortalAlert>
        </div>
      ) : null}

      {visible ? (
        <>
          <div style={{ ...cardStyle, marginBottom: 16 }}>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>{bid?.package || visible.projectIntent || visible.opportunityId}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, color: "#334155", lineHeight: 1.8 }}>
              <div>
                <div><strong>Opportunity ID:</strong> {visible.opportunityId}</div>
                <div><strong>Status:</strong> {visible.status}</div>
                <div><strong>Service line:</strong> {visible.serviceLine || "estimating"}</div>
                <div><strong>Project intent:</strong> {visible.projectIntent || "Not yet captured"}</div>
              </div>
              <div>
                <div><strong>Estimate ID:</strong> {visible.estimateSummary?.estimateId || "Not yet assigned"}</div>
                <div><strong>Estimate status:</strong> {visible.estimateSummary?.status || "Not yet started"}</div>
                <div><strong>Estimate versions:</strong> {visible.estimateSummary?.versionCount ?? 0}</div>
                <div><strong>Next action:</strong> {visible.auricruxSummary?.nextAction || state.workspace.currentNextAction}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
              <a href="/portal/estimates" style={portalButtonSecondary}>Open Estimate Workspace</a>
              <a href="/portal/files" style={portalButtonSecondary}>Open Files</a>
              {canConvert ? (
                <button type="button" onClick={handleConvertToProject} disabled={busy} style={portalButtonPrimary}>
                  {busy ? "Converting..." : "Convert to project"}
                </button>
              ) : null}
            </div>
            {actionMessage ? <div style={{ marginTop: 12, color: actionMessage.includes("failed") ? "#b45309" : "#15803d" }}>{actionMessage}</div> : null}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
            <div style={statCardStyle}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>File summary total</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>{visible.fileSummary?.total ?? 0}</div>
            </div>
            <div style={statCardStyle}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Linked files</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>{visible.fileSummary?.linked ?? 0}</div>
            </div>
            <div style={statCardStyle}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Conversion readiness</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>
                {visible.conversionReadiness?.canConvertToProject ? "Ready to convert" : visible.conversionReadiness?.blockingReason || "Blocked"}
              </div>
            </div>
          </div>

          <AuricruxInsightPanel
            title="Opportunity next move"
            nextAction={visible.auricruxSummary?.nextAction || "Review qualification posture and route the next commercial action."}
            targetObjectType="Opportunity"
            targetObjectId={visible.opportunityId}
            rationale="Explain estimate readiness, recommend conversion or file actions, and execute the next pipeline step."
          />
        </>
      ) : (
        <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)", border: "1px solid #fcd34d" }}>
          <div style={{ color: "#b45309", fontWeight: 800, marginBottom: 8 }}>Opportunity not found in current continuity state</div>
          <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
            No opportunity record matching <strong>{opportunityId || "the requested route"}</strong> was found through the current backend or shell continuity sources.
          </div>
        </div>
      )}
    </PortalShell>
  );
}
