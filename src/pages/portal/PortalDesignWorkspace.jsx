import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import DesignCanvas from "../../components/design/DesignCanvas";
import SheetNavigator from "../../components/design/SheetNavigator";
import MarkupToolbar from "../../components/design/MarkupToolbar";
import MarkupLayerPanel from "../../components/design/MarkupLayerPanel";
import DesignStatusBar from "../../components/design/DesignStatusBar";
import DesignPropertiesPanel from "../../components/design/DesignPropertiesPanel";
import AuricruxDesignInsight from "../../components/design/AuricruxDesignInsight";
import ForgeViewerPanel from "../../components/design/ForgeViewerPanel";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import useWorkflowEvidence from "../../hooks/useWorkflowEvidence";
import useDesignWorkspace from "../../hooks/useDesignWorkspace";
import useDesignKeyboard from "../../hooks/useDesignKeyboard";
import { routeStateOverlays } from "../../systemState";
import { sendAuricruxMessage } from "../../api/auricruxClient";
import {
  compareRevisions,
  exportDesignPackage,
  linkMarkupToRfi,
  runBimClashDetection,
  saveBimModel,
  saveCadDocument,
  startDesignCollab,
  uploadDesignFile,
} from "../../api/designWorkspaceClient";
import CadEditorPanel from "../../components/design/CadEditorPanel";
import BimCoordinationPanel from "../../components/design/BimCoordinationPanel";
import TakeoffEstimatePanel from "../../components/design/TakeoffEstimatePanel";
import usePreconContinuity from "../../hooks/usePreconContinuity";
import { quantityFromGeometry } from "../../utils/designMarkupUtils";

const panelStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

function readDesignDeepLink() {
  if (typeof window === "undefined") return { projectId: "", fileId: "", sheetId: "" };
  const params = new URLSearchParams(window.location.search);
  return {
    projectId: params.get("projectId") || "",
    fileId: params.get("fileId") || "",
    sheetId: params.get("sheetId") || "",
  };
}

