import React from "react";

import NotFound from "./src/pages/website/NotFound";
import { routes, normalizePath } from "./src/routes";

export { routes, normalizePath };

export default function Router() {
  const normalizedPath = normalizePath(window.location.pathname);
  const Page = routes[normalizedPath] || NotFound;

  return <Page requestedPath={normalizedPath} />;
}
