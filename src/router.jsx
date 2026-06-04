import { useEffect } from "react";

import NotFound from "./pages/website/NotFound";
import { routes, normalizePath } from "./routes";
import { syncDocumentMetadata } from "./siteMetadata";

export default function Router() {
  const normalizedPath = normalizePath(window.location.pathname);
  const Page = routes[normalizedPath] || NotFound;

  useEffect(() => {
    syncDocumentMetadata(normalizedPath);
  }, [normalizedPath]);

  return <Page requestedPath={normalizedPath} />;
}
