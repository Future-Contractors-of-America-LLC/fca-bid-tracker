import { Suspense, useEffect, useMemo, useState } from "react";

import NotFound from "./pages/website/NotFound";
import Login from "./pages/website/Login";
import AccessRestricted from "./pages/website/AccessRestricted";
import AuricruxFrontendDock from "./components/AuricruxFrontendDock";
import {
  CUSTOMER_SESSION_EVENT,
  CUSTOMER_SESSION_EXPIRED_EVENT,
  readCustomerSession,
  hydrateCustomerSession,
  canRenderProtectedRouteImmediately,
  hasCustomerProductAccess,
  isProtectedCustomerRoute,
  resolveSessionExpiredLoginHref,
} from "./customerSession";
import { NAVIGATION_EVENT, isManagedNavigationTarget, navigateTo, prefetchManagedPath } from "./navigation";
import { normalizePath, resolveRoute } from "./routes";
import { syncDocumentMetadata } from "./siteMetadata";

function readCurrentPath() {
  return normalizePath(window.location.pathname);
}

function LoadingRoute() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", color: "#0f172a", fontFamily: "Arial" }}>
      Loading FCA workspace session…
    </div>
  );
}

export default function Router() {
  const initialPath = readCurrentPath();
  const [normalizedPath, setNormalizedPath] = useState(initialPath);
  const [session, setSession] = useState(() => readCustomerSession());
  const [sessionReady, setSessionReady] = useState(() => canRenderProtectedRouteImmediately(initialPath));

  const routeMatch = useMemo(() => resolveRoute(normalizedPath), [normalizedPath]);

  const activeSession = sessionReady ? session : readCustomerSession();
  const needsCustomerLogin = sessionReady && isProtectedCustomerRoute(normalizedPath) && !activeSession?.authenticated;
  const lacksProductAccess = sessionReady && !needsCustomerLogin && isProtectedCustomerRoute(normalizedPath) && !hasCustomerProductAccess(activeSession, normalizedPath);
  const Page = !sessionReady
    ? LoadingRoute
    : needsCustomerLogin
      ? Login
      : lacksProductAccess
        ? AccessRestricted
        : routeMatch?.Page || NotFound;

  useEffect(() => {
    let active = true;

    async function hydrateSession() {
      try {
        const synced = await hydrateCustomerSession();
        if (!active) return;
        setSession(synced || readCustomerSession());
      } catch {
        if (!active) return;
        setSession(readCustomerSession());
      } finally {
        if (active) {
          setSessionReady(true);
        }
      }
    }

    function syncRouteFromLocation() {
      setNormalizedPath(readCurrentPath());
      setSession(readCustomerSession());
    }

    function handleCustomerSessionUpdate() {
      if (!active) return;
      setSession(readCustomerSession());
    }

    function handleSessionExpired() {
      if (!active) return;
      setSession(null);
      const path = readCurrentPath();
      if (isProtectedCustomerRoute(path)) {
        navigateTo(resolveSessionExpiredLoginHref(path));
      }
    }

    function handleDocumentClick(event) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;

      const anchor = event.target.closest("a[href]");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!isManagedNavigationTarget(href)) return;

      event.preventDefault();
      navigateTo(href);
    }

    function handleDocumentPointerOver(event) {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (href) prefetchManagedPath(href);
    }

    hydrateSession();
    window.addEventListener("popstate", syncRouteFromLocation);
    window.addEventListener(NAVIGATION_EVENT, syncRouteFromLocation);
    window.addEventListener(CUSTOMER_SESSION_EVENT, handleCustomerSessionUpdate);
    window.addEventListener(CUSTOMER_SESSION_EXPIRED_EVENT, handleSessionExpired);
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("mouseover", handleDocumentPointerOver);

    return () => {
      active = false;
      window.removeEventListener("popstate", syncRouteFromLocation);
      window.removeEventListener(NAVIGATION_EVENT, syncRouteFromLocation);
      window.removeEventListener(CUSTOMER_SESSION_EVENT, handleCustomerSessionUpdate);
      window.removeEventListener(CUSTOMER_SESSION_EXPIRED_EVENT, handleSessionExpired);
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("mouseover", handleDocumentPointerOver);
    };
  }, []);

  useEffect(() => {
    syncDocumentMetadata(needsCustomerLogin ? "/login" : normalizedPath);
  }, [needsCustomerLogin, normalizedPath]);

  return (
    <>
      <Suspense fallback={<LoadingRoute />}>
        <Page
          requestedPath={normalizedPath}
          routeParams={routeMatch?.params || {}}
          matchedPattern={routeMatch?.pattern || normalizedPath}
          accessMode={needsCustomerLogin ? "protected" : lacksProductAccess ? "restricted" : "direct"}
        />
      </Suspense>
      <AuricruxFrontendDock />
    </>
  );
}
