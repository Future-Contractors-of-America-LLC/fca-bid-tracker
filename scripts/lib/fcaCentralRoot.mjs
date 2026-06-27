import fs from "node:fs";
import path from "node:path";

/** Resolve auricrux-central for local sibling checkout or CI nested checkout. */
export function resolveCentralRoot(webRoot) {
  if (process.env.FCA_CENTRAL_ROOT) {
    return path.resolve(process.env.FCA_CENTRAL_ROOT);
  }

  const marker = "FCA_COVERAGE_MATRIX.md";
  const candidates = [
    path.join(webRoot, "auricrux-central"),
    path.join(webRoot, "auricrux-central-work"),
    path.resolve(webRoot, "..", "auricrux-central"),
    path.resolve(webRoot, "..", "auricrux-central-work"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, marker))) {
      return candidate;
    }
  }

  return path.resolve(webRoot, "..", "auricrux-central");
}