export default function PortalDesignWorkspace() {
  const deepLink = useMemo(() => readDesignDeepLink(), []);
  const { state } = useWorkspaceState();
  const { activeProject } = useProjectWorkspace();
  const projectId = deepLink.projectId || activeProject?.id || state.project?.id || "A-117";
  const [selectedFileId, setSelectedFileId] = useState(deepLink.fileId || "");
  const [activeTool, setActiveTool] = useState("select");
  const [selectedMarkupId, setSelectedMarkupId] = useState("");
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const { files } = useWorkflowEvidence(projectId);
  const designFiles = useMemo(
    () => files.filter((file) => file.designReady || ["pdf", "dwg", "rvt", "ifc"].includes((file.format || "").toLowerCase())),
    [files],
  );

  const workspace = useDesignWorkspace(projectId, selectedFileId, deepLink.sheetId);
  const precon = usePreconContinuity(projectId);
  const activeSheet = workspace.sheets.find((sheet) => sheet.sheetId === workspace.activeSheetId) || workspace.sheets[0];
  const fileFormat = workspace.fileRecord?.format || workspace.manifest?.format || "pdf";
  const selectedMarkup = workspace.markups.find((markup) => markup.id === selectedMarkupId) || null;

  useDesignKeyboard({
    onToolChange: setActiveTool,
    onTakeoff: () => handleTakeoff(),
    onExport: () => handleExport(),
    enabled: Boolean(selectedFileId),
  });

  useEffect(() => {
    if (!selectedFileId && designFiles[0]?.fileId) {
      setSelectedFileId(designFiles[0].fileId);
    }
  }, [designFiles, selectedFileId]);

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setStatusMessage("");
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
      });
      const contentBase64 = btoa(binary);
      const result = await uploadDesignFile({
        projectId,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        contentBase64,
        category: "Plans",
        discipline: "Preconstruction",
        owner: state?.tenant?.name || "portal-user",
        sourceRoute: "/portal/design",
      });
      const uploadedId = result?.file?.fileId;
      if (uploadedId) {
        setSelectedFileId(uploadedId);
        setStatusMessage(`${file.name} uploaded, extracted, and registered in the governed file spine.`);
        await workspace.refresh();
      }
    } catch (uploadError) {
      setStatusMessage(uploadError.message || "Upload failed.");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  async function handleMarkupComplete(markupPayload) {
    setBusy(true);
    try {
      const markup = await workspace.addMarkup({
        ...markupPayload,
        layerId: markupPayload.type === "punch" ? "layer-punch" : markupPayload.type === "count" ? "layer-takeoff" : "default",
      });
      if (markupPayload.type === "punch") {
        await linkMarkupToRfi(projectId, markup.id, { question: markup.label || "Punch item requires response." }).catch(() => null);
      }
      setSelectedMarkupId(markup.id);
      setStatusMessage(`${markupPayload.type} markup saved to governed design register.`);
    } catch (markupError) {
      setStatusMessage(markupError.message || "Unable to save markup.");
    } finally {
      setBusy(false);
    }
  }

  async function handleTakeoff() {
    const target = selectedMarkup || workspace.markups[0];
    if (!target) {
      setStatusMessage("Create or select a markup before spawning a takeoff.");
      return;
    }
    setBusy(true);
    try {
      const quantity = quantityFromGeometry(target.geometry, target.type === "count" ? 1 : undefined);
      const unit = target.type === "dimension" ? "LF" : target.type === "count" ? "EA" : "SF";
      const takeoff = await workspace.spawnTakeoff(target, quantity, unit, { tetherEstimate: true });
      await precon.refresh();
      const tethered = takeoff?.tetherStatus === "linked" || takeoff?.estimateLineItemId;
      setStatusMessage(
        tethered
          ? `Takeoff ${takeoff?.id || ""} tethered to estimate ${takeoff?.estimateId || precon.continuity?.estimateId || ""}.`
          : "Takeoff created. Use the continuity panel to tether quantities to the estimate.",
      );
      await workspace.refresh();
    } catch (takeoffError) {
      setStatusMessage(takeoffError.message || "Unable to create takeoff.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSyncEstimate() {
    setBusy(true);
    try {
      const result = await precon.syncAll(precon.continuity?.estimateId);
      setStatusMessage(`Synced ${result?.linkedCount || 0} takeoff(s) to the active estimate.`);
      await workspace.refresh();
    } catch (syncError) {
      setStatusMessage(syncError.message || "Unable to sync takeoffs to estimate.");
    } finally {
      setBusy(false);
    }
  }

  async function handleTetherTakeoff(takeoffId) {
    setBusy(true);
    try {
      await precon.tetherOne(takeoffId, precon.continuity?.estimateId);
      setStatusMessage(`Takeoff ${takeoffId} tethered to estimate.`);
      await workspace.refresh();
    } catch (tetherError) {
      setStatusMessage(tetherError.message || "Unable to tether takeoff.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCompare() {
    const candidates = designFiles.filter((file) => file.fileId !== selectedFileId);
    if (!candidates.length) {
      setStatusMessage("Upload a second revision to compare.");
      return;
    }
    setBusy(true);
    try {
      await compareRevisions(projectId, { baseFileId: candidates[0].fileId, compareFileId: selectedFileId, sheetId: workspace.activeSheetId });
      setStatusMessage("Revision compare generated for active sheet.");
    } catch (compareError) {
      setStatusMessage(compareError.message || "Compare failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCollab() {
    setBusy(true);
    try {
      await startDesignCollab(projectId, { fileId: selectedFileId, participants: [state?.tenant?.name || "Workspace team"] });
      setStatusMessage("Live design session started.");
    } catch (collabError) {
      setStatusMessage(collabError.message || "Unable to start live session.");
    } finally {
      setBusy(false);
    }
  }

  async function handleExport() {
    setBusy(true);
    try {
      await exportDesignPackage(projectId, { fileId: selectedFileId });
      setStatusMessage("Export package prepared with burn-in markups.");
    } catch (exportError) {
      setStatusMessage(exportError.message || "Export failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAskAuricrux() {
    const prompt = workspace.intelligence?.nextAction || "What should I review on this sheet?";
    try {
      await sendAuricruxMessage({
        message: prompt,
        route: "/portal/design",
        context: {
          company: state?.tenant?.name,
          designContext: {
            fileId: selectedFileId,
            sheetId: workspace.activeSheetId,
            intelligence: workspace.intelligence,
          },
        },
      });
      setStatusMessage("Auricrux design guidance sent to the dock.");
    } catch {
      setStatusMessage("Open the Auricrux dock to continue design guidance.");
    }
  }

  async function handlePriceEstimate() {
    setBusy(true);
    try {
      const result = await precon.priceEstimate(precon.continuity?.estimateId);
      setStatusMessage(`Applied unit pricing to ${result?.pricedLineCount || 0} line(s). Estimate total: ${result?.estimate?.total || ""}.`);
      await workspace.refresh();
    } catch (priceError) {
      setStatusMessage(priceError.message || "Unable to apply unit pricing.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCadSave() {
    setBusy(true);
    try {
      await saveCadDocument(projectId, {
        fileId: selectedFileId,
        disciplinePackage: activeSheet?.discipline || "General",
        layers: [{ name: "0", visible: true }, { name: "E-POWER", visible: true }],
        editorState: { activeSheetId: workspace.activeSheetId },
      });
      setStatusMessage("CAD document state saved.");
    } catch (cadError) {
      setStatusMessage(cadError.message || "CAD save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleBimClash() {
    setBusy(true);
    try {
      await runBimClashDetection(projectId, selectedFileId);
      setStatusMessage("Clash detection completed.");
    } catch (clashError) {
      setStatusMessage(clashError.message || "Clash detection failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleBimSave() {
    setBusy(true);
    try {
      await saveBimModel(projectId, {
        fileId: selectedFileId,
        sheets: workspace.sheets,
        elements: [],
        quantities: workspace.markups.map((markup) => ({ markupId: markup.id, type: markup.type })),
      });
      setStatusMessage("BIM model state saved.");
    } catch (bimError) {
      setStatusMessage(bimError.message || "BIM save failed.");
    } finally {
      setBusy(false);
    }
  }

  function toggleLayer(layerId) {
    workspace.setLayers(
      workspace.layers.map((layer) => (layer.id === layerId ? { ...layer, visible: !layer.visible } : layer)),
    );
  }

  return (
    <PortalShell
      title="Design Workspace"
      subtitle="Enterprise plan room for PDF, DWG, and RVT — markup, takeoff, coordination, and Auricrux intelligence in one governed surface."
      activeHref="/portal/design"
      routeOverlay={routeStateOverlays.design}
    >
      <div style={{ display: "grid", gap: 16 }}>
        <div style={panelStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <div style={{ color: "#2563eb", fontWeight: 700 }}>FCA Design Workspace</div>
              <h1 style={{ margin: "8px 0 0" }}>Plan Room Pro — {projectId}</h1>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <label style={{ border: "1px solid #2563eb", background: "#eff6ff", color: "#1d4ed8", borderRadius: 10, padding: "10px 12px", fontWeight: 700, cursor: "pointer" }}>
                Upload plan set
                <input type="file" accept=".pdf,.dwg,.rvt,.ifc" onChange={handleUpload} style={{ display: "none" }} />
              </label>
              <a href={`/portal/files?projectId=${encodeURIComponent(projectId)}`} style={{ textDecoration: "none", border: "1px solid #cbd5e1", borderRadius: 10, padding: "10px 12px", color: "#334155", fontWeight: 700 }}>
                File spine
              </a>
            </div>
          </div>
          {statusMessage ? <div style={{ marginTop: 12, color: "#334155" }}>{statusMessage}</div> : null}
        </div>

        <DesignStatusBar
          projectId={projectId}
          fileName={workspace.fileRecord?.name}
          sheetName={activeSheet?.name}
          markupCount={workspace.markups.length}
          mode={activeTool}
        />

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 320px", gap: 16 }}>
          <div style={{ display: "grid", gap: 16 }}>
            <div style={panelStyle}>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>Governed files</div>
              <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
                {designFiles.map((file) => (
                  <button
                    key={file.fileId}
                    type="button"
                    onClick={() => setSelectedFileId(file.fileId)}
                    style={{
                      textAlign: "left",
                      border: selectedFileId === file.fileId ? "1px solid #2563eb" : "1px solid #e2e8f0",
                      background: selectedFileId === file.fileId ? "#eff6ff" : "#fff",
                      borderRadius: 10,
                      padding: "10px 12px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{file.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                      {(file.format || "document").toUpperCase()} · {file.versionLabel || "Rev 1"}
                    </div>
                  </button>
                ))}
                {!designFiles.length ? <div style={{ color: "#64748b" }}>Upload a PDF, DWG, or RVT to begin.</div> : null}
              </div>
              <SheetNavigator
                sheets={workspace.sheets}
                activeSheetId={workspace.activeSheetId}
                onSelect={workspace.setActiveSheetId}
                fileFormat={fileFormat}
              />
            </div>
            <div style={panelStyle}>
              <MarkupLayerPanel layers={workspace.layers} onToggle={toggleLayer} />
            </div>
          </div>

          <div style={panelStyle}>
            <MarkupToolbar
              activeTool={activeTool}
              onToolChange={setActiveTool}
              onCreateTakeoff={handleTakeoff}
              onCompare={handleCompare}
              onCollab={handleCollab}
              onExport={handleExport}
              busy={busy}
            />
            <div style={{ marginTop: 16 }}>
              {workspace.loading ? <div>Loading Design Workspace…</div> : null}
              {workspace.error ? <div style={{ color: "#b91c1c", marginBottom: 12 }}>{workspace.error}</div> : null}
              <DesignCanvas
                fileId={selectedFileId}
                contentUrl={workspace.contentUrl}
                fileFormat={fileFormat}
                activeSheet={activeSheet}
                markups={workspace.visibleMarkups}
                activeTool={activeTool}
                onMarkupComplete={handleMarkupComplete}
              />
            </div>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            <div style={panelStyle}>
              <TakeoffEstimatePanel
                continuity={precon.continuity}
                loading={precon.loading}
                error={precon.error}
                onSyncAll={handleSyncEstimate}
                onTetherOne={handleTetherTakeoff}
                onPriceEstimate={handlePriceEstimate}
                busy={busy}
              />
            </div>
            <div style={panelStyle}>
              <AuricruxDesignInsight intelligence={workspace.intelligence} onAskAuricrux={handleAskAuricrux} />
            </div>
            <div style={panelStyle}>
              <DesignPropertiesPanel activeSheet={activeSheet} selectedMarkup={selectedMarkup} intelligence={workspace.intelligence} />
            </div>
            <div style={panelStyle}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Markup register</div>
              <div style={{ display: "grid", gap: 8, maxHeight: 220, overflowY: "auto" }}>
                {workspace.markups.map((markup) => (
                  <button
                    key={markup.id}
                    type="button"
                    onClick={() => setSelectedMarkupId(markup.id)}
                    style={{
                      textAlign: "left",
                      border: selectedMarkupId === markup.id ? "1px solid #2563eb" : "1px solid #e2e8f0",
                      background: selectedMarkupId === markup.id ? "#eff6ff" : "#fff",
                      borderRadius: 10,
                      padding: 10,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{markup.type}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{markup.sheetId} · {markup.status}</div>
                  </button>
                ))}
                {!workspace.markups.length ? <div style={{ color: "#64748b" }}>No markups yet.</div> : null}
              </div>
            </div>
            {(fileFormat === "dwg" || fileFormat === "rvt" || fileFormat === "ifc") ? (
              <div style={panelStyle}>
                <ForgeViewerPanel
                  viewerSession={workspace.viewerSession}
                  fileFormat={fileFormat}
                  onQueueTranslation={workspace.queueViewerTranslation}
                  queueBusy={workspace.queueBusy}
                />
                <div style={{ marginTop: 16 }}>
                  {fileFormat === "dwg" ? (
                    <CadEditorPanel activeSheet={activeSheet} onSave={handleCadSave} busy={busy} />
                  ) : (
                    <BimCoordinationPanel
                      sheets={workspace.sheets}
                      markups={workspace.markups}
                      onSave={handleBimSave}
                      onClash={handleBimClash}
                      busy={busy}
                    />
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
