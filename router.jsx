import React from "react";

import Home from "./src/pages/website/Home";
import Platform from "./src/pages/website/Platform";
import Login from "./src/pages/website/Login";
import Pricing from "./src/pages/website/Pricing";
import Contact from "./src/pages/website/Contact";
import Auricrux from "./src/pages/website/Auricrux";
import NotFound from "./src/pages/website/NotFound";
import LegacyBidEntry from "./src/pages/website/LegacyBidEntry";
import LegacyBidStatus from "./src/pages/website/LegacyBidStatus";

import PortalHome from "./src/pages/portal/PortalHome";
import PlatformDashboard from "./src/pages/portal/PlatformDashboard";
import PortalProjects from "./src/pages/portal/PortalProjects";
import PortalFiles from "./src/pages/portal/PortalFiles";
import PortalMessages from "./src/pages/portal/PortalMessages";
import PortalBids from "./src/pages/portal/PortalBids";
import PortalBilling from "./src/pages/portal/PortalBilling";
import PortalSupport from "./src/pages/portal/PortalSupport";
import PortalAdmin from "./src/pages/portal/PortalAdmin";

import AcademyHome from "./src/pages/academy/AcademyHome";

export const routes = {
  "/": Home,
  "/platform": Platform,
  "/login": Login,
  "/pricing": Pricing,
  "/contact": Contact,
  "/auricrux": Auricrux,
  "/not-found": NotFound,
  "/bid-entry": LegacyBidEntry,
  "/bid-status": LegacyBidStatus,

  "/portal": PortalHome,
  "/portal/platform": PlatformDashboard,
  "/portal/projects": PortalProjects,
  "/portal/files": PortalFiles,
  "/portal/messages": PortalMessages,
  "/portal/bids": PortalBids,
  "/portal/billing": PortalBilling,
  "/portal/support": PortalSupport,
  "/portal/admin": PortalAdmin,
  "/portal/academy": AcademyHome,

  "/academy": AcademyHome,
};

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export default function Router() {
  const normalizedPath = normalizePath(window.location.pathname);
  const Page = routes[normalizedPath] || NotFound;

  return <Page requestedPath={normalizedPath} />;
}
