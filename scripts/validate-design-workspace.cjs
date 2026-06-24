const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
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

requireIncludes("src/routes.js", ["/portal/design", "PortalDesignWorkspace", "/portal/immersive", "PortalImmersive"]);
requireIncludes("src/api/designWorkspaceClient.js", [
  "fetchFileManifest",
  "fetchFileContent",
  "createDesignMarkup",
  "compareRevisions",
  "runBimClashDetection",
  "createNativePlanSet",
  "fetchFcasDocument",
  "fcaExportUrl",
]);
requireIncludes("src/api/immersiveClient.js", ["fetchImmersiveCatalog", "fetchImmersiveNextActions"]);
requireIncludes("src/pages/portal/PortalImmersive.jsx", ["ImmersiveEcosystemHub", "AuricruxImmersiveHint"]);
requireIncludes("src/components/immersive/ImmersiveEcosystemHub.jsx", ["Design Workspace", "Auricrux next actions"]);
requireIncludes("src/api/customerEntitlementsClient.js", ["mutateCustomerEntitlements"]);
requireIncludes("src/hooks/useCustomerSession.js", ["mutateCustomerEntitlements"]);
requireIncludes("core/customer_entitlements.py", ["enforce_product_access"], centralRoot);
requireIncludes("src/pages/portal/PortalDesignWorkspace.jsx", [
  "Design Workspace",
  "MarkupToolbar",
  "AuricruxDesignInsight",
  "AuricruxImmersiveHint",
  "DesignStatusBar",
  "TakeoffEstimatePanel",
  "FcaNative3dViewer",
  "PlanCreationPanel",
]);
requireIncludes("src/components/design/FcasPlanViewer.jsx", ["fcas-stream", "FCA FCAS"]);
requireIncludes("src/components/design/PlanCreationPanel.jsx", ["createNativePlanSet", "FCAS"]);
requireIncludes("src/components/immersive/FcaNative3dViewer.jsx", ["fcam", "Enter VR"]);
requireIncludes("src/api/preconClient.js", ["fetchPreconContinuity", "syncTakeoffsToEstimate", "tetherTakeoffToEstimate", "priceEstimateFromTakeoffs"]);
requireIncludes("src/components/design/PdfPlanViewer.jsx", ["pdfjs-dist", "getDocument"]);
requireIncludes("src/systemState.js", ["design: {", "immersive:", "Design Workspace"]);
requireIncludes("src/components/ProjectFileAuditPanel.jsx", ["Open in Design Workspace"]);

requireIncludes("core/design_workspace.py", ["create_markup", "list_markup_layers", "upsert_bim_model", "create_measurement", "run_clash_detection"], centralRoot);
requireIncludes("core/precon_pricing.py", ["price_estimate", "build_proposal_package", "resolve_unit_rate"], centralRoot);
requireIncludes("core/design_intelligence.py", ["analyze_design_workspace", "recommendations", "tether-estimate", "price-estimate"], centralRoot);
requireIncludes("core/precon_tether.py", ["tether_takeoff_to_estimate", "get_precon_continuity", "sync_untethered_takeoffs"], centralRoot);
requireIncludes("core/fca_native_viewer.py", ["get_native_viewer_session"], centralRoot);
requireIncludes("core/fca_format_bridge.py", ["import_external_to_native", "detect_fcam_element_clashes", "export_fcam_to_glb"], centralRoot);
requireIncludes("core/fca_dwg_parser.py", ["parse_dwg", "fca_ezdwg_bridge"], centralRoot);
requireIncludes("core/fca_rvt_parser.py", ["parse_rvt", "fca_rvt_native"], centralRoot);
requireIncludes("core/fca_ezdwg_bridge.py", ["parse_dwg_with_ezdwg", "fullEntityDecode"], centralRoot);
requireIncludes("core/fca_rvt_native.py", ["parse_rvt_with_native", "fullGeometryDecode"], centralRoot);
requireIncludes("core/fca_cad_to_native.py", ["cad_result_to_fcam", "cad_result_to_fcas"], centralRoot);
requireIncludes("core/fca_webifc_ingest.py", ["import_ifc_via_webifc"], centralRoot);
requireIncludes("core/fca_pdf_tiles.py", ["import_pdf_to_fcas_with_tiles"], centralRoot);
requireIncludes("core/fca_node_bridge.py", ["run_node_script"], centralRoot);
requireIncludes("core/fca_plan_authoring.py", ["create_native_plan_set", "build_fcap_for_project", "persist_file_fcap_package"], centralRoot);
requireIncludes("core/fca_model_convert.py", ["run_native_ingest_job"], centralRoot);
requireIncludes("core/file_assets.py", ["persist_file_asset"], centralRoot);
requireIncludes("core/blob_store.py", ["upload_bytes", "signed_content_url", "resolve_mime_type"], centralRoot);
requireIncludes("core/format_extract.py", ["run_extract_job", "get_manifest", "_infer_discipline"], centralRoot);
requireIncludes("core/files.py", ["upload-binary", "get_file_binary", "get_file_content_access"], centralRoot);
requireIncludes("core/design_precon_http.py", [
  "register_design_precon_routes",
  "files/{fileId}/fcam-stream",
  "files/{fileId}/fcas-stream",
  "files/{fileId}/fcap-stream",
  "files/{fileId}/tiles/{tileName}",
  "files/{fileId}/fca-export",
  "projects/{projectId}/design/plan-set",
  "projects/{projectId}/design/fcap-stream",
  "projects/{projectId}/design/measurements",
  "projects/{projectId}/design/intelligence",
  "projects/{projectId}/design/viewer-token",
  "projects/{projectId}/design/cad",
  "projects/{projectId}/design/bim",
  "projects/{projectId}/precon-continuity",
], centralRoot);
requireIncludes("function_app.py", [
  "register_design_precon_routes",
  "register_immersive_routes",
], centralRoot);
requireIncludes("FCA_COVERAGE_MATRIX.md", ["Design Workspace", "Immersive Experiences", "FCA Native Formats"], centralRoot);
requireIncludes("docs/FCA_NATIVE_FORMATS.md", ["FCAM", "FCAS", "FCAP"], centralRoot);
requireIncludes("docs/FCA_IMMERSIVE_STRATEGY.md", ["first-party FCA", "WebXR"], centralRoot);

requireIncludes("src/pages/portal/PortalProposals.jsx", ["scopePackage", "designSourcedLines"]);

if (errors.length) {
  console.error("Design Workspace validation failed:\n" + errors.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log("Design Workspace validation passed.");
