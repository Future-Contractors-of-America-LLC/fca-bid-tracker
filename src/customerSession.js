export const CUSTOMER_SESSION_KEY = "fca_customer_session_v1";

export function readCustomerSession() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CUSTOMER_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.authenticated ? parsed : null;
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
    workspaceLabel: session.workspaceLabel || session.company,
    lastLoginAt: session.lastLoginAt || new Date().toISOString(),
    nextHref: session.nextHref || "/portal",
  };

  try {
    window.localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(payload));
  } catch {
    // keep login best-effort during shell hardening phase
  }

  return payload;
}

export function clearCustomerSession() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(CUSTOMER_SESSION_KEY);
  } catch {
    // best-effort logout only
  }
}

export function isProtectedCustomerRoute(pathname = "/") {
  return pathname.startsWith("/portal");
}
