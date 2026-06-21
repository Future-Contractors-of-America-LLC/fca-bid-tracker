import { isProtectedCustomerRoute } from "./customerSession";
import { FCA_APP_HOST, FCA_MARKETING_HOST } from "./config/domainHosts";

const MARKETING_HOSTS = new Set([
  FCA_MARKETING_HOST,
  `www.${FCA_MARKETING_HOST}`,
]);

/** Redirect login and protected workspace routes from apex/www to app.* */
export function ensureProductHostContinuity() {
  if (typeof window === "undefined") return false;

  const { hostname, pathname, search, hash } = window.location;
  if (!MARKETING_HOSTS.has(hostname)) return false;

  const isProductRoute = pathname === "/login" || isProtectedCustomerRoute(pathname);
  if (!isProductRoute) return false;

  window.location.replace(`https://${FCA_APP_HOST}${pathname}${search}${hash}`);
  return true;
}
