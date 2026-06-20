import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function requireFile(relativePath) {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute)) {
    errors.push(`Missing required file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolute, "utf8");
}

function requireIncludes(relativePath, needles) {
  const content = requireFile(relativePath);
  needles.forEach((needle) => {
    if (!content.includes(needle)) {
      errors.push(`${relativePath} missing expected content: ${needle}`);
    }
  });
}

requireIncludes("src/routes.js", ["/portal/design", "PortalDesignWorkspace"]);
requireIncludes("src/api/designWorkspaceClient.js", [
  "fetchFileManifest",
  "fetchFileContent",
  "createDesignMarkup",
  "compareRevisions",
  "runBimClashDetection",
]);
requireIncludes("src/pages/portal/PortalDesignWorkspace.jsx", ["Design Workspace", "MarkupToolbar", "AuricruxDesignInsight", "DesignStatusBar", "TakeoffEstimatePanel", "FcaNativeViewerPanel"]);
requireIncludes("src/api/preconClient.js", ["fetchPreconContinuity", "syncTakeoffsToEstimate", "tetherTakeoffToEstimate", "priceEstimateFromTakeoffs"]);
requireIncludes("src/components/design/PdfPlanViewer.jsx", ["pdfjs-dist", "getDocument"]);
requireIncludes("src/components/design/NativeSheetViewer.jsx", ["FCA Native Design Engine"]);
requireIncludes("src/components/design/FcaNativeViewerPanel.jsx", ["FCA Native Design Engine"]);
requireIncludes("src/systemState.js", ["routeStateOverlays.design", "design:"]);
requireIncludes("src/components/ProjectFileAuditPanel.jsx", ["Open in Design Workspace"]);
requireIncludes("../auricrux-central-work/core/design_workspace.py", ["create_markup", "list_markup_layers", "upsert_bim_model"]);
requireIncludes("../auricrux-central-work/core/precon_pricing.py", ["price_estimate", "build_proposal_package", "resolve_unit_rate"]);
requireIncludes("../auricrux-central-work/core/design_intelligence.py", ["analyze_design_workspace", "recommendations", "tether-estimate", "price-estimate"]);
requireIncludes("../auricrux-central-work/core/precon_tether.py", ["tether_takeoff_to_estimate", "get_precon_continuity", "sync_untethered_takeoffs"]);
requireIncludes("../auricrux-central-work/core/fca_native_design.py", ["get_design_viewer_session", "generate_native_previews", "aps_interop_enabled"]);
requireIncludes("../auricrux-central-work/core/aps_viewer.py", ["aps_interop_enabled"]);
requireIncludes("../auricrux-central-work/core/file_assets.py", ["persist_file_asset"]);
requireIncludes("../auricrux-central-work/core/blob_store.py", ["upload_bytes", "signed_content_url", "resolve_mime_type"]);
requireIncludes("../auricrux-central-work/core/format_extract.py", ["run_extract_job", "get_manifest", "_infer_discipline"]);
requireIncludes("../auricrux-central-work/core/files.py", ["upload-binary", "get_file_binary", "get_file_content_access"]);
requireIncludes("../auricrux-central-work/function_app.py", [
  "projects/{projectId}/design/sessions",
  "files/{fileId}/manifest",
  "files/{fileId}/stream",
  "files/{fileId}/sheets/{sheetId}/preview",
  "projects/{projectId}/design/intelligence",
  "projects/{projectId}/design/viewer-token",
  "projects/{projectId}/design/cad",
  "projects/{projectId}/design/bim",
  "projects/{projectId}/precon-continuity",
  "projects/{projectId}/precon/sync-estimate",
  "projects/{projectId}/precon/price-estimate",
  "takeoffs/{takeoffId}/tether-estimate",
]);
requireIncludes("src/pages/portal/PortalProposals.jsx", ["scopePackage", "designSourcedLines"]);
requireIncludes("../auricrux-central-work/FCA_COVERAGE_MATRIX.md", ["Design Workspace"]);
requireIncludes("../auricrux-central-work/FCA_BUILD_SEQUENCE.md", ["Phase 5a — Design Workspace"]);

if (errors.length) {
  console.error("Design Workspace validation failed:\n" + errors.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log("Design Workspace validation passed.");
