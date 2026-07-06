import {
  FCA_API_BASE,
  FCA_AZURE_API_FALLBACK_ORIGIN,
} from "../config/domainHosts.js";

export function backendBaseUrl() {
  if (typeof window !== "undefined" && window.FCA_BACKEND?.baseUrl) {
    return String(window.FCA_BACKEND.baseUrl).replace(/\/$/, "");
  }
  return FCA_API_BASE || FCA_AZURE_API_FALLBACK_ORIGIN;
}

export function centralApi(path) {
  const base = backendBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

const AUTH_EXEMPT_PATHS = ["/api/customer-login", "/api/customer-verify", "/api/customer-logout"];
const CUSTOMER_SESSION_STORAGE_KEY = "fca_customer_session_v1";

export function isCteStudentRole(role = "") {
  const normalized = String(role || "").trim().toLowerCase().replace(/_/g, "-");
  return normalized === "student" || normalized === "cte-student" || normalized === "minor" || (normalized.includes("cte") && normalized.includes("student"));
}

function isAuthExempt(path) {
  return AUTH_EXEMPT_PATHS.some((exempt) => path.startsWith(exempt));
}

function readCustomerSessionForHeaders() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CUSTOMER_SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isCteShadowSession(session = null) {
  return Boolean(
    session?.cteProgramEnabled === true ||
      session?.accountMode === "cte-shadow" ||
      session?.accountMode === "student-shadow" ||
      isCteStudentRole(session?.role),
  );
}

export function buildExecutionContextHeaders() {
  if (typeof window === "undefined") return {};

  const session = readCustomerSessionForHeaders();
  const customerId = session?.customerId || "";
  const userEmail = session?.email || "";
  const userRole = session?.role || "";
  const route = window.location?.pathname || "/";
  const shadowSession = isCteShadowSession(session);
  const targetEnvironment = shadowSession ? "cte" : route.startsWith("/academy") || route.startsWith("/portal/academy") ? "academy" : "saas";

  const headers = {
    "x-fca-route": route,
    "x-fca-target-environment": targetEnvironment,
  };

  if (session?.issuedAt && session?.accessTokenExpiresAt) {
    headers["x-fca-continuous-auth"] = "signed-server-session";
    headers["x-fca-auth-issued-at"] = String(session.issuedAt);
    headers["x-fca-access-token-expires-at"] = String(session.accessTokenExpiresAt);
  }

  if (customerId) {
    headers["x-fca-customer-id"] = customerId;
    // Keep tenant context stable until explicit tenant identity is separated from customer account identity.
    headers["x-fca-tenant-id"] = customerId;
  }

  if (shadowSession) {
    headers["x-fca-shadow-mode"] = "cte-sandbox";
    headers["x-fca-minor-privacy-mode"] = "true";
    headers["x-fca-auricrux-mode"] = "mock";
    headers["x-fca-source-environment"] = "cte";
    headers["x-fca-user-id"] = customerId ? `cte-shadow-${customerId}` : "cte-shadow-student";
  } else if (userEmail) headers["x-fca-user-id"] = userEmail;
  if (userRole) headers["x-fca-user-role"] = userRole;

  return headers;
}

function handleApiResponse(response, path) {
  if (response.status === 401 && !isAuthExempt(path) && typeof window !== "undefined") {
    const currentPath = window.location.pathname;
    const isProtected = currentPath.startsWith("/portal") || currentPath.startsWith("/academy");
    if (isProtected) {
      const nextParam = encodeURIComponent(currentPath);
      const loginHref = `/login?session=expired&next=${nextParam}`;
      window.location.href = loginHref;
    }
  }
  return response;
}

export function centralFetch(path, options = {}) {
  const isSameOrigin = typeof window !== "undefined" && centralApi(path).startsWith(window.location.origin);
  return fetch(centralApi(path), {
    credentials: isSameOrigin ? "include" : "omit",
    ...options,
    headers: {
      Accept: "application/json",
      ...buildExecutionContextHeaders(),
      ...(options.headers || {}),
    },
  }).then((response) => handleApiResponse(response, path));
}
