import { useEffect, useState } from "react";
import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import FounderJourneyStrip from "../../components/FounderJourneyStrip";
import PublicActionRail from "../../components/PublicActionRail";
import PublicCtaRow from "../../components/PublicCtaRow";
import PublicOperationsStrip from "../../components/PublicOperationsStrip";
import CustomerSessionBar from "../../components/CustomerSessionBar";
import CustomerProductLaunchpad from "../../components/CustomerProductLaunchpad";
import CustomerCommsLaunchpad from "../../components/CustomerCommsLaunchpad";
import { resolveWorkspaceEntryHref } from "../../customerSession";
import { navigateTo } from "../../navigation";
import useCustomerSession from "../../hooks/useCustomerSession";
import { founderJourneyCtaSets, pricingTiers, publicBodyCtaSets, shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { resolvePlanPreset } from "../../pricingPlans";
import { cardStyle, heroCardStyle, pageShellStyle, responsiveGrid, twoColumnGridStyle } from "../../publicShellStyles";

const fieldStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  marginTop: 8,
  marginBottom: 16,
  boxSizing: "border-box",
};

const moduleStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 14,
  background: "#f8fafc",
};

const productAccessGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  marginBottom: 16,
};

const productOptionStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 12,
  padding: 14,
  background: "#f8fafc",
};

const submitButtonStyle = {
  textDecoration: "none",
  background: "#111827",
  color: "#fff",
  padding: "12px 16px",
  borderRadius: 10,
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
};

const loginContinuityItems = [
  {
    label: "Entry flow",
    value: "Login now inherits shell continuity",
    detail: "Workspace entry now carries the same operating strip used across the public shell so the handoff into product state feels deliberate.",
  },
  {
    label: "Post-login path",
    value: "Portal, platform, academy, and comms remain visible",
    detail: "The route now keeps downstream workspace destinations obvious before entry rather than hiding the next move behind a generic form feel.",
  },
  {
    label: "Conversion posture",
    value: "Operational walkthrough remains active",
    detail: "This route still supports workspace entry while keeping live dashboard review, comms routing, and rollout guidance accessible.",
  },
];

const productAccessOptions = [
  {
    key: "saas",
    title: "SaaS workspace",
    detail: "Projects, bids, files, messages, billing, support, and admin continuity inside the construction workspace.",
  },
  {
    key: "lms",
    title: "Academy / LMS",
    detail: "Workforce onboarding, safety readiness, and field training continuity inside the same customer shell.",
  },
  {
    key: "auricrux",
    title: "Auricrux guidance",
    detail: "Guided next actions, blocker visibility, and executive continuity across the customer's operating surfaces.",
  },
];

const commsOptions = [
  { key: "chat", title: "Chat", detail: "Text-first coordination across customer, project, and operator lanes." },
  { key: "sms", title: "SMS", detail: "Short-form field escalation and fast customer recovery." },
  { key: "phone", title: "Phone", detail: "Urgent live coordination and issue resolution." },
  { key: "email", title: "Email", detail: "Commercial, billing, and document continuity." },
  { key: "teams", title: "Teams", detail: "Structured collaboration across internal and external operations." },
  { key: "conference", title: "Conference", detail: "Executive and project multi-party review sessions." },
  { key: "lecture", title: "Lecture", detail: "Academy-led instruction and rollout delivery." },
];

