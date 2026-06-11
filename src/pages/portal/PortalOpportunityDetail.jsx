import PortalShell from "../../components/PortalShell";
import SystemStateSummary from "../../components/SystemStateSummary";
import ExecutionTruthBanner from "../../components/ExecutionTruthBanner";
import PublicCtaRow from "../../components/PublicCtaRow";
import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";
import AutomationRecoveryFeed from "../../components/AutomationRecoveryFeed";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useBidWorkspace from "../../hooks/useBidWorkspace";
import useOpportunityWorkspaceDetail from "../../hooks/useOpportunityWorkspaceDetail";
import { publicBodyCtaSets } from "../../websiteShell";

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

export default function PortalOpportunityDetail({ requestedPath, routeParams = {} }) {
  const { state } = useWorkspaceState();
  const { bids, meta: bidMeta } = useBidWorkspace();
  const { opportunityId, bid } = resolveOpportunityIdentity(requestedPath, routeParams, bids);
  const { item, meta } = useOpportunityWorkspaceDetail(opportunityId, bid);
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
        conversionReadiness: {
          canConvertToProject: Boolean(bid.linkedProjectId),
          blockingReason: bid.linkedProjectId ? null : bid.blocker,
        },
        auricruxSummary: {
          nextAction: bid.qualification?.nextGate || bid.nextCommercialMove,
        },
        serviceLine: "estimating",
        projectIntent: bid.scopePackage,
      }
    : null);

  return (
    <PortalShell
      title="Opportunity Workspace"
      subtitle="Preconstruction continuity shell for a governed opportunity identity, estimate readiness, file posture, and project-conversion path without pretending full execution is live where it is not."
      activeHref="/portal/bids"
      currentJourney="bid"
      primaryHref="/portal/bids"
      primaryLabel="Open Bid Pipeline"
      workspaceState={state}
    >
      <div style={{ marginBottom: 16 }}>
        <ExecutionTruthBanner
          title="Opportunity workspace shell is active"
          status={apiBacked ? "API-backed workspace read" : "Fallback shell continuity active"}
          source={`workspace=${meta.backingSource} · bids=${bidMeta.backingSource}`}
          tone={apiBacked ? "info" : "warning"}
          whatIsLive={[
            "A dynamic routed opportunity workspace exists at /portal/opportunities/:opportunityId.",
            "The route now prefers a canonical backend workspace read for opportunity detail.",
            "Estimate readiness, file summary posture, and conversion readiness are grouped into one opportunity surface.",
          ]}
          whatIsNotLiveYet={[
            "When backend truth is unavailable, the route still falls back to shell continuity derived from the bid spine.",
            "Direct opportunity-specific file actions and estimate mutations are not yet fully implemented on this route.",
            "This route should not be treated as proof that governed project conversion is fully live end to end.",
          ]}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <SystemStateSummary
          tenant={state.tenant}
          project={state.project}
          workspace={state.workspace}
          auricrux={state.auricrux}
          title="Opportunity route now prefers canonical workspace reads"
          detail="This route now attempts to resolve opportunity detail from a backend workspace model before falling back to shell continuity state."
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <PublicCtaRow actions={publicBodyCtaSets.portalCoordination} style={{ display: "flex", flexWrap: "wrap", gap: 12 }} />
      </div>

      <CommercialContinuityFeed title="Opportunity commercial continuity feed" detail="Recent qualification repairs, approval-path changes, and estimate handoff posture remain visible here so preconstruction movement stays tied to real commercial continuity." />
      <AutomationRecoveryFeed title="Opportunity automation feed" detail="Recent Auricrux continuity repairs and bid-to-estimate routing changes remain visible across the workspace shell." />

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Resolved opportunity identity</div>
        <div style={{ color: "#334155", lineHeight: 1.8 }}>
          <div><strong>Route pattern:</strong> /portal/opportunities/:opportunityId</div>
          <div><strong>Requested opportunity ID:</strong> {opportunityId || "None provided"}</div>
          <div><strong>Workspace source:</strong> {meta.backingSource}</div>
          <div><strong>Persistence state:</strong> {meta.persistenceState}</div>
          <div><strong>Last sync:</strong> {meta.lastSyncedAt || "Pending initial sync"}</div>
        </div>
      </div>

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
                {visible.conversionReadiness?.canConvertToProject ? "Project-capable" : visible.conversionReadiness?.blockingReason || "Blocked"}
              </div>
            </div>
          </div>
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
