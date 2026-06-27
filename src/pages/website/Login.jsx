import { useEffect, useRef, useState } from "react";
import PublicTopNav from "../../components/PublicTopNav";
import ShellFooter from "../../components/ShellFooter";
import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxAvatar from "../../components/AuricruxAvatar";
import ProductIllustration from "../../components/ProductIllustration";
import { auricruxPersona } from "../../config/auricruxPersona";
import LoginActionCenter from "../../components/LoginActionCenter";
import { centralFetch } from "../../api/backendBase";
import { verifyCustomerLogin } from "../../api/authClient";
import {
  clearEntraExchangeFromLocation,
  exchangeEntraSession,
  fetchEntraAuthStatus,
  readEntraExchangeFromLocation,
  startEntraSignIn,
} from "../../api/entraAuthClient";
import { isAllowedPostLoginHref, isFounderSession, resolveWorkspaceEntryHref } from "../../customerSession";
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

const EMPTY_FORM = {
  email: "",
  password: "",
  company: "",
  role: "Owner / Admin",
  selectedPlan: "enterprise",
  enabledProducts: { saas: true, lms: true, auricrux: true },
  enabledComms: { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true },
};

function readLoginQueryState() {
  if (typeof window === "undefined") {
    return { seeded: false, autologin: false, internal: false, nextHref: null, accountKey: "test", sessionExpired: false, resetRequested: false };
  }
  const params = new URLSearchParams(window.location.search);
  const accountParam = params.get("account");
  const accountKey = accountParam || "test";
  const seeded = params.get("seeded") === "1" || Boolean(accountParam);
  const autologin = params.get("autologin") === "1" && seeded;
  const internal = params.get("mode") === "internal" || seeded;
  const nextHref = params.get("next");
  const sessionExpired = params.get("session") === "expired";
  const resetRequested = params.get("reset") === "1";
  return { seeded, autologin, internal, nextHref, accountKey, sessionExpired, resetRequested };
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
    if (response.ok && payload?.ok && payload?.requiresVerification) {
      return {
        requiresVerification: true,
        challengeId: payload.challengeId,
        maskedEmail: payload.maskedEmail,
        devVerificationHint: payload.devVerificationHint,
        deliveryChannel: payload.deliveryChannel,
      };
    }
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
  const [form, setForm] = useState(EMPTY_FORM);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingChallenge, setPendingChallenge] = useState(null);
  const [error, setError] = useState("");
  const [authStatus, setAuthStatus] = useState("idle");
  const [entraConfigured, setEntraConfigured] = useState(false);
  const autologinAttemptedRef = useRef(false);
  const redirectAttemptedRef = useRef(false);
  const sessionResetRef = useRef(false);
  const queryState = readLoginQueryState();
  const internalMode = queryState.internal;
  const seededAccount = resolveSeededAccountByKey(queryState.accountKey);

  const requestedWorkspaceHref = accessMode === "protected"
    ? requestedPath
    : queryState.nextHref || "/portal/platform";
  const nextHref = isAllowedPostLoginHref(requestedWorkspaceHref)
    ? requestedWorkspaceHref
    : "/portal/platform";

  useEffect(() => {
    let active = true;
    fetchEntraAuthStatus()
      .then((status) => {
        if (active) setEntraConfigured(status.configured);
      })
      .catch(() => {
        if (active) setEntraConfigured(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const exchangeToken = readEntraExchangeFromLocation();
    if (!exchangeToken || queryState.seeded) return undefined;
    let cancelled = false;
    setAuthStatus("authenticating");
    exchangeEntraSession(exchangeToken)
      .then((payload) => {
        if (cancelled) return;
        clearEntraExchangeFromLocation();
        completeLogin({
          ...payload.account,
          authBoundary: payload.authBoundary,
          accountSource: payload.authenticationMode || "entra-server-session",
        });
      })
      .catch((entraError) => {
        if (cancelled) return;
        clearEntraExchangeFromLocation();
        setAuthStatus("failed");
        setError(entraError?.message || "Microsoft sign-in failed.");
      });
    return () => {
      cancelled = true;
    };
  }, [queryState.seeded]);

  useEffect(() => {
    if (queryState.seeded || !isAuthenticated) return;
    navigateTo(resolveWorkspaceEntryHref(session, nextHref));
  }, [isAuthenticated, nextHref, queryState.seeded, session]);

  useEffect(() => {
    if (queryState.seeded || !queryState.resetRequested || sessionResetRef.current) return;
    sessionResetRef.current = true;
    let cancelled = false;

    async function resetLoginSurface() {
      await logout();
      if (cancelled) return;
      setForm(EMPTY_FORM);
      setVerificationCode("");
      setPendingChallenge(null);
      setAuthStatus("idle");
      setError("");
      redirectAttemptedRef.current = false;
    }

    resetLoginSurface();
    return () => {
      cancelled = true;
    };
  }, [logout, queryState.resetRequested, queryState.seeded]);

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
    if (!queryState.seeded || !isAuthenticated || redirectAttemptedRef.current) return;
    redirectAttemptedRef.current = true;
    navigateTo(resolveWorkspaceEntryHref(session, nextHref));
  }, [isAuthenticated, queryState.seeded, session, nextHref]);

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
        navigateTo(resolveWorkspaceEntryHref(result.session, nextHref));
      } catch (autologinError) {
        setAuthStatus("failed");
        setError(autologinError?.message || "Customer authentication failed.");
      }
    }
    runAutologin();
  }, [login, nextHref, queryState.autologin, queryState.seeded, seededAccount]);

  function completeLogin(authenticatedAccount) {
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
  }

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
      if (authenticatedAccount?.requiresVerification) {
        setPendingChallenge(authenticatedAccount);
        setVerificationCode("");
        setAuthStatus("awaiting-verification");
        return;
      }
      if (queryState.seeded) {
        completeLogin(authenticatedAccount);
        return;
      }
      completeLogin(authenticatedAccount);
    } catch (submitError) {
      setAuthStatus("failed");
      setError(submitError?.message || "Customer authentication failed.");
    }
  }

  async function handleVerifyCode(event) {
    event.preventDefault();
    if (!/^\d{6}$/.test(verificationCode.trim())) {
      setError("Enter the 6-digit verification code from your email or authenticator app.");
      return;
    }
    if (!pendingChallenge?.challengeId) {
      setError("Start sign-in again.");
      setAuthStatus("idle");
      return;
    }
    setError("");
    setAuthStatus("authenticating");
    try {
      const payload = await verifyCustomerLogin({
        challengeId: pendingChallenge.challengeId,
        code: verificationCode.trim(),
      });
      completeLogin({
        ...payload.account,
        authBoundary: payload.authBoundary,
        accountSource: payload.authenticationMode || "api",
      });
      setPendingChallenge(null);
    } catch (verifyError) {
      setAuthStatus("failed");
      setError(verifyError?.message || "Verification failed.");
    }
  }

  async function handleResetSession() {
    await logout();
    setForm(EMPTY_FORM);
    setVerificationCode("");
    setPendingChallenge(null);
    setAuthStatus("idle");
    setError("");
    navigateTo("/login");
  }

  async function handleMicrosoftSignIn() {
    setError("");
    setAuthStatus("authenticating");
    try {
      const returnUrl = `${window.location.origin}/login?next=${encodeURIComponent(nextHref)}`;
      await startEntraSignIn(returnUrl);
    } catch (entraError) {
      setAuthStatus("failed");
      setError(entraError?.message || "Microsoft sign-in is unavailable.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <PublicTopNav />
      <div style={{ ...pageShellStyle, maxWidth: 920, paddingTop: 32, paddingBottom: 48 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <FcaBrandMark compact />
            <div style={{ ...cardStyle, width: "100%", textAlign: "center", padding: 16, background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)", border: "1px solid #e5d3a1" }}>
              <AuricruxAvatar state="idle" size={96} compact />
              <p style={{ color: "#475569", margin: "12px 0 0", lineHeight: 1.6, fontSize: 13 }}>
                {auricruxPersona.intro}
              </p>
            </div>
          </div>
          <ProductIllustration variant="login" compact />
        </div>

        <form
          style={{ ...cardStyle, boxShadow: "0 8px 30px rgba(15, 23, 42, 0.08)" }}
          onSubmit={authStatus === "awaiting-verification" ? handleVerifyCode : handleSubmit}
          autoComplete="off"
        >
          <h1 style={{ marginTop: 0, marginBottom: 6, fontSize: 22 }}>Sign in</h1>
          <p style={{ color: "#64748b", marginTop: 0, marginBottom: 20, lineHeight: 1.55, fontSize: 14 }}>
            Access your FCA workspace — pipeline, projects, billing, and Academy training in one place.
          </p>

          {queryState.sessionExpired ? (
            <div style={{ color: "#b45309", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 10, padding: "10px 12px", marginBottom: 14, fontSize: 14, lineHeight: 1.5 }}>
              Your session ended. Sign in again to continue where you left off.
            </div>
          ) : null}

          {authStatus === "awaiting-verification" ? (
            <>
              <p style={{ color: "#64748b", fontSize: 13, marginTop: 0, marginBottom: 12, lineHeight: 1.55 }}>
                Enter the 6-digit code sent to {pendingChallenge?.maskedEmail || "your email"}.
              </p>
              <label style={{ fontWeight: 600, fontSize: 14 }}>Verification code</label>
              <input
                style={portalInputStyle}
                placeholder="6-digit code"
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
              />
            </>
          ) : (
            <>
              <label style={{ fontWeight: 600, fontSize: 14 }}>Work email</label>
              <input
                style={portalInputStyle}
                placeholder="name@company.com"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                autoComplete="off"
                name="fca-work-email"
              />
              <label style={{ fontWeight: 600, fontSize: 14 }}>Password</label>
              <input
                type="password"
                style={portalInputStyle}
                placeholder="Enter your password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                autoComplete="new-password"
                name="fca-work-password"
              />
            </>
          )}

          {authStatus === "authenticating" ? (
            <div style={{ color: "#0f766e", marginBottom: 12, fontWeight: 600, fontSize: 14 }}>Opening your workspace...</div>
          ) : null}
          {authStatus === "seeded" && isFounderSession(session) ? (
            <div style={{ color: "#0f766e", marginBottom: 12, fontSize: 14 }}>Founder workspace ready.</div>
          ) : null}
          {error ? <div style={{ color: "#b91c1c", marginBottom: 12, fontWeight: 600, fontSize: 14 }}>{error}</div> : null}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button type="submit" style={{ ...portalButtonPrimary, border: "none", cursor: "pointer" }}>
              {authStatus === "awaiting-verification" ? "Verify and continue" : internalMode ? "Open workspace" : "Sign in"}
            </button>
            {entraConfigured && authStatus !== "awaiting-verification" ? (
              <button
                type="button"
                onClick={handleMicrosoftSignIn}
                style={{ ...portalButtonPrimary, background: "#fff", color: "#0f172a", border: "1px solid #cbd5e1", cursor: "pointer" }}
              >
                Sign in with Microsoft
              </button>
            ) : null}
            <button type="button" onClick={handleResetSession} style={{ ...portalButtonPrimary, background: "#fff", color: "#0f172a", border: "1px solid #cbd5e1", cursor: "pointer" }}>
              Sign out
            </button>
          </div>

          <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6, marginTop: 20, marginBottom: 0 }}>
            New to FCA? <a href="/intake" style={{ color: "#1d4ed8", fontWeight: 600 }}>Get started</a>
            {" | "}
            <a href="mailto:support@futurecontractorsofamerica.com" style={{ color: "#1d4ed8" }}>Support</a>
          </p>
        </form>

        {queryState.seeded && isFounderSession(session) ? (
          <div style={{ marginTop: 20 }}>
            <LoginActionCenter session={session} login={login} requestedPath={nextHref} />
          </div>
        ) : null}

        <ShellFooter />
      </div>
    </div>
  );
}