export default function Login({ requestedPath = "/portal/platform", accessMode = "direct" }) {
  const { session, isAuthenticated, login, logout } = useCustomerSession();
  const initialPlan = session?.selectedPlan || "startup";
  const initialPreset = resolvePlanPreset(initialPlan);
  const [form, setForm] = useState({
    email: session?.email || "workspace@futurecontractorsofamerica.com",
    company: session?.company || "Future Contractors of America Pilot Workspace",
    role: session?.role || "Owner / Admin",
    selectedPlan: initialPlan,
    enabledProducts: session?.enabledProducts || initialPreset.enabledProducts,
    enabledComms: session?.enabledComms || initialPreset.enabledComms,
  });
  const [provisioningMode, setProvisioningMode] = useState(session?.enabledProducts ? "custom" : "plan-defaults");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;
    const planKey = session.selectedPlan || "startup";
    const planPreset = resolvePlanPreset(planKey);
    setForm({
      email: session.email || "workspace@futurecontractorsofamerica.com",
      company: session.company || "Future Contractors of America Pilot Workspace",
      role: session.role || "Owner / Admin",
      selectedPlan: planKey,
      enabledProducts: session.enabledProducts || planPreset.enabledProducts,
      enabledComms: session.enabledComms || planPreset.enabledComms,
    });
    setProvisioningMode("custom");
  }, [session]);

  const requestedWorkspaceHref = accessMode === "protected" ? requestedPath : session?.nextHref || "/portal/platform";
  const nextHref = requestedWorkspaceHref?.startsWith("/portal") || requestedWorkspaceHref === "/academy"
    ? requestedWorkspaceHref
    : "/portal/platform";
  const liveEntryDetail = accessMode === "protected"
    ? `Customer login is now required to enter ${requestedPath}. Auricrux is preserving continuity so the user lands inside the requested live workspace surface after authentication.`
    : "This route carries the same visual rhythm as the rest of the public shell while keeping the clearest next step focused on entering the FCA workspace, reviewing the platform dashboard, continuing into live construction operations, and routing through the right communications lanes.";

  function handleRoleChange(role) {
    setForm((prev) => ({ ...prev, role }));
  }

  function handlePlanChange(planKey) {
    const planPreset = resolvePlanPreset(planKey);
    setForm((prev) => ({
      ...prev,
      selectedPlan: planKey,
      enabledProducts: provisioningMode === "plan-defaults" ? planPreset.enabledProducts : prev.enabledProducts,
      enabledComms: provisioningMode === "plan-defaults" ? planPreset.enabledComms : prev.enabledComms,
    }));
  }

  function handleProvisioningModeChange(mode) {
    setProvisioningMode(mode);
    if (mode === "plan-defaults") {
      const planPreset = resolvePlanPreset(form.selectedPlan);
      setForm((prev) => ({
        ...prev,
        enabledProducts: planPreset.enabledProducts,
        enabledComms: planPreset.enabledComms,
      }));
    }
  }

  function handleProductToggle(productKey) {
    setProvisioningMode("custom");
    setForm((prev) => ({
      ...prev,
      enabledProducts: {
        ...prev.enabledProducts,
        [productKey]: !prev.enabledProducts[productKey],
      },
    }));
  }

  function handleCommsToggle(channelKey) {
    setProvisioningMode("custom");
    setForm((prev) => ({
      ...prev,
      enabledComms: {
        ...prev.enabledComms,
        [channelKey]: !prev.enabledComms[channelKey],
      },
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = login({
      email: form.email,
      company: form.company,
      role: form.role,
      nextHref,
      selectedPlan: form.selectedPlan,
      enabledProducts: form.enabledProducts,
      enabledComms: form.enabledComms,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError("");
    navigateTo(resolveWorkspaceEntryHref(result.session, nextHref));
  }

  function handleResetSession() {
    logout();
    navigateTo("/login");
  }

  const enabledProductCount = Object.values(form.enabledProducts).filter(Boolean).length;
  const enabledCommsCount = Object.values(form.enabledComms).filter(Boolean).length;
  const selectedPlanPreset = resolvePlanPreset(form.selectedPlan);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Arial", padding: 24 }}>
      <div style={pageShellStyle}>
        <ShellHeader
          eyebrow="Auricrux Guided Entry"
          title="Access FCA Workspace"
          subtitle="This workspace entry routes customers into the unified FCA shell for estimating visibility, project delivery, document control, billing follow-through, academy continuity, communications routing, and guided next steps."
          primaryHref={shellHeaderCtaSets.workspace.primaryHref}
          primaryLabel={shellHeaderCtaSets.workspace.primaryLabel}
          secondaryHref={shellHeaderCtaSets.workspace.secondaryHref}
          secondaryLabel={shellHeaderCtaSets.workspace.secondaryLabel}
          journey={shellJourney}
          currentJourney="workspace"
        />

        <CustomerSessionBar requestedPath={nextHref} mode="login" />
        <CustomerProductLaunchpad session={session} title="Launch real customer product after login" />
        <CustomerCommsLaunchpad session={session} title="Launch real customer communications lanes" />

        <div style={{ ...heroCardStyle, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Workspace continuity</div>
              <h2 style={{ marginTop: 0, marginBottom: 10 }}>Entry now feels like part of the product experience</h2>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              <FcaBrandMark compact />
              <AuricruxBrandMark compact />
            </div>
          </div>
          <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 0 }}>
            {liveEntryDetail}
          </p>
          <PublicCtaRow actions={publicBodyCtaSets.loginWorkspace} />
        </div>

        <FounderJourneyStrip
          currentJourney="workspace"
          title="Workspace login is part of one connected customer journey"
          detail="Login is not a dead-end form. It is the bridge from public entry into portal continuity, academy readiness, estimating control, communications routing, and rollout planning."
          ctaHref={founderJourneyCtaSets.workspace.href}
          ctaLabel={founderJourneyCtaSets.workspace.label}
        />

        <div style={{ marginBottom: 24 }}>
          <PublicOperationsStrip
            eyebrow="Workspace continuity strip"
            title="Login now behaves like a guided handoff into the working shell"
            detail="The entry route now shares the same continuity strip used across the public conversion shell so customers can see the operating path before entering FCA."
            statusLabel="Entry posture"
            statusValue="Workspace handoff active"
            items={loginContinuityItems}
            primaryHref={isAuthenticated ? nextHref : "/login"}
            primaryLabel={isAuthenticated ? "Open Active Workspace" : "Open Login Portal"}
            secondaryHref="/portal/messages"
            secondaryLabel="Open Comms Workspace"
          />
        </div>

        <div style={twoColumnGridStyle}>
          <form style={cardStyle} onSubmit={handleSubmit}>
            <label>Work Email</label>
            <input
              style={fieldStyle}
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />

            <label>Company</label>
            <input
              style={fieldStyle}
              value={form.company}
              onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
            />

            <label>Workspace Role</label>
            <select style={fieldStyle} value={form.role} onChange={(event) => handleRoleChange(event.target.value)}>
              <option>Owner / Admin</option>
              <option>Estimator</option>
              <option>Project Coordinator</option>
              <option>Superintendent</option>
              <option>Accounting</option>
              <option>Field Operations</option>
            </select>

            <label>Customer Plan</label>
            <select style={fieldStyle} value={form.selectedPlan} onChange={(event) => handlePlanChange(event.target.value)}>
              {pricingTiers.map((tier) => (
                <option key={tier.name} value={tier.name.toLowerCase().split(" ")[0]}>
                  {tier.name} · {tier.price}
                </option>
              ))}
            </select>

            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Plan activation posture</div>
            <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
              The selected plan now governs the default products and communications this customer receives on first login. Choose plan defaults for honest commercial-to-product enforcement, or customize access if the rollout requires an exception.
            </div>
            <div style={{ ...productOptionStyle, marginBottom: 16, background: "#eff6ff" }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{selectedPlanPreset.name}</div>
              <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 8 }}>Price: {selectedPlanPreset.price}</div>
              <div style={{ color: "#475569", lineHeight: 1.7 }}>Billing model: {selectedPlanPreset.billingModel}</div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => handleProvisioningModeChange("plan-defaults")}
                style={{
                  ...submitButtonStyle,
                  background: provisioningMode === "plan-defaults" ? "#1d4ed8" : "#e2e8f0",
                  color: provisioningMode === "plan-defaults" ? "#fff" : "#0f172a",
                }}
              >
                Use Plan Defaults
              </button>
              <button
                type="button"
                onClick={() => handleProvisioningModeChange("custom")}
                style={{
                  ...submitButtonStyle,
                  background: provisioningMode === "custom" ? "#111827" : "#e2e8f0",
                  color: provisioningMode === "custom" ? "#fff" : "#0f172a",
                }}
              >
                Customize Access
              </button>
            </div>

            <div style={{ color: "#475569", lineHeight: 1.6, marginBottom: 12 }}>
              {provisioningMode === "plan-defaults"
                ? `Plan defaults are active for ${selectedPlanPreset.name}.`
                : "Custom provisioning is active. Toggle the exact product layers and channels this customer should receive on first login."}
            </div>

            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Customer product provisioning</div>
            <div style={productAccessGridStyle}>
              {productAccessOptions.map((product) => {
                const enabled = form.enabledProducts[product.key];
                return (
                  <label key={product.key} style={{ ...productOptionStyle, background: enabled ? "#eff6ff" : "#f8fafc", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, color: "#111827" }}>{product.title}</div>
                      <input type="checkbox" checked={enabled} onChange={() => handleProductToggle(product.key)} />
                    </div>
                    <div style={{ color: "#475569", lineHeight: 1.6, marginBottom: 8 }}>{product.detail}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: enabled ? "#1d4ed8" : "#64748b" }}>
                      {enabled ? "Enabled for first login" : "Held back until enabled"}
                    </div>
                  </label>
                );
              })}
            </div>

            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Communications provisioning</div>
            <div style={productAccessGridStyle}>
              {commsOptions.map((channel) => {
                const enabled = form.enabledComms[channel.key];
                return (
                  <label key={channel.key} style={{ ...productOptionStyle, background: enabled ? "#ecfeff" : "#f8fafc", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, color: "#111827" }}>{channel.title}</div>
                      <input type="checkbox" checked={enabled} onChange={() => handleCommsToggle(channel.key)} />
                    </div>
                    <div style={{ color: "#475569", lineHeight: 1.6, marginBottom: 8 }}>{channel.detail}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: enabled ? "#0f766e" : "#64748b" }}>
                      {enabled ? "Enabled for first login" : "Held back until enabled"}
                    </div>
                  </label>
                );
              })}
            </div>

            <div style={{ color: "#475569", lineHeight: 1.6, marginBottom: 12 }}>
              This live customer session preserves Auricrux continuity and routes directly into {nextHref}. {enabledProductCount} product surface{enabledProductCount === 1 ? " is" : "s are"} currently enabled for first entry and {enabledCommsCount} communications lane{enabledCommsCount === 1 ? " is" : "s are"} available in the comms workspace.
            </div>

            {error ? <div style={{ color: "#b91c1c", marginBottom: 12, fontWeight: 700 }}>{error}</div> : null}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <button type="submit" style={submitButtonStyle}>Open Live Customer Workspace</button>
              {isAuthenticated ? (
                <>
                  <a href={nextHref} style={{ ...submitButtonStyle, textDecoration: "none" }}>Open Active Workspace</a>
                  <button type="button" onClick={handleResetSession} style={{ ...submitButtonStyle, background: "#f8fafc", color: "#111827", border: "1px solid #cbd5e1" }}>
                    Reset Session
                  </button>
                </>
              ) : null}
            </div>

            <PublicCtaRow actions={publicBodyCtaSets.loginWorkspace} style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }} />
          </form>

          <div style={{ display: "grid", gap: 16 }}>
            <WorkspaceSnapshotCard
              title="Workspace continuity before login"
              detail="Customers can see that tenant, project, and Auricrux state already exist before entering the portal, reinforcing one continuous operating shell."
              ctaHref="/login"
              ctaLabel="Open Login Portal"
            />

            <div style={{ ...cardStyle, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" }}>
              <h2 style={{ marginTop: 0 }}>What opens after entry</h2>
              <div style={responsiveGrid(180)}>
                {[
                  ["SaaS Workspace", "Projects, bids, files, messages, billing, support, and admin continuity"],
                  ["Platform Dashboard", "Executive summary across project state, blockers, and next actions"],
                  ["Academy / LMS", "Workforce training, safety readiness, and field continuity"],
                  ["Auricrux", "Guided next actions, blocker visibility, and continuity across all routes"],
                  ["Document Control", "Permit sets, RFIs, submittals, and onboarding docs"],
                  ["Revenue Flow", "Invoice readiness, retainage, and commercial follow-through"],
                  ["Comms Control", "Chat, SMS, phone, email, Teams, conference, and lecture routing"],
                ].map(([title, detail]) => (
                  <div key={title} style={moduleStyle}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
                    <div style={{ color: "#4b5563", lineHeight: 1.5 }}>{detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <PublicActionRail
          title="Continue into the FCA workspace"
          detail="Login closes with the same shared action rail as the other public routes so workspace entry, platform state, academy continuity, communications routing, and walkthrough options remain consistently visible."
        />

        <ShellFooter />
      </div>
    </div>
  );
}
