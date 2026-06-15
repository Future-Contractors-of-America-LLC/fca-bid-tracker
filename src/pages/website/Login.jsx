import { useEffect, useRef, useState } from "react";
import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import PublicActionRail from "../../components/PublicActionRail";
import PublicCtaRow from "../../components/PublicCtaRow";
import CustomerProductLaunchpad from "../../components/CustomerProductLaunchpad";
import CustomerCommsLaunchpad from "../../components/CustomerCommsLaunchpad";
import { resolveWorkspaceEntryHref } from "../../customerSession";
import { navigateTo } from "../../navigation";
import useCustomerSession from "../../hooks/useCustomerSession";
import { PRIMARY_TEST_ACCOUNT, resolveSeededCustomerAccount } from "../../customerAccounts";
import { publicBodyCtaSets, shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { pageShellStyle, heroCardStyle, cardStyle, twoColumnGridStyle } from "../../publicShellStyles";

const fieldStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  marginTop: 8,
  marginBottom: 16,
  boxSizing: "border-box",
  fontSize: 15,
};

const submitButtonStyle = {
  textDecoration: "none",
  background: "#111827",
  color: "#fff",
  padding: "12px 16px",
  borderRadius: 12,
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
};

const marketingPoints = [
  {
    title: "Close more work from one login",
    detail: "Capture intake, qualify opportunities, build estimates, deliver files, and keep every customer handoff in one command center.",
  },
  {
    title: "Offer a workspace under your brand",
    detail: "Customers and teams see a portal that feels like your company’s operating system—not someone else’s software.",
  },
  {
    title: "Keep Auricrux active in every move",
    detail: "Auricrux explains what matters, recommends the next step, and executes guided actions across SaaS and Academy surfaces.",
  },
];

const signupBenefits = [
  "Branded customer login and workspace entry",
  "Opportunity, estimate, file, and customer task continuity",
  "Academy classroom delivery for onboarding and execution readiness",
  "Auricrux guidance embedded across every customer-facing lane",
];

const LOCAL_FALLBACK_AUTH_BOUNDARY = {
  productionAuthReady: false,
  activeMode: "seeded-local-fallback",
  identityProvider: "fca-native-auth",
  tenantIsolation: "single-repo-account-store",
  sessionValidation: "browser-session-fallback",
  nextBuildStep: "Promote server-backed customer auth while preserving launch continuity.",
};

function readLoginQueryState() {
  if (typeof window === "undefined") {
    return { seeded: false, autologin: false, internal: false, nextHref: null };
  }
  const params = new URLSearchParams(window.location.search);
  const seeded = params.get("seeded") === "1" || params.get("account") === "test";
  const autologin = seeded && params.get("autologin") === "1";
  const internal = params.get("mode") === "internal" || seeded;
  const nextHref = params.get("next");
  return { seeded, autologin, internal, nextHref };
}

function resolveLocalFallbackAccount(email, password) {
  const fallbackAccount = resolveSeededCustomerAccount(email, password);
  if (!fallbackAccount) return null;
  return {
    ...fallbackAccount,
    authBoundary: LOCAL_FALLBACK_AUTH_BOUNDARY,
    accountSource: "seeded-local-fallback",
    accountMode: "seeded",
  };
}

