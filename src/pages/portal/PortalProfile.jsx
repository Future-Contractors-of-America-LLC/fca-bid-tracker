import { useEffect } from "react";
import PortalShell from "../../components/PortalShell";
import SystemStateSummary from "../../components/SystemStateSummary";
import CustomerProductLaunchpad from "../../components/CustomerProductLaunchpad";
import CustomerCommsLaunchpad from "../../components/CustomerCommsLaunchpad";
import useCustomerSession from "../../hooks/useCustomerSession";
import useCustomerAuthState from "../../hooks/useCustomerAuthState";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import { routeStateOverlays } from "../../systemState";
import { pricingPlanOptions } from "../../pricingPlans";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const accessCardStyle = {
  ...cardStyle,
  display: "grid",
  gap: 12,
};

const toggleButtonStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
  background: "#f8fafc",
  color: "#0f172a",
};

const planButtonStyle = (active) => ({
  border: active ? "1px solid #1d4ed8" : "1px solid #cbd5e1",
  borderRadius: 12,
  padding: 14,
  background: active ? "#eff6ff" : "#fff",
  color: "#0f172a",
  cursor: "pointer",
  textAlign: "left",
  font: "inherit",
});

const commsCards = [
  { key: "chat", title: "Chat", description: "Text-first coordination across customer, project, and operator lanes.", href: "/portal/messages#chat", ctaLabel: "Open Chat Lane" },
  { key: "sms", title: "SMS", description: "Short-form field escalation and rapid customer recovery.", href: "/portal/messages#sms", ctaLabel: "Open SMS Lane" },
  { key: "phone", title: "Phone", description: "Urgent live coordination and issue resolution.", href: "/portal/messages#phone", ctaLabel: "Open Phone Lane" },
  { key: "email", title: "Email", description: "Commercial, billing, and document continuity.", href: "/portal/messages#email", ctaLabel: "Open Email Lane" },
  { key: "teams", title: "Teams", description: "Structured collaboration across internal and external operations.", href: "/portal/messages#teams", ctaLabel: "Open Teams Lane" },
  { key: "conference", title: "Conference", description: "Executive and project multi-party review sessions.", href: "/portal/messages#conference", ctaLabel: "Open Conference Lane" },
  { key: "lecture", title: "Lecture", description: "Academy-led instruction and rollout delivery.", href: "/portal/messages#lecture", ctaLabel: "Open Lecture Lane" },
];

function resolveLaunchReadiness(accountSource, authBoundary) {
  if (authBoundary?.productionAuthReady) return "Connected to your account";
  if (accountSource === "api") return "Connected to your account";
  if (accountSource === "local-fallback") return "Demo workspace active";
  return "Workspace active";
}

