import { useEffect } from "react";
import PortalShell from "../../components/PortalShell";
import PublicOperationsStrip from "../../components/PublicOperationsStrip";
import SystemStateSummary from "../../components/SystemStateSummary";
import PublicCtaRow from "../../components/PublicCtaRow";
import CustomerPlanSummaryPanel from "../../components/CustomerPlanSummaryPanel";
import BillingActionCenter from "../../components/BillingActionCenter";
import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useCustomerSession from "../../hooks/useCustomerSession";
import { portalNarrativeCtaSets } from "../../websiteShell";
import { billingGovernance } from "../../billingGovernance";
import { portalBilling, routeStateOverlays } from "../../systemState";
import { resolvePlanPreset } from "../../pricingPlans";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const continuityCardStyle = {
  ...cardStyle,
  background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)",
  border: "1px solid #e5d3a1",
};

const invoiceStyle = {
  display: "grid",
  gridTemplateColumns: "1.1fr 1fr 1fr 1fr",
  gap: 12,
  padding: "14px 0",
  borderBottom: "1px solid #e5e7eb",
  alignItems: "center",
};

const billingContinuityItems = [
  {
    label: "Revenue signal",
    value: "Invoices stay tied to next actions",
    detail: "Billing now reads as part of the same operating state that drives workspace, project, and communication follow-through.",
  },
  {
    label: "Customer continuity",
    value: "Plan and pricing remain connected",
    detail: "Commercial review can move from internal billing posture back to pricing and founder rollout review without narrative drift.",
  },
  {
    label: "Training link",
    value: "Academy readiness remains visible",
    detail: "Billing stays linked to learner assignment so revenue and onboarding continuity remain aligned.",
  },
  {
    label: "Lifecycle revenue",
    value: "Service and referrals can become billable follow-through",
    detail: "Billing now reinforces recurring maintenance, warranty response, and referral-driven growth as governed commercial continuity rather than separate side activity.",
  },
];

