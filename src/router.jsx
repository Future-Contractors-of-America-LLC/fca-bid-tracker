import Home from "./pages/website/Home";
import Platform from "./pages/website/Platform";
import AuricruxPage from "./pages/website/Auricrux";
import Pricing from "./pages/website/Pricing";
import Contact from "./pages/website/Contact";
import Login from "./pages/website/Login";
import PortalHome from "./pages/portal/PortalHome";
import PortalProjects from "./pages/portal/PortalProjects";
import PortalBids from "./pages/portal/PortalBids";
import PortalFiles from "./pages/portal/PortalFiles";
import PortalMessages from "./pages/portal/PortalMessages";
import PortalBilling from "./pages/portal/PortalBilling";
import AcademyHome from "./pages/academy/AcademyHome";

export default function Router() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";

  if (path === "/platform") return <Platform />;
  if (path === "/auricrux") return <AuricruxPage />;
  if (path === "/pricing") return <Pricing />;
  if (path === "/contact") return <Contact />;
  if (path === "/login") return <Login />;
  if (path === "/portal") return <PortalHome />;
  if (path === "/portal/projects") return <PortalProjects />;
  if (path === "/portal/bids") return <PortalBids />;
  if (path === "/portal/files") return <PortalFiles />;
  if (path === "/portal/messages") return <PortalMessages />;
  if (path === "/portal/billing") return <PortalBilling />;
  if (path === "/portal/academy") return <AcademyHome />;
  if (path === "/academy") return <AcademyHome />;

  return <Home />;
}
