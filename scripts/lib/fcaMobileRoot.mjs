import fs from "node:fs";
import path from "node:path";

/** Resolve fca-mobile-maui for local sibling checkout or CI nested checkout. */
export function resolveMobileRoot(webRoot) {
  if (process.env.FCA_MOBILE_ROOT) {
    return path.resolve(process.env.FCA_MOBILE_ROOT);
  }

  const marker = path.join("src", "FcaMobile", "Services", "FcaConfig.cs");
  const candidates = [
    path.join(webRoot, "fca-mobile-maui"),
    path.join(webRoot, "fca-mobile-maui-work"),
    path.resolve(webRoot, "..", "fca-mobile-maui"),
    path.resolve(webRoot, "..", "fca-mobile-maui-work"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, marker))) {
      return candidate;
    }
  }

  return path.resolve(webRoot, "..", "fca-mobile-maui");
}
