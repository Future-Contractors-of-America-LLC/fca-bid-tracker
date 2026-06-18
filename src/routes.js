import Home from "./pages/website/Home";
import Platform from "./pages/website/Platform";
import Login from "./pages/website/Login";
import Pricing from "./pages/website/Pricing";
import Contact from "./pages/website/Contact";
import Auricrux from "./pages/website/Auricrux";
import Warranty from "./pages/website/Warranty";
import Referrals from "./pages/website/Referrals";
import Terms from "./pages/website/Terms";
import Privacy from "./pages/website/Privacy";
import Refunds from "./pages/website/Refunds";
import NotFound from "./pages/website/NotFound";
import LegacyBidEntry from "./pages/website/LegacyBidEntry";
import LegacyBidStatus from "./pages/website/LegacyBidStatus";

import PortalHome from "./pages/portal/PortalHome";
import PlatformDashboard from "./pages/portal/PlatformDashboard";
import PortalProjects from "./pages/portal/PortalProjects";
import PortalFiles from "./pages/portal/PortalFiles";
import PortalAudit from "./pages/portal/PortalAudit";
import PortalMessages from "./pages/portal/PortalMessages";
import PortalNotifications from "./pages/portal/PortalNotifications";
import PortalBids from "./pages/portal/PortalBids";
import PortalEstimates from "./pages/portal/PortalEstimates";
import PortalProposals from "./pages/portal/PortalProposals";
import PortalBilling from "./pages/portal/PortalBilling";
import PortalSupport from "./pages/portal/PortalSupport";
import PortalAdmin from "./pages/portal/PortalAdmin";
import PortalProfile from "./pages/portal/PortalProfile";
import PortalAuricrux from "./pages/portal/PortalAuricrux";
import PortalOperations from "./pages/portal/PortalOperations";
import PortalOpportunityDetail from "./pages/portal/PortalOpportunityDetail";
import PortalProjectDetail from "./pages/portal/PortalProjectDetail";

import AcademyHome from "./pages/academy/AcademyHome";
import AcademyCatalog from "./pages/academy/AcademyCatalog";

export const routes = {
  "/": Home,
  "/platform": Platform,
  "/login": Login,
  "/pricing": Pricing,
  "/contact": Contact,
  "/auricrux": Auricrux,
  "/warranty": Warranty,
  "/referrals": Referrals,
  "/terms": Terms,
  "/privacy": Privacy,
  "/refunds": Refunds,
  "/not-found": NotFound,
  "/bid-entry": LegacyBidEntry,
  "/bid-status": LegacyBidStatus,

  "/portal": PortalHome,
  "/portal/platform": PlatformDashboard,
  "/portal/operations": PortalOperations,
  "/portal/projects": PortalProjects,
  "/portal/files": PortalFiles,
  "/portal/audit": PortalAudit,
  "/portal/messages": PortalMessages,
  "/portal/notifications": PortalNotifications,
  "/portal/bids": PortalBids,
  "/portal/estimates": PortalEstimates,
  "/portal/proposals": PortalProposals,
  "/portal/billing": PortalBilling,
  "/portal/support": PortalSupport,
  "/portal/admin": PortalAdmin,
  "/portal/profile": PortalProfile,
  "/portal/auricrux": PortalAuricrux,
  "/portal/academy": AcademyHome,

  "/academy": AcademyHome,
  "/academy/catalog": AcademyCatalog,
};

export const routePatterns = [
  {
    pattern: "/portal/opportunities/:opportunityId",
    Page: PortalOpportunityDetail,
  },
  {
    pattern: "/portal/projects/:projectId",
    Page: PortalProjectDetail,
  },
];

export function normalizePath(pathname) {
  if (typeof pathname !== "string" || !pathname.trim()) return "/";

  const trimmed = pathname.trim();
  const withoutQuery = trimmed.split(/[?#]/, 1)[0] || "/";
  const withLeadingSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;

  if (withLeadingSlash.length > 1 && withLeadingSlash.endsWith("/")) {
    return withLeadingSlash.slice(0, -1);
  }

  return withLeadingSlash || "/";
}

export function matchRoutePattern(pattern, pathname) {
  const normalizedPattern = normalizePath(pattern);
  const normalizedPath = normalizePath(pathname);

  const patternParts = normalizedPattern.split("/").filter(Boolean);
  const pathParts = normalizedPath.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) return null;

  const params = {};

  for (let index = 0; index < patternParts.length; index += 1) {
    const patternPart = patternParts[index];
    const pathPart = pathParts[index];

    if (patternPart.startsWith(":")) {
      params[patternPart.slice(1)] = pathPart;
      continue;
    }

    if (patternPart !== pathPart) return null;
  }

  return params;
}

export function resolveRoute(pathname) {
  const normalizedPath = normalizePath(pathname);

  if (routes[normalizedPath]) {
    return {
      Page: routes[normalizedPath],
      params: {},
      matchedPath: normalizedPath,
      pattern: normalizedPath,
    };
  }

  for (const entry of routePatterns) {
    const params = matchRoutePattern(entry.pattern, normalizedPath);
    if (params) {
      return {
        Page: entry.Page,
        params,
        matchedPath: normalizedPath,
        pattern: entry.pattern,
      };
    }
  }

  return null;
}
