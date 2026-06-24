import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const centralRoot = path.resolve(root, "..", "auricrux-central");
const errors = [];

function requireFile(relativePath, base = root) {
  const absolute = path.join(base, relativePath);
  if (!fs.existsSync(absolute)) {
    errors.push(`Missing required file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolute, "utf8");
}

function requireIncludes(relativePath, needles, base = root) {
  const content = requireFile(relativePath, base);
  needles.forEach((needle) => {
    if (!content.includes(needle)) {
      errors.push(`${relativePath} missing expected content: ${needle}`);
    }
  });
}

requireIncludes("src/routes.js", ["/portal/immersive", "PortalImmersive"]);
requireIncludes("src/api/immersiveClient.js", [
  "fetchImmersiveCatalog",
  "fetchImmersiveNextActions",
  "fetchFieldOverlays",
]);
requireIncludes("src/hooks/useImmersiveNextActions.js", ["fetchImmersiveNextActions"]);
requireIncludes("src/components/immersive/FcaSafetySiteLab.jsx", ["THREE", "safety"]);
requireIncludes("src/components/immersive/FcaNative3dViewer.jsx", ["fcam", "immersive-vr", "Enter VR"]);
requireIncludes("src/components/immersive/FieldPhotoOverlayPanel.jsx", ["Field Plan Overlay", "fetchFieldOverlays"]);
requireIncludes("src/components/immersive/AuricruxImmersiveHint.jsx", ["immersive"]);
requireIncludes("src/pages/portal/PortalImmersive.jsx", ["fetchImmersiveCatalog", "AuricruxImmersiveHint"]);
requireIncludes("src/components/AuricruxDock.jsx", ["immersive", "useImmersiveNextActions"]);
requireIncludes("src/systemState.js", ["immersive", "/portal/immersive"]);

requireIncludes("core/immersive_experiences.py", ["get_immersive_next_actions", "create_immersive_asset"], centralRoot);
requireIncludes("core/immersive_http.py", ["immersive-experiences", "field-overlays"], centralRoot);
requireIncludes("core/fca_native_viewer.py", ["get_native_viewer_session", "fcam"], centralRoot);
requireIncludes("docs/FCA_IMMERSIVE_STRATEGY.md", ["first-party FCA", "WebXR"], centralRoot);

if (errors.length) {
  console.error("Immersive framework validation failed:\n" + errors.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log("Immersive framework validation passed.");
