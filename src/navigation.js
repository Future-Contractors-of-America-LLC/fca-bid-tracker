import { isProtectedCustomerRoute } from "./customerSession";
import { normalizePath, routes } from "./routes";

export const NAVIGATION_EVENT = "auricrux:navigate";

function isUnsafeProtocolTarget(href) {
  const normalizedHref = href.trim().toLowerCase();
  return normalizedHref.startsWith("javascript:") || normalizedHref.startsWith("data:") || normalizedHref.startsWith("vbscript:");
}

export function isManagedAppPath(pathname = "/") {
  const normalized = normalizePath(pathname);
  return Boolean(routes[normalized]) || isProtectedCustomerRoute(normalized);
}

export function isManagedNavigationTarget(href = "") {
  if (!href || typeof href !== "string") return false;

  const trimmedHref = href.trim();
  if (!trimmedHref) return false;
  if (isUnsafeProtocolTarget(trimmedHref)) return false;
  if (trimmedHref.startsWith("mailto:") || trimmedHref.startsWith("tel:") || trimmedHref.startsWith("#")) return false;

  try {
    const baseOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost";
    const url = new URL(trimmedHref, baseOrigin);

    if (typeof window !== "undefined" && url.origin !== window.location.origin) return false;
    if (url.pathname.endsWith(".html")) return false;

    return isManagedAppPath(url.pathname);
  } catch {
    return false;
  }
}

export function navigateTo(href = "/") {
  if (typeof window === "undefined") return;

  const nextHref = typeof href === "string" ? href.trim() : "/";
  if (!nextHref || isUnsafeProtocolTarget(nextHref)) return;

  if (!isManagedNavigationTarget(nextHref)) {
    window.location.assign(nextHref);
    return;
  }

  let url;
  try {
    url = new URL(nextHref, window.location.origin);
  } catch {
    return;
  }

  const nextPath = `${url.pathname}${url.search}${url.hash}`;
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextPath !== currentPath) {
    window.history.pushState({}, "", nextPath);
  }

  window.dispatchEvent(new CustomEvent(NAVIGATION_EVENT, { detail: { href: nextPath } }));
}
