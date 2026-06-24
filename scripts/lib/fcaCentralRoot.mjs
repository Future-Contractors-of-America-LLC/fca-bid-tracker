import fs from "node:fs";
import path from "node:path";

/** Resolve auricrux-central for local sibling checkout or CI nested checkout. */
export function resolveCentralRoot(webRoot) {
  if (process.env.FCA_CENTRAL_ROOT) {
    return path.resolve(process.env.FCA_CENTRAL_ROOT);
  }
  const nested = path.join(webRoot, "auricrux-central-work");
  const sibling = path.resolve(webRoot, "..", "auricrux-central-work");
  const marker = "FCA_COVERAGE_MATRIX.md";
  if (fs.existsSync(path.join(nested, marker))) return nested;
  if (fs.existsSync(path.join(sibling, marker))) return sibling;
  return sibling;
}
