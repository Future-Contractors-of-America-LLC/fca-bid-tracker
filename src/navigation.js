import { isProtectedCustomerRoute } from "./customerSession";
import { normalizePath, routes } from "./routes";

export const NAVIGATION_EVENT = "auricrux:navigate";

export function isManagedAppPath(pathname = "/") {
  const normalized = normalizePath(pathname);
  return Boolean(routes[normalized]) || isProtectedCustomerRoute(normalized);
}

export function isManagedNavigationTarget(href = "") {
  if (!href || typeof href !== "string") return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return false;
  if (href.startsWith("http://") || href.startsWith("https://")) {
    try {
      const url = new URL(href);
      if (typeof window !== "undefined" && url.origin !== window.location.origin) return false;
      return isManagedAppPath(url.pathname);
    } catch {
      return false;
    }
  }
  if (!href.startsWith("/")) return false;
  if (href.endsWith(".html")) return false;
  return isManagedAppPath(href);
}

export function navigateTo(href = "/") {
  if (typeof window === "undefined") return;

  if (!isManagedNavigationTarget(href)) {
    window.location.assign(href);
    return;
  }

  const url = href.startsWith("http://") || href.startsWith("https://") ? new URL(href) : new URL(href, window.location.origin);
  const nextPath = `${url.pathname}${url.search}${url.hash}`;
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextPath !== currentPath) {
    window.history.pushState({}, "", nextPath);
  }

  window.dispatchEvent(new CustomEvent(NAVIGATION_EVENT, { detail: { href: nextPath } }));
}
