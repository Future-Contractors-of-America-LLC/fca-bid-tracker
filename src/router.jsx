import Home from "./pages/website/Home";
import PortalHome from "./pages/portal/PortalHome";
import AcademyHome from "./pages/academy/AcademyHome";

export default function Router() {
  const path = window.location.pathname;

  if (path === "/portal") return <PortalHome />;
  if (path === "/academy") return <AcademyHome />;

  return <Home />;
}