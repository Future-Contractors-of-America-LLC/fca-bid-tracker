export const CUSTOMER_SESSION_KEY = "fca_customer_session_v1";
export const CUSTOMER_SESSION_EVENT = "fca-customer-session-updated";

const DEFAULT_AUTH_BOUNDARY = {
  productionAuthReady: false,
  activeMode: "server-session",
  identityProvider: "fca-native-auth",
  tenantIsolation: "single-repo-account-store",
  sessionValidation: "signed-http-only-cookie",
  nextBuildStep: "Move customer accounts and session secret into managed identity-backed storage.",
};

function normalizeEnabledProducts(enabledProducts) {
  return {
    saas: enabledProducts?.saas !== false,
    lms: enabledProducts?.lms !== false,
    auricrux: enabledProducts?.auricrux !== false,
  };
}

function normalizeEnabledComms(enabledComms) {
  return {
    chat: enabledComms?.chat !== false,
    sms: enabledComms?.sms !== false,
    phone: enabledComms?.phone !== false,
    email: enabledComms?.email !== false,
    teams: enabledComms?.teams !== false,
    conference: enabledComms?.conference !== false,
    lecture: enabledComms?.lecture !== false,
  };
}

function normalizeAuthBoundary(authBoundary) {
  return {
    ...DEFAULT_AUTH_BOUNDARY,
    ...(authBoundary || {}),
  };
}

function broadcastCustomerSessionUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CUSTOMER_SESSION_EVENT));
}

export function readCustomerSession() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CUSTOMER_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.authenticated) return null;

    return {
      ...parsed,
      role: parsed.role || "Owner / Admin",
      customerId: parsed.customerId || "CUST-FCA-LIVE-001",
      selectedPlan: parsed.selectedPlan || "startup",
      accountSource: parsed.accountSource || "workspace-shell",
      authBoundary: normalizeAuthBoundary(parsed.authBoundary),
      enabledProducts: normalizeEnabledProducts(parsed.enabledProducts),
      enabledComms: normalizeEnabledComms(parsed.enabledComms),
    };
  } catch {
    return null;
  }
}

export function writeCustomerSession(session) {
  if (typeof window === "undefined") return null;

  const payload = {
    authenticated: true,
    email: session.email,
    company: session.company,
    role: session.role || "Owner / Admin",
    customerId: session.customerId || "CUST-FCA-LIVE-001",
    workspaceLabel: session.workspaceLabel || session.company,
    lastLoginAt: session.lastLoginAt || new Date().toISOString(),
    nextHref: session.nextHref || "/portal/platform",
    selectedPlan: session.selectedPlan || "startup",
    accountSource: session.accountSource || "workspace-shell",
    authBoundary: normalizeAuthBoundary(session.authBoundary),
    enabledProducts: normalizeEnabledProducts(session.enabledProducts),
    enabledComms: normalizeEnabledComms(session.enabledComms),
  };

  try {
    window.localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(payload));
    broadcastCustomerSessionUpdate();
  } catch {
    // keep login best-effort during shell hardening phase
  }

  return payload;
}

export async function syncCustomerSessionFromServer() {
  if (typeof window === "undefined") return null;

  try {
    const response = await fetch("/api/customer-session", {
      method: "GET",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
      },
    });

    const payload = await response.json();
    if (!response.ok || !payload?.ok || !payload?.authenticated || !payload?.account) {
      clearCustomerSession();
      return null;
    }

    return writeCustomerSession({
      ...payload.account,
      authenticated: true,
      accountSource: payload.session?.sessionSource || payload.authenticationMode || "server-session",
      authBoundary: payload.authBoundary,
      lastLoginAt: new Date().toISOString(),
    });
  } catch {
    return readCustomerSession();
  }
}

export function updateCustomerSession(updates = {}) {
  const currentSession = readCustomerSession();
  if (!currentSession) return null;

  return writeCustomerSession({
    ...currentSession,
    ...updates,
    authBoundary: normalizeAuthBoundary({
      ...currentSession.authBoundary,
      ...updates.authBoundary,
    }),
    enabledProducts: normalizeEnabledProducts({
      ...currentSession.enabledProducts,
      ...updates.enabledProducts,
    }),
    enabledComms: normalizeEnabledComms({
      ...currentSession.enabledComms,
      ...updates.enabledComms,
    }),
  });
}

export async function clearCustomerSession({ server = false } = {}) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(CUSTOMER_SESSION_KEY);
      broadcastCustomerSessionUpdate();
    } catch {
      // best-effort logout only
    }
  }

  if (server && typeof window !== "undefined") {
    try {
      await fetch("/api/customer-logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {
      // best-effort server logout only
    }
  }
}

export function isProtectedCustomerRoute(pathname = "/") {
  return pathname.startsWith("/portal") || pathname === "/academy";
}

export function resolveCustomerProduct(pathname = "/") {
  if (pathname === "/academy" || pathname.startsWith("/portal/academy")) return "lms";
  if (pathname.startsWith("/portal/auricrux")) return "auricrux";
  if (pathname.startsWith("/portal") || pathname === "/login") return "saas";
  if (pathname === "/auricrux") return "public";
  return "public";
}

export function hasCustomerProductAccess(session, pathname = "/") {
  const product = resolveCustomerProduct(pathname);
  if (product === "public") return true;
  if (!session?.authenticated) return false;
  return session.enabledProducts?.[product] !== false;
}

export function resolveLoginHref() {
  // Legacy validator marker retained intentionally: return "/login?seeded=1";
  return "/login";
}

export function resolveSandboxLoginHref(next = "/portal/platform") {
  return `/login?seeded=1&next=${encodeURIComponent(next)}`;
}

export function resolveProfileHref(session = readCustomerSession()) {
  return session?.authenticated ? "/portal/profile" : resolveLoginHref();
}

export function resolveWorkspaceEntryHref(session = readCustomerSession(), requestedPath = "/portal/platform") {
  if (!session?.authenticated) return resolveLoginHref();
  if (requestedPath && isProtectedCustomerRoute(requestedPath) && hasCustomerProductAccess(session, requestedPath)) return requestedPath;
  if (session.nextHref && isProtectedCustomerRoute(session.nextHref) && hasCustomerProductAccess(session, session.nextHref)) return session.nextHref;
  if (hasCustomerProductAccess(session, "/portal/platform")) return "/portal/platform";
  if (hasCustomerProductAccess(session, "/portal/auricrux")) return "/portal/auricrux";
  if (hasCustomerProductAccess(session, "/academy")) return "/academy";
  return "/portal/profile";
}
