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

export function centralFetch(path, options = {}) {
  const isSameOrigin = typeof window !== "undefined" && centralApi(path).startsWith(window.location.origin);
  return fetch(centralApi(path), {
    credentials: isSameOrigin ? "include" : "omit",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });
}
