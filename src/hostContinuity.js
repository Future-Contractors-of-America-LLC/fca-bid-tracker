import { isProtectedCustomerRoute } from "./customerSession";
import { FCA_APP_HOST, FCA_MARKETING_HOST } from "./config/domainHosts";

const MARKETING_HOSTS = new Set([
  FCA_MARKETING_HOST,
  `www.${FCA_MARKETING_HOST}`,
]);

/** Keep third-party website validators on the marketing host they were given. */
function isWebsiteVerificationCrawler() {
  if (typeof navigator === "undefined") return false;
  const ua = String(navigator.userAgent || "").toLowerCase();
  return /googlebot|google-inspectiontool|storebot-google|adsbot-google|bingbot|slurp|duckduckbot|yandexbot|baiduspider|facebot|facebookexternalhit|linkedinbot|twitterbot|applebot|semrushbot|ahrefsbot|bytespider|gptbot|claudebot|amazonbot|petalbot/.test(
    ua,
  );
}

/** Redirect login and protected workspace routes from apex/www to app.* */
export function ensureProductHostContinuity() {
  if (typeof window === "undefined") return false;
  if (isWebsiteVerificationCrawler()) return false;

  const { hostname, pathname, search, hash } = window.location;
  if (!MARKETING_HOSTS.has(hostname)) return false;

  const isProductRoute = pathname === "/login" || isProtectedCustomerRoute(pathname);
  if (!isProductRoute) return false;

  window.location.replace(`https://${FCA_APP_HOST}${pathname}${search}${hash}`);
  return true;
}
