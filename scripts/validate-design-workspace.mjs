import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const localCoreRoot = path.resolve(root, "core");
const centralRoot = fs.existsSync(localCoreRoot)
  ? root
  : process.env.FCA_CENTRAL_ROOT
    ? path.resolve(process.env.FCA_CENTRAL_ROOT)
    : path.resolve(root, "..", "auricrux-central-work");
const errors = [];

function requireFile(relativePath, baseDir = root) {
  const absolute = path.join(baseDir, relativePath);
  if (!fs.existsSync(absolute)) {
    errors.push(`Missing required file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolute, "utf8");
}

function requireIncludes(relativePath, needles, baseDir = root) {
  const content = requireFile(relativePath, baseDir);
  needles.forEach((needle) => {
    if (!content.includes(needle)) {
      errors.push(`${relativePath} missing expected content: ${needle}`);
    }
  });
}

function requireCentralIncludes(relativePath, needles) {
  requireIncludes(relativePath, needles, centralRoot);
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
requireIncludes("src/systemState.js", ["routeStateOverlays", "design:"]);
requireIncludes("src/components/ProjectFileAuditPanel.jsx", ["Open in Design Workspace"]);
requireIncludes("src/hooks/useAuricruxLiveInsight.js", ["submitAuricruxAction"]);
requireIncludes("src/components/auricrux/AuricruxInsightPanel.jsx", ["useAuricruxLiveInsight", "Live recommendation"]);
requireIncludes("src/pages/portal/PortalProposals.jsx", ["scopePackage", "designSourcedLines"]);

requireCentralIncludes("core/design_workspace.py", ["create_markup", "list_markup_layers", "upsert_bim_model"]);
requireCentralIncludes("core/precon_pricing.py", ["price_estimate", "build_proposal_package", "resolve_unit_rate"]);
requireCentralIncludes("core/design_intelligence.py", ["analyze_design_workspace", "recommendations", "tether-estimate", "price-estimate"]);
requireCentralIncludes("core/precon_tether.py", ["tether_takeoff_to_estimate", "get_precon_continuity", "sync_untethered_takeoffs"]);
requireCentralIncludes("core/fca_native_design.py", ["get_design_viewer_session", "generate_native_previews", "analyze_source_blob", "derive_sheets_from_analysis", "aps_interop_enabled"]);
requireCentralIncludes("core/aps_viewer.py", ["aps_interop_enabled"]);
requireCentralIncludes("core/file_assets.py", ["persist_file_asset"]);
requireCentralIncludes("core/blob_store.py", ["upload_bytes", "signed_content_url", "resolve_mime_type"]);
requireCentralIncludes("core/format_extract.py", ["run_extract_job", "get_manifest", "_infer_discipline"]);
requireCentralIncludes("core/files.py", ["upload-binary", "get_file_binary", "get_file_content_access"]);
requireCentralIncludes("core/design_precon_http.py", [
  "projects/{projectId}/design/sessions",
  "projects/{projectId}/precon-continuity",
  "projects/{projectId}/precon/sync-estimate",
  "projects/{projectId}/precon/price-estimate",
  "takeoffs/{takeoffId}/tether-estimate",
]);

if (errors.length) {
  console.error("Design Workspace validation failed:\n" + errors.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log("Design Workspace validation passed.");
