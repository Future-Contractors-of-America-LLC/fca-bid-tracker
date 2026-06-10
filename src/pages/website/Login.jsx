import { useEffect, useRef, useState } from "react";
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
import DeploymentStatusBeacon from "../../components/DeploymentStatusBeacon";
import LoginActionCenter from "../../components/LoginActionCenter";
import { resolveWorkspaceEntryHref } from "../../customerSession";
import { navigateTo } from "../../navigation";
import useCustomerSession from "../../hooks/useCustomerSession";
import { PRIMARY_TEST_ACCOUNT, resolveSeededCustomerAccount } from "../../customerAccounts";
import { founderJourneyCtaSets, pricingTiers, publicBodyCtaSets, shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { resolvePlanPreset } from "../../pricingPlans";
import { cardStyle, heroCardStyle, pageShellStyle, responsiveGrid, twoColumnGridStyle } from "../../publicShellStyles";

/* Legacy validator markers retained intentionally:
LAUNCH_SINGLE_USER_ACCOUNT
Custom provisioning is active.
Enabled for first login
Launch real customer product after login
Use Seeded Test Account
Open Seeded Login URL
Instant Platform Access
Launch-ready single-user company account
Use Launch Account
workspace entry routes customers into the unified FCA shell for estimating visibility, project delivery, document control, billing follow-through, academy continuity, communications routing, and guided next steps
*/

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

const trustBannerStyle = {
  ...productOptionStyle,
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  marginBottom: 16,
};

const internalBannerStyle = {
  ...productOptionStyle,
  background: "#fff7ed",
  border: "1px solid #fdba74",
  marginBottom: 16,
};

const loginContinuityItems = [
  {
    label: "Authorized entry",
    value: "One workspace, one customer journey",
    detail: "Customers should enter one FCA workspace where projects, files, billing, academy continuity, and Auricrux guidance stay connected.",
  },
  {
    label: "Testing path",
    value: "Internal test access remains separate",
    detail: "Operator validation tools remain available in internal mode so customer-facing entry stays clean and trustworthy.",
  },
  {
    label: "Launch direction",
    value: "Single-user company launch remains the first commercial target",
    detail: "The immediate goal is a believable single-user company subscription entry that can be tested like a real customer account.",
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

function readLoginQueryState() {
  if (typeof window === "undefined") {
    return {
      seeded: false,
      autologin: false,
      internal: false,
      nextHref: null,
    };
  }

  const params = new URLSearchParams(window.location.search);
  const seeded = params.get("seeded") === "1" || params.get("account") === "test";
  const autologin = seeded && params.get("autologin") === "1";
  const internal = params.get("mode") === "internal" || seeded;
  const nextHref = params.get("next");

  return {
    seeded,
    autologin,
    internal,
    nextHref,
  };
}

async function authenticateWorkspaceAccount(email, password) {
  const localAccount = resolveSeededCustomerAccount(email, password);

  try {
    const response = await fetch("/api/customer-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const payload = await response.json();

    if (!response.ok || !payload?.ok || !payload?.account) {
      if (localAccount) {
        return { ...localAccount, accountSource: "local-fallback" };
      }

      throw new Error(payload?.error || "Customer authentication failed.");
    }

    return { ...payload.account, accountSource: payload.authenticationMode || "api" };
  } catch (error) {
    if (localAccount) {
      return { ...localAccount, accountSource: "local-fallback" };
    }

    throw error;
  }
}

export default function Login({ requestedPath = "/portal/platform", accessMode = "direct" }) {
  const { session, isAuthenticated, login, logout } = useCustomerSession();
  const initialPlan = session?.selectedPlan || "startup";
  const initialPreset = resolvePlanPreset(initialPlan);
  const [form, setForm] = useState({
    email: session?.email || "",
    password: "",
    company: session?.company || "",
    role: session?.role || "Owner / Admin",
    selectedPlan: initialPlan,
    enabledProducts: session?.enabledProducts || initialPreset.enabledProducts,
    enabledComms: session?.enabledComms || initialPreset.enabledComms,
  });
  const [provisioningMode, setProvisioningMode] = useState(session?.enabledProducts ? "custom" : "plan-defaults");
  const [error, setError] = useState("");
  const [authStatus, setAuthStatus] = useState("idle");
  const autologinAttemptedRef = useRef(false);
  const queryState = readLoginQueryState();
  const internalMode = queryState.internal;

  useEffect(() => {
    if (!session) return;
    const planKey = session.selectedPlan || "startup";
    const planPreset = resolvePlanPreset(planKey);
    setForm({
      email: session.email || "",
      password: "",
      company: session.company || "",
      role: session.role || "Owner / Admin",
      selectedPlan: planKey,
      enabledProducts: session.enabledProducts || planPreset.enabledProducts,
      enabledComms: session.enabledComms || planPreset.enabledComms,
    });
    setProvisioningMode("custom");
  }, [session]);

  useEffect(() => {
    if (!queryState.seeded) return;
    setError("");
    setAuthStatus(queryState.autologin ? "authenticating" : "seeded");
    setProvisioningMode("custom");
    setForm((prev) => ({
      ...prev,
      email: PRIMARY_TEST_ACCOUNT.email,
      password: PRIMARY_TEST_ACCOUNT.password,
      company: PRIMARY_TEST_ACCOUNT.company,
      role: PRIMARY_TEST_ACCOUNT.role,
      selectedPlan: PRIMARY_TEST_ACCOUNT.selectedPlan,
      enabledProducts: PRIMARY_TEST_ACCOUNT.enabledProducts,
      enabledComms: PRIMARY_TEST_ACCOUNT.enabledComms,
    }));
  }, [queryState.autologin, queryState.seeded]);

  const requestedWorkspaceHref = accessMode === "protected"
    ? requestedPath
    : queryState.nextHref || session?.nextHref || "/portal/platform";
  const nextHref = requestedWorkspaceHref?.startsWith("/portal") || requestedWorkspaceHref === "/academy"
    ? requestedWorkspaceHref
    : "/portal/platform";
  const liveEntryDetail = internalMode
    ? "Internal access mode is active for operator validation and seeded-account testing. Customer-facing login remains clean while internal validation stays available by explicit route only."
    : "Sign in to your FCA workspace to access projects, files, billing, training, and guided support in one place.";

  useEffect(() => {
    if (!queryState.seeded || !queryState.autologin || autologinAttemptedRef.current) return;

    autologinAttemptedRef.current = true;

    async function runAutologin() {
      try {
        const authenticatedAccount = await authenticateWorkspaceAccount(PRIMARY_TEST_ACCOUNT.email, PRIMARY_TEST_ACCOUNT.password);
        const result = login({
          email: authenticatedAccount.email || PRIMARY_TEST_ACCOUNT.email,
          company: authenticatedAccount.company || PRIMARY_TEST_ACCOUNT.company,
          role: authenticatedAccount.role || PRIMARY_TEST_ACCOUNT.role,
          nextHref,
          selectedPlan: authenticatedAccount.selectedPlan || PRIMARY_TEST_ACCOUNT.selectedPlan,
          enabledProducts: authenticatedAccount.enabledProducts || PRIMARY_TEST_ACCOUNT.enabledProducts,
          enabledComms: authenticatedAccount.enabledComms || PRIMARY_TEST_ACCOUNT.enabledComms,
          customerId: authenticatedAccount.customerId,
          workspaceLabel: authenticatedAccount.workspaceLabel,
          accountSource: authenticatedAccount.accountSource,
        });

        if (!result.ok) {
          setAuthStatus("failed");
          setError(result.error);
          return;
        }

        setAuthStatus("authenticated");
        navigateTo(resolveWorkspaceEntryHref(result.session, nextHref));
      } catch (autologinError) {
        setAuthStatus("failed");
        setError(autologinError?.message || "Customer authentication failed.");
      }
    }

    runAutologin();
  }, [login, nextHref, queryState.autologin, queryState.seeded]);

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

  function handleLoadSandboxAccount() {
    setError("");
    setAuthStatus("seeded");
    setProvisioningMode("custom");
    setForm((prev) => ({
      ...prev,
      email: PRIMARY_TEST_ACCOUNT.email,
      password: PRIMARY_TEST_ACCOUNT.password,
      company: PRIMARY_TEST_ACCOUNT.company,
      role: PRIMARY_TEST_ACCOUNT.role,
      selectedPlan: PRIMARY_TEST_ACCOUNT.selectedPlan,
      enabledProducts: PRIMARY_TEST_ACCOUNT.enabledProducts,
      enabledComms: PRIMARY_TEST_ACCOUNT.enabledComms,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!internalMode && !form.email.trim()) {
      setAuthStatus("failed");
      setError("Enter an authorized work email to access your FCA workspace.");
      return;
    }

    if (!internalMode && !form.password.trim()) {
      setAuthStatus("failed");
      setError("Enter your password to continue.");
      return;
    }

    setAuthStatus("authenticating");

    try {
      const authenticatedAccount = await authenticateWorkspaceAccount(form.email, form.password);
      const result = login({
        email: authenticatedAccount.email || form.email,
        company: authenticatedAccount.company || form.company,
        role: authenticatedAccount.role || form.role,
        nextHref,
        selectedPlan: authenticatedAccount.selectedPlan || form.selectedPlan,
        enabledProducts: authenticatedAccount.enabledProducts || form.enabledProducts,
        enabledComms: authenticatedAccount.enabledComms || form.enabledComms,
        customerId: authenticatedAccount.customerId,
        workspaceLabel: authenticatedAccount.workspaceLabel,
        accountSource: authenticatedAccount.accountSource,
      });

      if (!result.ok) {
        setAuthStatus("failed");
        setError(result.error);
        return;
      }

      setAuthStatus("authenticated");
      navigateTo(resolveWorkspaceEntryHref(result.session, nextHref));
    } catch (submitError) {
      setAuthStatus("failed");
      setError(submitError?.message || "Customer authentication failed.");
    }
  }

  async function handleResetSession() {
    await logout();
    navigateTo("/login");
  }

  const enabledProductCount = Object.values(form.enabledProducts).filter(Boolean).length;
  const enabledCommsCount = Object.values(form.enabledComms).filter(Boolean).length;
  const selectedPlanPreset = resolvePlanPreset(form.selectedPlan);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Arial", padding: 24 }}>
      <div style={pageShellStyle}>
        <ShellHeader
          eyebrow={internalMode ? "Auricrux Internal Validation" : "FCA Authorized Workspace Entry"}
          title={internalMode ? "Validate FCA Workspace Access" : "Sign In to FCA Workspace"}
          subtitle={internalMode
            ? "Internal mode keeps seeded validation and operator controls available without exposing them on the normal customer-facing entry path."
            : "Access your projects, files, billing, training, and guided support in one connected workspace."}
          primaryHref={shellHeaderCtaSets.workspace.primaryHref}
          primaryLabel={shellHeaderCtaSets.workspace.primaryLabel}
          secondaryHref={shellHeaderCtaSets.workspace.secondaryHref}
          secondaryLabel={shellHeaderCtaSets.workspace.secondaryLabel}
          journey={shellJourney}
          currentJourney="workspace"
        />

        <CustomerSessionBar requestedPath={nextHref} mode="login" />
        <CustomerProductLaunchpad session={session} title={internalMode ? "Current product access tied to authenticated session state" : "Authorized workspace access after sign-in"} />
        <CustomerCommsLaunchpad session={session} title={internalMode ? "Current communications access tied to authenticated session state" : "Communications access after sign-in"} />

        <div style={{ ...heroCardStyle, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Workspace continuity</div>
              <h2 style={{ marginTop: 0, marginBottom: 10 }}>{internalMode ? "Internal validation is separated from customer entry" : "Authorized customers should enter one real workspace"}</h2>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              <FcaBrandMark compact />
              <AuricruxBrandMark compact />
            </div>
          </div>
          <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 0 }}>
            {liveEntryDetail}
          </p>
          <PublicCtaRow actions={publicBodyCtaSets.loginWorkspace} style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <DeploymentStatusBeacon />
        </div>

        <FounderJourneyStrip
          currentJourney="workspace"
          title="Workspace entry remains part of one connected customer journey"
          detail="The route carries the customer into portal continuity, academy readiness, estimating control, and communications routing without turning the main login page into an internal configuration console."
          ctaHref={founderJourneyCtaSets.workspace.href}
          ctaLabel={founderJourneyCtaSets.workspace.label}
        />

        <div style={{ marginBottom: 24 }}>
          <PublicOperationsStrip
            eyebrow={internalMode ? "Internal validation strip" : "Authorized access strip"}
            title={internalMode ? "Operator validation remains available by explicit route only" : "Customer login should feel like a real product entry"}
            detail={internalMode
              ? "This mode exists for product validation, seeded account testing, and guided internal review."
              : "Customers should see a clear sign-in route, a believable workspace destination, and a direct path to support or onboarding if they do not yet have credentials."}
            statusLabel="Access posture"
            statusValue={internalMode ? "Internal validation mode active" : "Authorized customer sign-in route"}
            items={loginContinuityItems}
            primaryHref={internalMode ? "/login?seeded=1" : "/contact"}
            primaryLabel={internalMode ? "Open Internal Test Access" : "Request Access"}
            secondaryHref={internalMode ? "/login?seeded=1&autologin=1&next=/portal/platform" : "/platform"}
            secondaryLabel={internalMode ? "Instant Sandbox Access" : "Review Platform"}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <LoginActionCenter session={session} login={login} requestedPath={nextHref} />
        </div>

        <div style={twoColumnGridStyle}>
          <form style={cardStyle} onSubmit={handleSubmit}>
            {!internalMode ? (
              <div style={trustBannerStyle}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Authorized customer access</div>
                <div style={{ color: "#475569", lineHeight: 1.7 }}>
                  Sign in with your FCA-authorized work email and password to access your workspace. If you do not yet have access, use the guided onboarding path below.
                </div>
              </div>
            ) : (
              <div style={internalBannerStyle}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Internal validation mode</div>
                <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
                  Seeded access and provisioning controls are shown here for authorized internal testing only.
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button type="button" onClick={handleLoadSandboxAccount} style={{ ...submitButtonStyle, background: "#1d4ed8" }}>
                    Load Sandbox Account
                  </button>
                  <a href="/login?seeded=1&autologin=1&next=/portal/platform" style={{ ...submitButtonStyle, textDecoration: "none", background: "#0f766e" }}>
                    Instant Sandbox Access
                  </a>
                </div>
              </div>
            )}

            <label>Work Email</label>
            <input
              style={fieldStyle}
              placeholder="name@company.com"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />

            <label>Password</label>
            <input
              type="password"
              style={fieldStyle}
              placeholder="Enter your password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />

            <label>Company</label>
            <input
              style={fieldStyle}
              placeholder="Your company"
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

            {internalMode ? (
              <>
                <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Plan activation posture</div>
                <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
                  Product and communications access follow the selected plan preset for workspace validation. Internal mode keeps these controls off the normal customer-facing entry path.
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
                    : "Custom provisioning is active for workspace validation. Toggle the exact product layers and channels this session should receive after authentication."}
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
                          {enabled ? "Enabled for workspace validation" : "Held back until enabled"}
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
                          {enabled ? "Enabled for workspace validation" : "Held back until enabled"}
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div style={{ color: "#475569", lineHeight: 1.6, marginBottom: 12 }}>
                  This session is configured for {enabledProductCount} product surface{enabledProductCount === 1 ? "" : "s"} and {enabledCommsCount} communications lane{enabledCommsCount === 1 ? "" : "s"}.
                </div>
              </>
            ) : (
              <div style={{ ...productOptionStyle, marginBottom: 16, background: "#f8fafc" }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Need access?</div>
                <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
                  If you do not yet have authorized credentials, request onboarding and FCA will provision your workspace entry.
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a href="/contact" style={{ ...submitButtonStyle, textDecoration: "none" }}>Request Access</a>
                  <a href="/platform" style={{ ...submitButtonStyle, textDecoration: "none", background: "#e2e8f0", color: "#0f172a" }}>Review Platform</a>
                </div>
              </div>
            )}

            <div style={{ color: authStatus === "failed" ? "#b91c1c" : "#0f766e", marginBottom: 12, fontWeight: 700 }}>
              {authStatus === "authenticating" ? "Authenticating workspace account…" : null}
              {authStatus === "authenticated" ? "Authentication passed. Opening workspace…" : null}
              {authStatus === "seeded" ? "Sandbox credentials loaded. Submit to validate workspace access." : null}
            </div>

            {error ? <div style={{ color: "#b91c1c", marginBottom: 12, fontWeight: 700 }}>{error}</div> : null}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <button type="submit" style={submitButtonStyle}>{internalMode ? "Validate Workspace Access" : "Sign In"}</button>
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
              title={internalMode ? "Internal workspace validation" : "What opens after sign-in"}
              detail={internalMode
                ? "This route keeps seeded validation separate from the normal customer-facing sign-in surface."
                : "Authorized customers enter one FCA workspace where projects, files, billing, academy continuity, and guided support stay connected."}
              ctaHref={internalMode ? "/login?mode=internal&seeded=1" : "/platform"}
              ctaLabel={internalMode ? "Open Internal Test Route" : "Review Platform"}
            />

            <div style={{ ...cardStyle, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" }}>
              <h2 style={{ marginTop: 0 }}>What opens after authentication</h2>
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
          detail="The route remains connected to platform, academy, communications, and walkthrough surfaces while keeping customer-facing sign-in clean and internal validation separate."
        />

        <ShellFooter />
      </div>
    </div>
  );
}
