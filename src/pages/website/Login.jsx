import { useEffect, useRef, useState } from "react";
import PublicTopNav from "../../components/PublicTopNav";
import ShellFooter from "../../components/ShellFooter";
import FcaBrandMark from "../../components/FcaBrandMark";
import LoginActionCenter from "../../components/LoginActionCenter";
import { centralFetch } from "../../api/backendBase";
import { isAllowedPostLoginHref, resolveWorkspaceEntryHref } from "../../customerSession";
import { navigateTo } from "../../navigation";
import useCustomerSession from "../../hooks/useCustomerSession";
import { resolveSeededCustomerAccount, resolveSeededAccountByKey } from "../../customerAccounts";
import { pageShellStyle, cardStyle } from "../../publicShellStyles";
import { portalButtonPrimary, portalInputStyle } from "../../portalDesignTokens";

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

export default function Login({ requestedPath = "/portal/platform", accessMode = "direct" }) {
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
  const redirectAttemptedRef = useRef(false);
  const queryState = readLoginQueryState();
  const internalMode = queryState.internal;
  const seededAccount = resolveSeededAccountByKey(queryState.accountKey);

  const requestedWorkspaceHref = accessMode === "protected"
    ? requestedPath
    : queryState.nextHref || session?.nextHref || "/portal/platform";
  const nextHref = isAllowedPostLoginHref(requestedWorkspaceHref)
    ? requestedWorkspaceHref
    : "/portal/platform";

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

  useEffect(() => {
    if (!isAuthenticated || redirectAttemptedRef.current) return;
    redirectAttemptedRef.current = true;
    navigateTo(resolveWorkspaceEntryHref(session, nextHref));
  }, [isAuthenticated, session, nextHref]);

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
          nextHref: "/portal/platform",
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
        navigateTo(resolveWorkspaceEntryHref(result.session, nextHref));
      } catch (autologinError) {
        setAuthStatus("failed");
        setError(autologinError?.message || "Customer authentication failed.");
      }
    }
    runAutologin();
  }, [login, queryState.autologin, queryState.seeded, seededAccount, nextHref]);

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
        nextHref: "/portal/platform",
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
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <PublicTopNav />
      <div style={{ ...pageShellStyle, maxWidth: 480, paddingTop: 32, paddingBottom: 48 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <FcaBrandMark compact />
        </div>

        <form style={{ ...cardStyle, boxShadow: "0 8px 30px rgba(15, 23, 42, 0.08)" }} onSubmit={handleSubmit}>
          <h1 style={{ marginTop: 0, marginBottom: 6, fontSize: 22 }}>Sign in</h1>
          <p style={{ color: "#64748b", marginTop: 0, marginBottom: 20, lineHeight: 1.55, fontSize: 14 }}>
            Opens your workspace - projects, bids, files, billing, Academy, and Auricrux.
          </p>

          <label style={{ fontWeight: 600, fontSize: 14 }}>Work email</label>
          <input style={portalInputStyle} placeholder="name@company.com" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} autoComplete="username" />
          <label style={{ fontWeight: 600, fontSize: 14 }}>Password</label>
          <input type="password" style={portalInputStyle} placeholder="Enter your password" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} autoComplete="current-password" />

          {authStatus === "authenticating" ? (
            <div style={{ color: "#0f766e", marginBottom: 12, fontWeight: 600, fontSize: 14 }}>Opening workspace...</div>
          ) : null}
          {authStatus === "seeded" ? (
            <div style={{ color: "#0f766e", marginBottom: 12, fontSize: 14 }}>Test credentials loaded.</div>
          ) : null}
          {error ? <div style={{ color: "#b91c1c", marginBottom: 12, fontWeight: 600, fontSize: 14 }}>{error}</div> : null}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button type="submit" style={{ ...portalButtonPrimary, border: "none", cursor: "pointer" }}>
              {internalMode ? "Open workspace" : "Sign in"}
            </button>
            {isAuthenticated ? (
              <button type="button" onClick={handleResetSession} style={{ ...portalButtonPrimary, background: "#fff", color: "#0f172a", border: "1px solid #cbd5e1", cursor: "pointer" }}>
                Sign out
              </button>
            ) : null}
          </div>

          <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6, marginTop: 20, marginBottom: 0 }}>
            New to FCA? <a href="/intake" style={{ color: "#1d4ed8", fontWeight: 600 }}>Get started</a>
            {" | "}
            <a href="mailto:support@futurecontractorsofamerica.com" style={{ color: "#1d4ed8" }}>Support</a>
          </p>
        </form>

        {queryState.seeded ? (
          <div style={{ marginTop: 20 }}>
            <LoginActionCenter session={session} login={login} requestedPath={nextHref} />
          </div>
        ) : null}

        <ShellFooter />
      </div>
    </div>
  );
}