export default function PortalProfile() {
  const { session, isAuthenticated, setProductAccess, setCommsAccess, applyPlanPreset } = useCustomerSession();
  const { state, refreshSyncStamp } = useWorkspaceState();
  const { state: authState, meta: authMeta } = useCustomerAuthState();

  useEffect(() => {
    refreshSyncStamp("Persisted customer profile state active");
  }, [refreshSyncStamp]);

  const sessionCompany = session?.company || state.tenant.name;
  const sessionEmail = session?.email || state.meta.customerSessionEmail || "workspace@futurecontractorsofamerica.com";
  const sessionWorkspace = session?.workspaceLabel || state.meta.customerWorkspaceLabel || `${sessionCompany} Workspace`;
  const sessionLogin = session?.lastLoginAt || state.meta.lastSyncedAt || "Pending first authenticated entry";
  const workspaceRole = session?.role || "Owner / Admin";
  const enabledProducts = session?.enabledProducts || { saas: true, lms: true, auricrux: true };
  const enabledComms = session?.enabledComms || { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true };
  const customerId = session?.customerId || "CUST-FCA-LIVE-001";
  const selectedPlan = session?.selectedPlan || "startup";
  const accountSource = session?.accountSource || "workspace-shell";
  const launchReadiness = resolveLaunchReadiness(accountSource, authState.authBoundary);

  function toggleProduct(productKey, enabled) {
    setProductAccess(productKey, !enabled);
  }

  function toggleComms(channelKey, enabled) {
    setCommsAccess(channelKey, !enabled);
  }

  function handlePlanPreset(planKey) {
    applyPlanPreset(planKey);
  }

  const productCards = [
    {
      key: "saas",
      title: "SaaS access",
      description: "Portal workspace, platform dashboard, bids, files, messages, billing, support, and admin.",
      href: "/portal/platform",
      ctaLabel: "Open SaaS Workspace",
      enabled: enabledProducts.saas,
    },
    {
      key: "lms",
      title: "LMS access",
      description: "Academy continuity, onboarding tracks, safety readiness, and workforce coaching.",
      href: "/academy",
      ctaLabel: "Open Academy / LMS",
      enabled: enabledProducts.lms,
    },
    {
      key: "auricrux",
      title: "Auricrux access",
      description: "Guided next actions, blocker visibility, and continuity across all customer-facing routes.",
      href: "/portal/auricrux",
      ctaLabel: "Open Auricrux",
      enabled: enabledProducts.auricrux,
    },
  ];

  return (
    <PortalShell
      title="Customer Identity and Workspace Profile"
      subtitle="Account identity, plan access, and communication preferences."
      activeHref="/portal/profile"
      currentJourney="lead"
      routeOverlay={routeStateOverlays.overview}
      primaryHref="/portal/platform"
      primaryLabel="Open Platform Dashboard"
    >
      <div style={{ marginBottom: 16 }}>
        <SystemStateSummary
          tenant={state.tenant}
          project={state.project}
          workspace={state.workspace}
          auricrux={state.auricrux}
          title="Customer profile now reads from the live authenticated workspace"
          detail="This profile route binds session identity, tenant continuity, project state, Auricrux guidance, plan activation, launch posture, and communications access into one customer-facing operating surface."
        />
      </div>

      <CustomerProductLaunchpad session={session} title="Launch real customer product access" />
      <CustomerCommsLaunchpad session={session} title="Launch real communications access" />

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Persisted profile state</div>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Source:</strong> {state.meta.backingSource}</div>
          <div><strong>Status:</strong> {state.meta.persistenceState}</div>
          <div><strong>Last sync:</strong> {state.meta.lastSyncedAt || "Pending initial sync"}</div>
          <div><strong>Authenticated customer:</strong> {state.meta.authenticatedCustomer || "Continuity shell visitor"}</div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)", border: "1px solid #e5d3a1" }}>
        <div style={{ color: "#8a6a14", fontWeight: 700, marginBottom: 8 }}>Authentication truth boundary</div>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Production auth ready:</strong> {authState.authBoundary?.productionAuthReady ? "Yes" : "No"}</div>
          <div><strong>Active mode:</strong> {authState.authBoundary?.activeMode || "Unknown"}</div>
          <div><strong>Identity provider:</strong> {authState.authBoundary?.identityProvider || "Unknown"}</div>
          <div><strong>Validation:</strong> {authState.authBoundary?.sessionValidation || "Unknown"}</div>
          <div><strong>Status message:</strong> {authState.message}</div>
          <div><strong>Auth state source:</strong> {authMeta.backingSource}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 16 }}>
        <div style={cardStyle}>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Authenticated customer profile</div>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>{sessionWorkspace}</h2>
          <div style={{ color: "#475569", lineHeight: 1.8 }}>
            <div><strong>Customer company:</strong> {sessionCompany}</div>
            <div><strong>Customer ID:</strong> {customerId}</div>
            <div><strong>Customer email:</strong> {sessionEmail}</div>
            <div><strong>Workspace role:</strong> {workspaceRole}</div>
            <div><strong>Selected plan:</strong> {selectedPlan}</div>
            <div><strong>Account source:</strong> {accountSource}</div>
            <div><strong>Launch readiness:</strong> {launchReadiness}</div>
            <div><strong>Session status:</strong> {isAuthenticated ? "Signed in" : "Workspace active"}</div>
            <div><strong>Last login:</strong> {sessionLogin}</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ color: "#8a6a14", fontWeight: 700, marginBottom: 8 }}>Auricrux continuity signal</div>
          <div style={{ color: "#475569", lineHeight: 1.8 }}>
            <div><strong>Next action:</strong> {state.workspace.currentNextAction}</div>
            <div><strong>Current blocker:</strong> {state.auricrux.currentBlocker}</div>
            <div><strong>Recommended move:</strong> {state.auricrux.nextRecommendedAction}</div>
            <div><strong>Project spine:</strong> {state.project.id} · {state.project.stage}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)" }}>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Plan-aware customer activation</div>
          <div style={{ color: "#475569", lineHeight: 1.8, marginBottom: 14 }}>
            Apply a plan preset here to enforce commercial-to-product continuity. Plan selection now changes the authenticated customer's default products and communication lanes instead of remaining a website-only promise.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {pricingPlanOptions.map((plan) => (
              <button key={plan.key} type="button" onClick={() => handlePlanPreset(plan.key)} style={planButtonStyle(selectedPlan === plan.key)}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{plan.name}</div>
                <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 6 }}>{plan.price}</div>
                <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700 }}>{plan.billingModel}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)" }}>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Live customer product controls</div>
          <div style={{ color: "#475569", lineHeight: 1.8 }}>
            This profile now controls real access across SaaS workspace, Academy / LMS, Auricrux, and communications. Toggle a product or channel here to verify that login continuity, launch surfaces, and route protection stay honest to the authenticated customer session.
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 16 }}>
          {productCards.map((product) => (
            <div key={product.key} style={accessCardStyle}>
              <div>
                <div style={{ color: "#6b7280" }}>{product.title}</div>
                <div style={{ fontSize: 22, fontWeight: 700, margin: "6px 0" }}>{product.enabled ? "Enabled" : "Pending"}</div>
                <div style={{ color: "#475569", lineHeight: 1.7 }}>{product.description}</div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a
                  href={product.enabled ? product.href : "/portal/profile"}
                  style={{
                    textDecoration: "none",
                    background: product.enabled ? "#111827" : "#cbd5e1",
                    color: product.enabled ? "#fff" : "#475569",
                    padding: "10px 14px",
                    borderRadius: 10,
                    fontWeight: 700,
                  }}
                >
                  {product.enabled ? product.ctaLabel : `${product.ctaLabel} Unavailable`}
                </a>
                <button type="button" onClick={() => toggleProduct(product.key, product.enabled)} style={toggleButtonStyle}>
                  {product.enabled ? "Disable Access" : "Enable Access"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {commsCards.map((channel) => {
            const enabled = enabledComms[channel.key] !== false;
            return (
              <div key={channel.key} style={accessCardStyle}>
                <div>
                  <div style={{ color: "#6b7280" }}>{channel.title}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, margin: "6px 0" }}>{enabled ? "Enabled" : "Pending"}</div>
                  <div style={{ color: "#475569", lineHeight: 1.7 }}>{channel.description}</div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a
                    href={enabled ? channel.href : "/portal/profile"}
                    style={{
                      textDecoration: "none",
                      background: enabled ? "#0f766e" : "#cbd5e1",
                      color: enabled ? "#fff" : "#475569",
                      padding: "10px 14px",
                      borderRadius: 10,
                      fontWeight: 700,
                    }}
                  >
                    {enabled ? channel.ctaLabel : `${channel.ctaLabel} Unavailable`}
                  </a>
                  <button type="button" onClick={() => toggleComms(channel.key, enabled)} style={toggleButtonStyle}>
                    {enabled ? "Disable Lane" : "Enable Lane"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Why this route matters</h2>
        <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: 0 }}>
          The profile icon now has a real destination inside the product. Instead of routing customers into a dead-end account stub,
          this surface confirms who is signed in, what workspace they control, what project spine is active, what role they hold in the construction workflow,
          what product layers they can access, what communications lanes are enabled, what plan they are on, what account source is active, and what Auricrux says should happen next.
        </p>
      </div>
    </PortalShell>
  );
}
