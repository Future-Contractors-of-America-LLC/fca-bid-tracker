import { useEffect, useRef, useState } from "react";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import { centralFetch } from "../../api/backendBase";
import { isAllowedPostLoginHref, resolveWorkspaceEntryHref } from "../../customerSession";
import { navigateTo } from "../../navigation";
import useCustomerSession from "../../hooks/useCustomerSession";
import { resolveSeededCustomerAccount, resolveSeededAccountByKey } from "../../customerAccounts";
import { pageShellStyle, cardStyle, twoColumnGridStyle } from "../../publicShellStyles";

const fieldStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  marginTop: 6,
  marginBottom: 14,
  boxSizing: "border-box",
  fontSize: 15,
};

const submitButtonStyle = {
  background: "linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)",
  color: "#fff",
  padding: "12px 20px",
  borderRadius: 8,
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
  fontSize: 15,
};

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
    return { seeded: false, autologin: false, internal: false, nextHref: null, accountKey: "test" };
  }
  const params = new URLSearchParams(window.location.search);
  const accountParam = params.get("account");
  const accountKey = accountParam || "test";
  const seeded = params.get("seeded") === "1" || Boolean(accountParam);
  const autologin = params.get("autologin") === "1" && seeded;
  const internal = params.get("mode") === "internal" || seeded;
  const nextHref = params.get("next");
  return { seeded, autologin, internal, nextHref, accountKey };
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
  const localFallback = resolveLocalFallbackAccount(email, password);
  try {
    const response = await centralFetch("/api/customer-login", {
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
    if (localFallback) return localFallback;
    throw new Error(payload?.error || "Invalid email or password.");
  } catch (error) {
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
  const seededAccount = resolveSeededAccountByKey(queryState.accountKey);

  useEffect(() => {
    if (!queryState.seeded) return;
    setForm({
      email: seededAccount.email,
      password: seededAccount.password,
      company: seededAccount.company,
      role: seededAccount.role,
      selectedPlan: seededAccount.selectedPlan,
      enabledProducts: seededAccount.enabledProducts,
      enabledComms: seededAccount.enabledComms,
    });
    setAuthStatus(queryState.autologin ? "authenticating" : "seeded");
  }, [queryState.autologin, queryState.accountKey, queryState.seeded, seededAccount]);

  const requestedWorkspaceHref = accessMode === "protected"
    ? requestedPath
    : queryState.nextHref || session?.nextHref || "/portal";
  const nextHref = isAllowedPostLoginHref(requestedWorkspaceHref)
    ? requestedWorkspaceHref
    : "/portal";

  useEffect(() => {
    if (!queryState.seeded || !queryState.autologin || autologinAttemptedRef.current) return;
    autologinAttemptedRef.current = true;
    async function runAutologin() {
      try {
        const authenticatedAccount = await authenticateWorkspaceAccount(seededAccount.email, seededAccount.password);
        const result = login({
          email: authenticatedAccount.email || seededAccount.email,
          company: authenticatedAccount.company || seededAccount.company,
          role: authenticatedAccount.role || seededAccount.role,
          nextHref,
          selectedPlan: authenticatedAccount.selectedPlan || seededAccount.selectedPlan,
          enabledProducts: authenticatedAccount.enabledProducts || seededAccount.enabledProducts,
          enabledComms: authenticatedAccount.enabledComms || seededAccount.enabledComms,
          customerId: authenticatedAccount.customerId,
          workspaceLabel: authenticatedAccount.workspaceLabel,
          accountSource: authenticatedAccount.accountSource,
          accountMode: authenticatedAccount.accountMode,
          authBoundary: authenticatedAccount.authBoundary,
        });
        if (!result.ok) throw new Error(result.error);
        setAuthStatus("authenticated");
        const destination = resolveWorkspaceEntryHref(result.session, nextHref);
        window.location.assign(destination);
      } catch (autologinError) {
        setAuthStatus("failed");
        setError(autologinError?.message || "Customer authentication failed.");
      }
    }
    runAutologin();
  }, [login, nextHref, queryState.autologin, queryState.seeded, seededAccount]);

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
      const destination = resolveWorkspaceEntryHref(result.session, nextHref);
      window.location.assign(destination);
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
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div style={pageShellStyle}>
        <ShellHeader
          compact
          eyebrow="Sign in"
          title="Access your FCA workspace"
          subtitle="Sign in to reach SaaS operations, customer portal, Academy, and Auricrux from one account."
        />

        <div style={twoColumnGridStyle}>
          <form style={{ ...cardStyle, boxShadow: "0 4px 24px rgba(15, 23, 42, 0.06)" }} onSubmit={handleSubmit}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>Work email</label>
            <input style={fieldStyle} placeholder="name@company.com" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} autoComplete="username" />
            <label style={{ fontWeight: 600, fontSize: 14 }}>Password</label>
            <input type="password" style={fieldStyle} placeholder="Enter your password" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} autoComplete="current-password" />

            <div style={{ color: authStatus === "failed" ? "#b91c1c" : "#0f766e", marginBottom: 12, fontWeight: 600, fontSize: 14 }}>
              {authStatus === "authenticating" ? "Signing in…" : null}
              {authStatus === "authenticated" ? "Success. Opening workspace…" : null}
              {authStatus === "seeded" ? "Test credentials loaded." : null}
            </div>
            {error ? <div style={{ color: "#b91c1c", marginBottom: 12, fontWeight: 600 }}>{error}</div> : null}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <button type="submit" style={submitButtonStyle}>{internalMode ? "Open validation workspace" : "Sign in"}</button>
              {isAuthenticated ? (
                <>
                  <a href={nextHref} style={{ ...submitButtonStyle, textDecoration: "none", display: "inline-block" }}>Open workspace</a>
                  <button type="button" onClick={handleResetSession} style={{ ...submitButtonStyle, background: "#fff", color: "#0f172a", border: "1px solid #cbd5e1" }}>Sign out</button>
                </>
              ) : null}
            </div>

            <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6, marginTop: 20, marginBottom: 0 }}>
              Need access? Use the header to request onboarding or contact{" "}
              <a href="mailto:support@futurecontractorsofamerica.com" style={{ color: "#1d4ed8" }}>support@futurecontractorsofamerica.com</a>.
            </p>
          </form>

          <div style={cardStyle}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>What opens after sign-in</h2>
            <ul style={{ paddingLeft: 20, lineHeight: 1.9, color: "#334155", marginBottom: 0 }}>
              <li>SaaS workspace — bids, estimates, projects, files, billing</li>
              <li>Customer portal — messages, support, and account controls</li>
              <li>Academy — apprenticeship, certification, and field training</li>
              <li>Auricrux — guided next actions across every lane</li>
            </ul>
          </div>
        </div>

        <ShellFooter />
      </div>
    </div>
  );
}
