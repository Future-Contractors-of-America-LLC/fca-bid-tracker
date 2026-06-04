import { useEffect } from "react";

import NotFound from "./pages/website/NotFound";
import Login from "./pages/website/Login";
import { readCustomerSession, isProtectedCustomerRoute } from "./customerSession";
import { routes, normalizePath } from "./routes";
import { syncDocumentMetadata } from "./siteMetadata";

export default function Router() {
  const normalizedPath = normalizePath(window.location.pathname);
  const session = readCustomerSession();
  const needsCustomerLogin = isProtectedCustomerRoute(normalizedPath) && !session?.authenticated;
  const Page = needsCustomerLogin ? Login : routes[normalizedPath] || NotFound;

  useEffect(() => {
    syncDocumentMetadata(needsCustomerLogin ? "/login" : normalizedPath);
  }, [needsCustomerLogin, normalizedPath]);

  return <Page requestedPath={normalizedPath} accessMode={needsCustomerLogin ? "protected" : "direct"} />;
}
