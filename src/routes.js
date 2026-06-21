import { lazy } from "react";

const lazyPage = (loader) => lazy(loader);

export const routes = {
  "/": lazyPage(() => import("./pages/website/Home")),
  "/platform": lazyPage(() => import("./pages/website/Platform")),
  "/login": lazyPage(() => import("./pages/website/Login")),
  "/intake": lazyPage(() => import("./pages/website/Intake")),
  "/checkout": lazyPage(() => import("./pages/website/Checkout")),
  "/pricing": lazyPage(() => import("./pages/website/Pricing")),
  "/features": lazyPage(() => import("./pages/website/Features")),
  "/solutions": lazyPage(() => import("./pages/website/Solutions")),
  "/contact": lazyPage(() => import("./pages/website/Contact")),
  "/auricrux": lazyPage(() => import("./pages/website/Auricrux")),
  "/warranty": lazyPage(() => import("./pages/website/Warranty")),
  "/referrals": lazyPage(() => import("./pages/website/Referrals")),
  "/terms": lazyPage(() => import("./pages/website/Terms")),
  "/privacy": lazyPage(() => import("./pages/website/Privacy")),
  "/legal": lazyPage(() => import("./pages/website/LegalHub")),
  "/legal/contractor-resources": lazyPage(() => import("./pages/website/ContractorLegalResources")),
  "/cookies": lazyPage(() => import("./pages/website/Cookies")),
  "/acceptable-use": lazyPage(() => import("./pages/website/AcceptableUse")),
  "/security": lazyPage(() => import("./pages/website/Security")),
  "/subprocessors": lazyPage(() => import("./pages/website/Subprocessors")),
  "/ai-policy": lazyPage(() => import("./pages/website/AiPolicy")),
  "/accessibility": lazyPage(() => import("./pages/website/Accessibility")),
  "/dmca": lazyPage(() => import("./pages/website/Dmca")),
  "/refunds": lazyPage(() => import("./pages/website/Refunds")),
  "/ip": lazyPage(() => import("./pages/website/IpNotice")),
  "/not-found": lazyPage(() => import("./pages/website/NotFound")),
  "/bid-entry": lazyPage(() => import("./pages/website/LegacyBidEntry")),
  "/bid-status": lazyPage(() => import("./pages/website/LegacyBidStatus")),

  "/portal": lazyPage(() => import("./pages/portal/PortalHome")),
  "/portal/legal": lazyPage(() => import("./pages/portal/PortalLegal")),
  "/portal/platform": lazyPage(() => import("./pages/portal/PlatformDashboard")),
  "/portal/operations": lazyPage(() => import("./pages/portal/PortalOperations")),
  "/portal/pipeline": lazyPage(() => import("./pages/portal/PortalPipeline")),
  "/portal/projects": lazyPage(() => import("./pages/portal/PortalProjects")),
  "/portal/files": lazyPage(() => import("./pages/portal/PortalFiles")),
  "/portal/audit": lazyPage(() => import("./pages/portal/PortalAudit")),
  "/portal/messages": lazyPage(() => import("./pages/portal/PortalMessages")),
  "/portal/notifications": lazyPage(() => import("./pages/portal/PortalNotifications")),
  "/portal/bids": lazyPage(() => import("./pages/portal/PortalBids")),
  "/portal/estimates": lazyPage(() => import("./pages/portal/PortalEstimates")),
  "/portal/proposals": lazyPage(() => import("./pages/portal/PortalProposals")),
  "/portal/billing": lazyPage(() => import("./pages/portal/PortalBilling")),
  "/portal/support": lazyPage(() => import("./pages/portal/PortalSupport")),
  "/portal/admin": lazyPage(() => import("./pages/portal/PortalAdmin")),
  "/portal/profile": lazyPage(() => import("./pages/portal/PortalProfile")),
  "/portal/auricrux": lazyPage(() => import("./pages/portal/PortalAuricrux")),
  "/portal/academy": lazyPage(() => import("./pages/academy/AcademyHome")),
  "/portal/plans": lazyPage(() => import("./pages/portal/PortalPlans")),
  "/portal/finance": lazyPage(() => import("./pages/portal/PortalFinance")),
  "/portal/design": lazyPage(() => import("./pages/portal/PortalDesignWorkspace")),
  "/portal/rfis": lazyPage(() => import("./pages/portal/PortalRfis")),
  "/portal/change-orders": lazyPage(() => import("./pages/portal/PortalChangeOrders")),
  "/portal/closeout": lazyPage(() => import("./pages/portal/PortalCloseout")),
  "/portal/scheduling": lazyPage(() => import("./pages/portal/PortalScheduling")),
  "/portal/field-tasks": lazyPage(() => import("./pages/portal/PortalFieldTasks")),
  "/portal/field-supervision": lazyPage(() => import("./pages/portal/PortalFieldSupervision")),
  "/portal/warranty": lazyPage(() => import("./pages/portal/PortalWarranty")),

  "/academy": lazyPage(() => import("./pages/academy/AcademyHome")),
  "/academy/catalog": lazyPage(() => import("./pages/academy/AcademyCatalog")),
  "/academy/pathway": lazyPage(() => import("./pages/academy/AcademyPathwayHub")),
  "/academy/dashboard": lazyPage(() => import("./pages/academy/AcademyDashboard")),
  "/academy/credentials": lazyPage(() => import("./pages/academy/AcademyCredentials")),
  "/academy/store": lazyPage(() => import("./pages/academy/store/AcademyStore")),
  "/academy/store/success": lazyPage(() => import("./pages/academy/store/AcademyStoreSuccess")),
};

export const routePatterns = [
  {
    pattern: "/portal/opportunities/:opportunityId",
    Page: lazyPage(() => import("./pages/portal/PortalOpportunityDetail")),
  },
  {
    pattern: "/portal/projects/:projectId",
    Page: lazyPage(() => import("./pages/portal/PortalProjectDetail")),
  },
  {
    pattern: "/portal/billing/:invoiceId",
    Page: lazyPage(() => import("./pages/portal/PortalInvoiceDetail")),
  },
  {
    pattern: "/academy/programs/:programId",
    Page: lazyPage(() => import("./pages/academy/AcademyProgramDetail")),
  },
  {
    pattern: "/academy/programs/:programId/modules/:moduleNumber",
    Page: lazyPage(() => import("./pages/academy/AcademyModuleLesson")),
  },
  {
    pattern: "/academy/store/course/:programKey",
    Page: lazyPage(() => import("./pages/academy/store/AcademyStoreCourse")),
  },
  {
    pattern: "/academy/store/pathway/:pathwayKey",
    Page: lazyPage(() => import("./pages/academy/store/AcademyStorePathway")),
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
