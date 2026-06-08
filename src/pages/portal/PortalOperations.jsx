import PortalShell from "../../components/PortalShell";
import PublicCtaRow from "../../components/PublicCtaRow";
import ProductAccessStatusPanel from "../../components/ProductAccessStatusPanel";
import CustomerCommsLaunchpad from "../../components/CustomerCommsLaunchpad";
import CustomerPlanSummaryPanel from "../../components/CustomerPlanSummaryPanel";
import { routeStateOverlays } from "../../systemState";
import { operationsPipeline } from "../../operationsPipeline";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useCustomerSession from "../../hooks/useCustomerSession";
import { publicBodyCtaSets } from "../../websiteShell";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function PortalOperations() {
  const { state } = useWorkspaceState();
  const { session } = useCustomerSession();

  return (
    <PortalShell
      title="FCA Operations Pipeline"
      subtitle="A customer-ready construction operations view connecting lead intake, qualification, preconstruction, award, document control, billing, closeout, warranty, and referral continuity."
      activeHref="/portal/operations"
      currentJourney="lead"
      routeOverlay={routeStateOverlays.platform}
      primaryHref="/portal/platform"
      primaryLabel="Open Platform Dashboard"
    >
      <ProductAccessStatusPanel session={session} stateMeta={state.meta} />
      <CustomerCommsLaunchpad session={session} title="Launch enabled operations communications lanes" />

      <div style={{ marginBottom: 24 }}>
        <CustomerPlanSummaryPanel session={session} title="Operations pipeline customer plan summary" />
      </div>

      <div style={{ ...cardStyle, marginBottom: 24, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Canonical SaaS pathway depth</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>FCA now models real contractor execution stages instead of generic feature buckets</h2>
        <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 0 }}>
          Each stage below ties a live route, accountable owner, expected outcome, and named artifacts to the same authenticated workspace shell.
        </p>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {operationsPipeline.stages.map((stage, index) => (
          <section key={stage.key} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
              <div>
                <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>Stage {index + 1}</div>
                <h2 style={{ marginTop: 0, marginBottom: 8 }}>{stage.title}</h2>
                <div style={{ color: "#475569", lineHeight: 1.7 }}>
                  <div><strong>Owner:</strong> {stage.owner}</div>
                  <div><strong>Route:</strong> <a href={stage.primaryRoute} style={{ color: "#1d4ed8", textDecoration: "none", fontWeight: 700 }}>{stage.primaryLabel}</a></div>
                </div>
              </div>
              <div style={{ maxWidth: 420, color: "#334155", lineHeight: 1.7 }}>
                <strong>Outcome</strong>
                <div>{stage.outcome}</div>
              </div>
            </div>
            <div>
              <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Expected artifacts</div>
              <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#334155", marginTop: 0, marginBottom: 0 }}>
                {stage.artifacts.map((artifact) => (
                  <li key={artifact}>{artifact}</li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Operations command deck</h2>
        <PublicCtaRow actions={operationsPipeline.commandDeck} />
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Continue through FCA</h2>
        <PublicCtaRow actions={publicBodyCtaSets.portalEntry} />
      </div>
    </PortalShell>
  );
}