export default function PortalBilling() {
  const { state, refreshSyncStamp } = useWorkspaceState();
  const { session, applyPlanPreset, setProductAccess, setCommsAccess } = useCustomerSession();

  useEffect(() => {
    refreshSyncStamp("Persisted billing continuity state active");
  }, [refreshSyncStamp]);

  const selectedPlan = resolvePlanPreset(session?.selectedPlan || "startup");

  return (
    <PortalShell
      title="Billing and Account Continuity"
      subtitle="Billing surface tied to the same tenant, project, message, Auricrux, and plan-activation state as the rest of the FCA workspace, with construction revenue controls and one-click billing actions kept visible."
      activeHref="/portal/billing"
      currentJourney="finance"
      routeOverlay={routeStateOverlays.billing}
      primaryHref="/portal/admin"
      primaryLabel="Open Admin"
    >
      <div style={{ marginBottom: 24 }}>
        <SystemStateSummary
          tenant={state.tenant}
          project={state.project}
          workspace={state.workspace}
          auricrux={state.auricrux}
          title="Billing now reads from the live workspace state"
          detail="Revenue continuity is now sourced from the same shared tenant, project, next-action, blocker, selected-plan, warranty, and referral modules as the other portal routes."
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <CustomerPlanSummaryPanel session={session} title="Billing-aligned customer plan summary" />
      </div>

      <div style={{ marginBottom: 24 }}>
        <BillingActionCenter
          session={session}
          state={state}
          applyPlanPreset={applyPlanPreset}
          setProductAccess={setProductAccess}
          setCommsAccess={setCommsAccess}
          refreshSyncStamp={refreshSyncStamp}
        />
      </div>

      <CommercialContinuityFeed title="Billing and commercial continuity feed" detail="Recent plan promotions, workspace activations, product/comms repairs, recurring-service posture changes, and revenue-shaping mutations remain visible here so billing can operate as part of one durable commercial system." />

      <div style={{ marginBottom: 24 }}>
        <PublicOperationsStrip
          eyebrow="Billing continuity strip"
          title="Billing now stays connected to the public conversion shell"
          detail="The same continuity pattern used on platform, pricing, and contact now extends into billing so commercial posture remains coherent across public and portal routes, including recurring service and referral-safe growth."
          statusLabel="Billing posture"
          statusValue="Commercial follow-through active"
          items={billingContinuityItems}
          primaryHref="/pricing"
          primaryLabel="Plans & Rollout"
          secondaryHref="/contact"
          secondaryLabel="Open Contact & Rollout"
        />
      </div>

      <div style={{ ...cardStyle, marginBottom: 24, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Persisted billing state</div>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Source:</strong> {state.meta.backingSource}</div>
          <div><strong>Status:</strong> {state.meta.persistenceState}</div>
          <div><strong>Last sync:</strong> {state.meta.lastSyncedAt || "Pending initial sync"}</div>
          <div><strong>Authenticated customer:</strong> {state.meta.authenticatedCustomer || "Continuity shell visitor"}</div>
          <div><strong>Selected plan:</strong> {selectedPlan.name}</div>
          <div><strong>Billing model:</strong> {selectedPlan.billingModel}</div>
          <div><strong>Commercial packaging:</strong> {selectedPlan.price}</div>
        </div>
      </div>

      <div style={{ ...continuityCardStyle, marginBottom: 24 }}>
        <div style={{ color: "#8a6a14", fontWeight: 700, marginBottom: 8 }}>Revenue continuity focus</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Billing now echoes the same approval, plan, training, warranty, and referral state as the rest of the shell</h2>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Revenue blocker:</strong> {state.auricrux.currentBlocker}</div>
          <div><strong>Business impact:</strong> {state.auricrux.blockerImpact}</div>
          <div><strong>Commercial next step:</strong> Convert {state.workspace.currentNextAction.toLowerCase()} into invoice follow-through under the {selectedPlan.name} plan.</div>
          <div><strong>Training continuity:</strong> Billing remains tied to learner assignment so onboarding and revenue stay visible together.</div>
          <div><strong>Lifecycle expansion:</strong> Recurring maintenance, service response, and advocacy-safe follow-through are now treated as part of the commercial picture.</div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Billing governance layer</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>FCA now models revenue continuity as a governed product layer</h2>
        <div style={{ display: "grid", gap: 16 }}>
          {billingGovernance.lanes.map((lane) => (
            <div key={lane.title} style={{ border: "1px solid #dbe3ef", borderRadius: 14, padding: 16, background: "#f8fbff" }}>
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>{lane.title}</h3>
              <p style={{ color: "#334155", lineHeight: 1.7 }}>{lane.purpose}</p>
              <a href={lane.route} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>{lane.label}</a>
              <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#334155", marginTop: 10, marginBottom: 0 }}>
                {lane.artifacts.map((artifact) => (
                  <li key={artifact}>{artifact}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16 }}>
            <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Revenue signals</div>
            <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#334155", marginTop: 0 }}>
              {billingGovernance.revenueSignals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          </div>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16 }}>
            <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Conversion links</div>
            <PublicCtaRow actions={billingGovernance.conversionLinks} />
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Billing queue</h2>
        <div style={{ color: "#6b7280", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          <div style={invoiceStyle}>
            <div>Invoice</div>
            <div>Customer</div>
            <div>Amount</div>
            <div>Status</div>
          </div>
        </div>
        {portalBilling.map((invoice) => (
          <div key={invoice.invoice} style={{ borderBottom: "1px solid #e5e7eb", padding: "14px 0" }}>
            <div style={invoiceStyle}>
              <div style={{ fontWeight: 700 }}>{invoice.invoice}</div>
              <div>{invoice.customer}</div>
              <div>{invoice.amount}</div>
              <div>{invoice.status}</div>
            </div>
            <div style={{ color: "#0f172a", lineHeight: 1.7, marginTop: 6 }}>
              <div><strong>Billing basis:</strong> {invoice.billingBasis}</div>
              <div><strong>Retainage:</strong> {invoice.retainage}</div>
              <div><strong>Aging:</strong> {invoice.aging}</div>
              <div><strong>Owner:</strong> {invoice.owner}</div>
            </div>
            <div style={{ color: "#475569", marginTop: 8 }}>
              <strong>Next action:</strong> {invoice.nextAction}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Recurring service revenue lane</h2>
          <p style={{ lineHeight: 1.7, marginBottom: 12, color: "#4b5563" }}>
            Billing now reinforces post-handover service and maintenance as a governed expansion path instead of treating delivery as the commercial finish line.
          </p>
          <a href="/warranty" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>Open Warranty Continuity</a>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Referral-driven revenue lane</h2>
          <p style={{ lineHeight: 1.7, marginBottom: 12, color: "#4b5563" }}>
            Customer advocacy and review-safe follow-through are now framed as part of revenue continuity so finished work can re-enter the pipeline intentionally.
          </p>
          <a href="/referrals" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>Open Referral Continuity</a>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 16, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Why billing belongs in the same shell</h2>
          <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
            Billing is not just accounting. In FCA it stays tied to project progress, pay-app backup, document readiness,
            owner approvals, customer communications, plan activation, training completion, warranty retention, and referral-driven follow-through so commercial continuity remains visible.
          </p>
          <PublicCtaRow actions={portalNarrativeCtaSets.billingNarrative} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }} />
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Current billing posture</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.9, marginBottom: 0 }}>
            <li>Current customer plan: {selectedPlan.name}.</li>
            <li>Commercial packaging: {selectedPlan.price}.</li>
            <li>Billing model: {selectedPlan.billingModel}.</li>
            <li>Auricrux continues monitoring account follow-through.</li>
            <li>Recurring service and referral growth are now included in the lifecycle revenue story.</li>
          </ul>
        </div>
      </div>
    </PortalShell>
  );
}
