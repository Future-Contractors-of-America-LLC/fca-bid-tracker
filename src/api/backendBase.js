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
  return fetch(centralApi(path), {
    credentials: isSameOrigin ? "include" : "omit",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
  }).then((response) => handleApiResponse(response, path));
}