async function authenticateWorkspaceAccount(email, password) {
  try {
    const response = await fetch("/api/customer-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const payload = await response.json();
    if (response.ok && payload?.ok && payload?.account) {
      return {
        ...payload.account,
        authBoundary: payload.authBoundary,
        accountSource: payload.authenticationMode || "api",
      };
    }
    const localFallback = resolveLocalFallbackAccount(email, password);
    if (localFallback) return localFallback;
    throw new Error(payload?.error || "Customer authentication failed.");
  } catch (error) {
    const localFallback = resolveLocalFallbackAccount(email, password);
    if (localFallback) return localFallback;
    throw error;
  }
}

export default function Login({ requestedPath = "/portal", accessMode = "direct" }) {
  const { session, isAuthenticated, login, logout } = useCustomerSession();
  const [form, setForm] = useState({
    email: session?.email || "",
    password: "",
    company: session?.company || "",
    role: session?.role || "Owner / Admin",
    selectedPlan: session?.selectedPlan || "enterprise",
    enabledProducts: session?.enabledProducts || { saas: true, lms: true, auricrux: true },
    enabledComms: session?.enabledComms || { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true },
  });
  const [error, setError] = useState("");
  const [authStatus, setAuthStatus] = useState("idle");
  const autologinAttemptedRef = useRef(false);
  const queryState = readLoginQueryState();
  const internalMode = queryState.internal;

  useEffect(() => {
    if (!queryState.seeded) return;
    setForm({
      email: PRIMARY_TEST_ACCOUNT.email,
      password: PRIMARY_TEST_ACCOUNT.password,
      company: PRIMARY_TEST_ACCOUNT.company,
      role: PRIMARY_TEST_ACCOUNT.role,
      selectedPlan: PRIMARY_TEST_ACCOUNT.selectedPlan,
      enabledProducts: PRIMARY_TEST_ACCOUNT.enabledProducts,
      enabledComms: PRIMARY_TEST_ACCOUNT.enabledComms,
    });
    setAuthStatus(queryState.autologin ? "authenticating" : "seeded");
  }, [queryState.autologin, queryState.seeded]);

  const requestedWorkspaceHref = accessMode === "protected"
    ? requestedPath
    : queryState.nextHref || session?.nextHref || "/portal";
  const nextHref = requestedWorkspaceHref?.startsWith("/portal") || requestedWorkspaceHref === "/academy"
    ? requestedWorkspaceHref
    : "/portal";

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
          accountMode: authenticatedAccount.accountMode,
          authBoundary: authenticatedAccount.authBoundary,
        });
        if (!result.ok) throw new Error(result.error);
        setAuthStatus("authenticated");
        navigateTo(resolveWorkspaceEntryHref(result.session, nextHref));
      } catch (autologinError) {
        setAuthStatus("failed");
        setError(autologinError?.message || "Customer authentication failed.");
      }
    }
    runAutologin();
  }, [login, nextHref, queryState.autologin, queryState.seeded]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!form.email.trim()) {
      setAuthStatus("failed");
      setError("Enter your work email to continue.");
      return;
    }
    if (!form.password.trim()) {
      setAuthStatus("failed");
      setError("Enter your password to continue.");
      return;
    }
    setAuthStatus("authenticating");
    try {
      const authenticatedAccount = await authenticateWorkspaceAccount(form.email, form.password);
      const result = login({
        email: authenticatedAccount.email || form.email,
        company: authenticatedAccount.company || form.company || "Customer Workspace",
        role: authenticatedAccount.role || form.role,
        nextHref,
        selectedPlan: authenticatedAccount.selectedPlan || form.selectedPlan,
        enabledProducts: authenticatedAccount.enabledProducts || form.enabledProducts,
        enabledComms: authenticatedAccount.enabledComms || form.enabledComms,
        customerId: authenticatedAccount.customerId,
        workspaceLabel: authenticatedAccount.workspaceLabel,
        accountSource: authenticatedAccount.accountSource,
        accountMode: authenticatedAccount.accountMode,
        authBoundary: authenticatedAccount.authBoundary,
      });
      if (!result.ok) throw new Error(result.error);
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

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Arial", padding: 24 }}>
      <div style={pageShellStyle}>
        <ShellHeader
          eyebrow={internalMode ? "Internal Validation" : "Customer Login"}
          title={internalMode ? "Internal Access" : "Sign In or Request Access"}
          subtitle={internalMode
            ? "Internal validation remains available by explicit route only."
            : "Launch a branded contractor operating system that handles customer intake, qualification, estimates, files, tasks, training, and Auricrux-guided execution."}
          primaryHref={shellHeaderCtaSets.workspace.primaryHref}
          primaryLabel={shellHeaderCtaSets.workspace.primaryLabel}
          secondaryHref={shellHeaderCtaSets.workspace.secondaryHref}
          secondaryLabel={shellHeaderCtaSets.workspace.secondaryLabel}
          journey={shellJourney}
          currentJourney="workspace"
        />

        <div style={{ ...heroCardStyle, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>FCA Contractor Command</div>
              <h2 style={{ margin: 0 }}>Sign in to close work, deliver branded customer service, and keep every handoff inside one portal</h2>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              <FcaBrandMark compact />
              <AuricruxBrandMark compact />
            </div>
          </div>
          <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 14 }}>
            FCA gives contractors a customer-ready login experience, a branded workspace, opportunity control, estimate coordination, file intake, customer task delivery, and Academy training—without breaking continuity between sales, operations, and execution.
          </p>
          <PublicCtaRow actions={publicBodyCtaSets.loginWorkspace} style={{ display: "flex", gap: 12, flexWrap: "wrap" }} />
        </div>

        <CustomerProductLaunchpad session={session} title="What opens after sign-in" />
        <div style={{ marginBottom: 18 }}>
          <CustomerCommsLaunchpad session={session} title="Communications channels included in your launch workspace" />
        </div>

        <div style={twoColumnGridStyle}>
          <form style={cardStyle} onSubmit={handleSubmit}>
            <div style={{ border: "1px solid #dbe3ef", borderRadius: 14, padding: 16, background: "#eff6ff", marginBottom: 18 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{internalMode ? "Internal launch access" : "Customer workspace access"}</div>
              <div style={{ color: "#475569", lineHeight: 1.7 }}>
                {internalMode
                  ? "Use seeded launch credentials for internal validation only."
                  : "Sign in to manage branded customer tasks, qualification flow, estimate readiness, file intake, training rollout, and Auricrux-guided next actions."}
              </div>
            </div>

            <label>Work Email</label>
            <input style={fieldStyle} placeholder="name@company.com" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
            <label>Password</label>
            <input type="password" style={fieldStyle} placeholder="Enter your password" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} />
            <label>Company</label>
            <input style={fieldStyle} placeholder="Your company" value={form.company} onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))} />

            <div style={{ color: authStatus === "failed" ? "#b91c1c" : "#0f766e", marginBottom: 12, fontWeight: 700 }}>
              {authStatus === "authenticating" ? "Authenticating workspace account…" : null}
              {authStatus === "authenticated" ? "Authentication passed. Opening workspace…" : null}
              {authStatus === "seeded" ? "Launch credentials loaded. Submit to continue." : null}
            </div>
            {error ? <div style={{ color: "#b91c1c", marginBottom: 12, fontWeight: 700 }}>{error}</div> : null}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <button type="submit" style={submitButtonStyle}>{internalMode ? "Open Validation Workspace" : "Sign In"}</button>
              {isAuthenticated ? (
                <>
                  <a href={nextHref} style={{ ...submitButtonStyle, textDecoration: "none" }}>Open Workspace</a>
                  <button type="button" onClick={handleResetSession} style={{ ...submitButtonStyle, background: "#f8fafc", color: "#111827", border: "1px solid #cbd5e1" }}>Reset Session</button>
                </>
              ) : null}
            </div>
          </form>

          <div style={{ display: "grid", gap: 16 }}>
            <div style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Why customers sign up</h2>
              <div style={{ display: "grid", gap: 12 }}>
                {marketingPoints.map((point) => (
                  <div key={point.title} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>{point.title}</div>
                    <div style={{ color: "#475569", lineHeight: 1.7 }}>{point.detail}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Included in launch access</h2>
              <ul style={{ paddingLeft: 20, lineHeight: 1.9, color: "#334155", marginBottom: 0 }}>
                {signupBenefits.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <PublicActionRail title="Request a branded rollout" detail="Move from first conversation into a login-ready customer workspace with Auricrux already present across sales, tasks, files, and training." />
        </div>

        <ShellFooter />
      </div>
    </div>
  );
}
