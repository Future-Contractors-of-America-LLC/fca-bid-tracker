import PortalShell from "../../components/PortalShell";
import SystemStateSummary from "../../components/SystemStateSummary";
import ExecutionTruthBanner from "../../components/ExecutionTruthBanner";
import PublicCtaRow from "../../components/PublicCtaRow";
import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";
import AutomationRecoveryFeed from "../../components/AutomationRecoveryFeed";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useBidWorkspace from "../../hooks/useBidWorkspace";
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
  const { bids, meta } = useBidWorkspace();
  const { opportunityId, bid } = resolveOpportunityIdentity(requestedPath, routeParams, bids);
  const apiBacked = meta.backingSource === "api-workflow-store";

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
          status={apiBacked ? "API-backed read posture" : "Shell continuity active"}
          source={meta.backingSource}
          tone={apiBacked ? "info" : "warning"}
          whatIsLive={[
            "A dynamic routed opportunity workspace now exists at /portal/opportunities/:opportunityId.",
            "Opportunity identity is resolved from the route and tied to current bid/preconstruction continuity state.",
            "Estimate readiness, commercial posture, and downstream project-conversion framing are visible in one place.",
          ]}
          whatIsNotLiveYet={[
            "This route currently maps opportunity continuity through the bid workspace spine rather than a dedicated governed Opportunity API object.",
            "Direct opportunity-specific backend actions and full file-linkage workflow are not yet implemented on this route.",
            "This route should not be treated as proof that governed project conversion is fully live end-to-end.",
          ]}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <SystemStateSummary
          tenant={state.tenant}
          project={state.project}
          workspace={state.workspace}
          auricrux={state.auricrux}
          title="Opportunity route now exists in live router truth"
          detail="This route introduces the first flagship opportunity workspace shell so lead-to-estimate-to-project continuity can stop being implied only through docs."
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
          <div><strong>Backing source:</strong> {meta.backingSource}</div>
          <div><strong>Persistence state:</strong> {meta.persistenceState}</div>
          <div><strong>Last sync:</strong> {meta.lastSyncedAt || "Pending initial sync"}</div>
        </div>
      </div>

      {bid ? (
        <>
          <div style={{ ...cardStyle, marginBottom: 16 }}>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>{bid.package}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, color: "#334155", lineHeight: 1.8 }}>
              <div>
                <div><strong>Opportunity ID:</strong> {bid.id}</div>
                <div><strong>Status:</strong> {bid.status}</div>
                <div><strong>Estimator:</strong> {bid.estimator}</div>
                <div><strong>Decision due:</strong> {bid.dueDate}</div>
              </div>
              <div>
                <div><strong>Value:</strong> {bid.value}</div>
                <div><strong>Scope package:</strong> {bid.scopePackage}</div>
                <div><strong>Trade coverage:</strong> {bid.tradeCoverage}</div>
                <div><strong>Current blocker:</strong> {bid.blocker}</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
            <div style={statCardStyle}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Qualification status</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>{bid.qualification.status}</div>
            </div>
            <div style={statCardStyle}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Qualification score</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>{bid.qualification.score}</div>
            </div>
            <div style={statCardStyle}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Next gate</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>{bid.qualification.nextGate}</div>
            </div>
          </div>

          <div style={{ ...cardStyle, marginBottom: 16 }}>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>Opportunity continuity posture</h2>
            <div style={{ color: "#475569", lineHeight: 1.8 }}>
              <div><strong>Budget fit:</strong> {bid.qualification.budgetFit}</div>
              <div><strong>Scope fit:</strong> {bid.qualification.scopeFit}</div>
              <div><strong>Jurisdiction:</strong> {bid.qualification.jurisdiction}</div>
              <div><strong>Travel posture:</strong> {bid.qualification.travel}</div>
              <div><strong>Evidence packet:</strong> {bid.qualification.evidence}</div>
              <div><strong>Next commercial move:</strong> {bid.nextCommercialMove}</div>
              <div><strong>Linked project root:</strong> {bid.linkedProjectId || "Not yet created"}</div>
            </div>
          </div>

          <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)", border: "1px solid #fcd34d" }}>
            <div style={{ color: "#b45309", fontWeight: 800, marginBottom: 8 }}>Missing-wiring guard</div>
            <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
              This route currently presents the opportunity through the bid/preconstruction spine. Dedicated governed opportunity reads, direct estimate/file linkage blocks,
              and explicit convert-to-project actions still need their own backend contract before this route can be described as fully product-capable.
            </div>
          </div>
        </>
      ) : (
        <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)", border: "1px solid #fcd34d" }}>
          <div style={{ color: "#b45309", fontWeight: 800, marginBottom: 8 }}>Opportunity not found in current shell continuity state</div>
          <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
            No opportunity record matching <strong>{opportunityId || "the requested route"}</strong> was found in the current workspace shell.
            This route now exists, but it still depends on the current preconstruction continuity store until a dedicated opportunity object spine is live.
          </div>
        </div>
      )}
    </PortalShell>
  );
}
