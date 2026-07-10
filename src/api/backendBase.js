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

function isAuthExempt(path) {
  return AUTH_EXEMPT_PATHS.some((exempt) => path.startsWith(exempt));
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
  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  // Cross-origin SWA -> Central cannot rely on HttpOnly cookies; send bearer token when present.
  if (typeof window !== "undefined" && !headers.Authorization && !headers.authorization) {
    try {
      const raw = window.localStorage.getItem("fca_customer_session_v1");
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed?.sessionToken) {
        headers.Authorization = `Bearer ${parsed.sessionToken}`;
      }
    } catch {
      // ignore malformed local session
    }
  }

  return fetch(centralApi(path), {
    credentials: isSameOrigin ? "include" : "omit",
    ...options,
    headers,
  }).then((response) => handleApiResponse(response, path));
}
