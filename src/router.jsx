import { useEffect, useState } from "react";

import NotFound from "./pages/website/NotFound";
import Login from "./pages/website/Login";
import { readCustomerSession, isProtectedCustomerRoute } from "./customerSession";
import { NAVIGATION_EVENT, isManagedNavigationTarget, navigateTo } from "./navigation";
import { routes, normalizePath } from "./routes";
import { syncDocumentMetadata } from "./siteMetadata";

function readCurrentPath() {
  return normalizePath(window.location.pathname);
}

export default function Router() {
  const [normalizedPath, setNormalizedPath] = useState(readCurrentPath);
  const session = readCustomerSession();
  const needsCustomerLogin = isProtectedCustomerRoute(normalizedPath) && !session?.authenticated;
  const Page = needsCustomerLogin ? Login : routes[normalizedPath] || NotFound;

  useEffect(() => {
    function syncRouteFromLocation() {
      setNormalizedPath(readCurrentPath());
    }

    function handleDocumentClick(event) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = event.target.closest("a[href]");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!isManagedNavigationTarget(href)) return;

      event.preventDefault();
      navigateTo(href);
    }

    window.addEventListener("popstate", syncRouteFromLocation);
    window.addEventListener(NAVIGATION_EVENT, syncRouteFromLocation);
    document.addEventListener("click", handleDocumentClick);

    return () => {
      window.removeEventListener("popstate", syncRouteFromLocation);
      window.removeEventListener(NAVIGATION_EVENT, syncRouteFromLocation);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    syncDocumentMetadata(needsCustomerLogin ? "/login" : normalizedPath);
  }, [needsCustomerLogin, normalizedPath]);

  return <Page requestedPath={normalizedPath} accessMode={needsCustomerLogin ? "protected" : "direct"} />;
}
