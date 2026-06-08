import Home from "./pages/website/Home";
import Platform from "./pages/website/Platform";
import Login from "./pages/website/Login";
import Pricing from "./pages/website/Pricing";
import Contact from "./pages/website/Contact";
import Auricrux from "./pages/website/Auricrux";
import Warranty from "./pages/website/Warranty";
import Referrals from "./pages/website/Referrals";
import NotFound from "./pages/website/NotFound";
import LegacyBidEntry from "./pages/website/LegacyBidEntry";
import LegacyBidStatus from "./pages/website/LegacyBidStatus";

import PortalHome from "./pages/portal/PortalHome";
import PlatformDashboard from "./pages/portal/PlatformDashboard";
import PortalProjects from "./pages/portal/PortalProjects";
import PortalFiles from "./pages/portal/PortalFiles";
import PortalMessages from "./pages/portal/PortalMessages";
import PortalNotifications from "./pages/portal/PortalNotifications";
import PortalBids from "./pages/portal/PortalBids";
import PortalBilling from "./pages/portal/PortalBilling";
import PortalSupport from "./pages/portal/PortalSupport";
import PortalAdmin from "./pages/portal/PortalAdmin";
import PortalProfile from "./pages/portal/PortalProfile";
import PortalAuricrux from "./pages/portal/PortalAuricrux";
import PortalOperations from "./pages/portal/PortalOperations";

import AcademyHome from "./pages/academy/AcademyHome";

export const routes = {
  "/": Home,
  "/platform": Platform,
  "/login": Login,
  "/pricing": Pricing,
  "/contact": Contact,
  "/auricrux": Auricrux,
  "/warranty": Warranty,
  "/referrals": Referrals,
  "/not-found": NotFound,
  "/bid-entry": LegacyBidEntry,
  "/bid-status": LegacyBidStatus,

  "/portal": PortalHome,
  "/portal/platform": PlatformDashboard,
  "/portal/operations": PortalOperations,
  "/portal/projects": PortalProjects,
  "/portal/files": PortalFiles,
  "/portal/messages": PortalMessages,
  "/portal/notifications": PortalNotifications,
  "/portal/bids": PortalBids,
  "/portal/billing": PortalBilling,
  "/portal/support": PortalSupport,
  "/portal/admin": PortalAdmin,
  "/portal/profile": PortalProfile,
  "/portal/auricrux": PortalAuricrux,
  "/portal/academy": AcademyHome,

  "/academy": AcademyHome,
};

export function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}
