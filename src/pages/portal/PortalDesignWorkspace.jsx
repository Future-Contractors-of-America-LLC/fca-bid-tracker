import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import PortalSliceAuricrux from "../../components/portal/PortalSliceAuricrux";
import DesignCanvas from "../../components/design/DesignCanvas";
import SheetNavigator from "../../components/design/SheetNavigator";
import MarkupToolbar from "../../components/design/MarkupToolbar";
import MarkupLayerPanel from "../../components/design/MarkupLayerPanel";
import DesignStatusBar from "../../components/design/DesignStatusBar";
import DesignPropertiesPanel from "../../components/design/DesignPropertiesPanel";
import AuricruxDesignInsight from "../../components/design/AuricruxDesignInsight";
import FcaNativeViewerPanel from "../../components/design/FcaNativeViewerPanel";
import ApsInteropPanel from "../../components/design/ApsInteropPanel";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import useWorkflowEvidence from "../../hooks/useWorkflowEvidence";
import useDesignWorkspace from "../../hooks/useDesignWorkspace";
import useDesignKeyboard from "../../hooks/useDesignKeyboard";
import { routeStateOverlays } from "../../systemState";
import { sendAuricruxMessage } from "../../api/auricruxClient";
import {
  compareRevisions,
  exportDesignPackage,
  exportFcaNativePackage,
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
import { isConstructionDesignFile, toAcceptAttribute } from "../../constructionFormats";
import { fetchBillingSummary, sendPortalMessage } from "../../api/portalClient";
import { createProjectRfi, fetchProjectRfis } from "../../api/constructionClient";
import { createFieldScheduleEvent, createFieldTask, fetchFieldSchedule, fetchFieldTasks } from "../../api/fieldOpsClient";
import { mutateEstimate } from "../../api/commercialClient";

const panelStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const DESIGN_UPDATE_FLAGS_KEY = "fca_design_change_update_flags_v1";
const DESIGN_DECISIONS_KEY = "fca_design_decisions_v1";
const RFI_MODEL_PINS_KEY = "fca_model_integrated_rfi_pins_v1";

function readLocalJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best effort only
  }
}

function parseDate(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function resolveProcurementStatus(billingSummary) {
  if (!billingSummary) return "Billing summary unavailable";
  if (billingSummary.overdueCount > 0) return `At risk: ${billingSummary.overdueCount} overdue billing item(s)`;
  if (billingSummary.openCount > 0) return `Open procurement/billing actions: ${billingSummary.openCount}`;
  if (billingSummary.count > 0) return "Procurement continuity healthy";
  return "No procurement records posted yet";
}

function geometryMagnitude(geometry) {
  if (!geometry || typeof geometry !== "object") return 0;
  if (typeof geometry.length === "number") return geometry.length;
  if (typeof geometry.area === "number") return geometry.area;
  if (Array.isArray(geometry.points)) return geometry.points.length;
  return 0;
}

function evaluateComplianceSignals({ selectedMarkup, activeSheet, linkedRfi }) {
  if (!selectedMarkup) return [];
  const warnings = [];
  const magnitude = geometryMagnitude(selectedMarkup.geometry);
  const discipline = String(activeSheet?.discipline || "").toLowerCase();

  if (selectedMarkup.type === "dimension" && magnitude > 40 && !String(selectedMarkup.label || "").toLowerCase().includes("expansion")) {
    warnings.push({
      code: "IBC-1607",
      severity: "warning",
      message: "Long-span dimension detected without explicit expansion/load note. Validate against structural code constraints.",
    });
  }

  if (discipline.includes("mechanical") && selectedMarkup.type === "count" && magnitude > 20) {
    warnings.push({
      code: "MEP-COORD",
      severity: "warning",
      message: "High-density MEP element count detected. Run coordination conflict sweep before approval.",
    });
  }

  if ((selectedMarkup.type === "cloud" || selectedMarkup.type === "callout") && !linkedRfi) {
    warnings.push({
      code: "RFI-TRACE",
      severity: "critical",
      message: "Design change cloud has no linked RFI. Create an RFI before authorizing downstream execution.",
    });
  }

  return warnings;
}

function suggestClashResolution(clashResult, activeSheet) {
  const discipline = String(activeSheet?.discipline || "General");
  const count = clashResult?.clashCount || clashResult?.count || clashResult?.summary?.clashes || 0;
  if (!count) {
    return {
      title: "No high-risk clashes detected",
      recommendations: ["Keep baseline locked and publish field-ready set."],
    };
  }
  return {
    title: `${count} clash(es) detected in ${discipline}`,
    recommendations: [
      "Route structural elements as governing scope, then re-run MEP offsets.",
      "Apply company historical sequence: duct reroute -> cable tray shift -> hanger recalculation.",
      "Open linked RFI package and assign responsible trade before issuing revised set.",
    ],
  };
}

function createDesignDecision(note, context) {
  return {
    id: `decision-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    note,
    at: new Date().toISOString(),
    projectId: context.projectId,
    fileId: context.fileId,
    sheetId: context.sheetId,
    markupId: context.markupId,
    actor: context.actor,
  };
}

function findTakeoffForMarkup(continuity, markupId) {
  if (!continuity || !markupId) return null;
  const pools = [
    ...(continuity.untetheredTakeoffs || []),
    ...(continuity.tetheredTakeoffs || []),
    ...(continuity.takeoffs || []),
  ];
  return pools.find((takeoff) =>
    (takeoff.sourceMarkupIds || []).includes(markupId) || takeoff.sourceMarkupId === markupId,
  ) || null;
}

function downloadPayload(name, content, type = "application/json") {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(href);
}

function readDesignDeepLink() {
  if (typeof window === "undefined") return { projectId: "", fileId: "", sheetId: "" };
  const params = new URLSearchParams(window.location.search);
  return {
    projectId: params.get("projectId") || params.get("project") || "",
    fileId: params.get("fileId") || params.get("file") || "",
    sheetId: params.get("sheetId") || "",
  };
}

export default function PortalDesignWorkspace() {
  const deepLink = useMemo(() => readDesignDeepLink(), []);
  const { state } = useWorkspaceState();
  const { activeProject } = useProjectWorkspace();
  const { projectId: activePortalProjectId } = usePortalProjectId(deepLink.projectId);
  const projectId = activePortalProjectId || deepLink.projectId || activeProject?.id || "";
  const [selectedFileId, setSelectedFileId] = useState(deepLink.fileId || "");
  const [activeTool, setActiveTool] = useState("select");
  const [selectedMarkupId, setSelectedMarkupId] = useState("");
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [engineeringFormat, setEngineeringFormat] = useState("json");
  const [liveSyncActive, setLiveSyncActive] = useState(false);
  const [decisionNote, setDecisionNote] = useState("");
  const [designDecisions, setDesignDecisions] = useState(() => readLocalJson(DESIGN_DECISIONS_KEY, []));
  const [clashGuidance, setClashGuidance] = useState(null);
  const [deltaSummary, setDeltaSummary] = useState(null);
  const [downstreamNotice, setDownstreamNotice] = useState("");
  const [rfiPins, setRfiPins] = useState(() => readLocalJson(RFI_MODEL_PINS_KEY, []));

  const { files } = useWorkflowEvidence(projectId);
  const designFiles = useMemo(() => files.filter((file) => isConstructionDesignFile(file)), [files]);
  const uploadAccept = useMemo(() => toAcceptAttribute(), []);

  const workspace = useDesignWorkspace(projectId, selectedFileId, deepLink.sheetId);
  const precon = usePreconContinuity(projectId);
  const activeSheet = workspace.sheets.find((sheet) => sheet.sheetId === workspace.activeSheetId) || workspace.sheets[0];
  const fileFormat = workspace.fileRecord?.format || workspace.manifest?.format || "pdf";
  const selectedMarkup = workspace.markups.find((markup) => markup.id === selectedMarkupId) || null;
  const billingLoad = usePortalApiLoad(() => (projectId ? fetchBillingSummary() : Promise.resolve(null)), [projectId]);
  const fieldTasksLoad = usePortalApiLoad(() => (projectId ? fetchFieldTasks({ projectId }) : Promise.resolve({ items: [] })), [projectId]);
  const rfiLoad = usePortalApiLoad(() => (projectId ? fetchProjectRfis(projectId) : Promise.resolve([])), [projectId]);
  const scheduleLoad = usePortalApiLoad(() => (projectId ? fetchFieldSchedule({ projectId }) : Promise.resolve({ items: [] })), [projectId]);

  const fieldTasks = fieldTasksLoad.data?.items || [];
  const rfis = rfiLoad.data || [];
  const scheduleItems = scheduleLoad.data?.items || [];

  const selectedTakeoff = useMemo(
    () => findTakeoffForMarkup(precon.continuity, selectedMarkup?.id),
    [precon.continuity, selectedMarkup?.id],
  );

  const selectedEstimateLine = useMemo(() => {
    const pool = precon.continuity?.estimateLineItems || [];
    if (!selectedTakeoff) return null;
    return pool.find((item) => item.sourceTakeoffId === selectedTakeoff.id) || null;
  }, [precon.continuity?.estimateLineItems, selectedTakeoff]);

  const linkedRfi = useMemo(() => {
    if (!selectedMarkup) return null;
    const target = `${selectedMarkup.id} ${selectedMarkup.label || ""}`.toLowerCase();
    return rfis.find((rfi) => `${rfi.question || ""} ${rfi.note || ""}`.toLowerCase().includes(target)) || null;
  }, [rfis, selectedMarkup]);

  const assignedFieldTask = useMemo(() => {
    if (!selectedMarkup) return null;
    const target = `${selectedMarkup.label || ""} ${selectedMarkup.id}`.toLowerCase();
    return fieldTasks.find((task) => `${task.task || ""} ${task.note || ""}`.toLowerCase().includes(target)) || fieldTasks[0] || null;
  }, [fieldTasks, selectedMarkup]);

  const complianceWarnings = useMemo(
    () => evaluateComplianceSignals({ selectedMarkup, activeSheet, linkedRfi }),
    [selectedMarkup, activeSheet, linkedRfi],
  );

  const digitalTwinSignal = useMemo(() => {
    const fieldEvidenceCount = files.filter((file) => String(file.category || "").toLowerCase().includes("photo")).length;
    const completedTasks = fieldTasks.filter((task) => String(task.status || "").toLowerCase().includes("complete")).length;
    const totalTasks = fieldTasks.length;
    return {
      fieldEvidenceCount,
      completedTasks,
      totalTasks,
      variance: Math.max(totalTasks - fieldEvidenceCount, 0),
    };
  }, [fieldTasks, files]);

  const liveThread = useMemo(() => ({
    object: selectedMarkup?.label || selectedMarkup?.id || activeSheet?.name || "No element selected",
    estimateId: precon.continuity?.estimateId || "Not tethered",
    cost: selectedEstimateLine?.amount || selectedTakeoff?.estimatedAmount || "Pending estimate link",
    procurement: resolveProcurementStatus(billingLoad.data),
    installer: assignedFieldTask?.assignee || "Unassigned",
    schedule: assignedFieldTask?.dueDate || scheduleItems[0]?.date || "Not scheduled",
  }), [activeSheet?.name, assignedFieldTask?.assignee, assignedFieldTask?.dueDate, billingLoad.data, precon.continuity?.estimateId, scheduleItems, selectedEstimateLine?.amount, selectedMarkup?.id, selectedMarkup?.label, selectedTakeoff?.estimatedAmount]);

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

  useEffect(() => {
    writeLocalJson(DESIGN_DECISIONS_KEY, designDecisions);
  }, [designDecisions]);

  useEffect(() => {
    function refreshPins() {
      setRfiPins(readLocalJson(RFI_MODEL_PINS_KEY, []));
    }
    refreshPins();
    if (typeof window !== "undefined") {
      window.addEventListener("storage", refreshPins);
      window.addEventListener("focus", refreshPins);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", refreshPins);
        window.removeEventListener("focus", refreshPins);
      }
    };
  }, []);

  const visibleRfiPins = useMemo(() => (
    (rfiPins || []).filter((pin) => {
      if (pin.projectId !== projectId) return false;
      if (selectedFileId && pin.fileId && pin.fileId !== selectedFileId) return false;
      if (workspace.activeSheetId && pin.sheetId && pin.sheetId !== workspace.activeSheetId) return false;
      return true;
    }).slice(0, 8)
  ), [projectId, rfiPins, selectedFileId, workspace.activeSheetId]);

  useEffect(() => {
    if (!projectId || !selectedFileId || designFiles.length < 2) return;
    const previous = designFiles.find((file) => file.fileId !== selectedFileId);
    if (!previous?.fileId) return;
    const cacheKey = `design-delta:${projectId}:${previous.fileId}:${selectedFileId}`;
    if (typeof window !== "undefined" && window.sessionStorage.getItem(cacheKey)) return;

    let active = true;
    setDeltaSummary({ loading: true, message: "Running delta analysis for latest drawing set..." });
    compareRevisions(projectId, {
      baseFileId: previous.fileId,
      compareFileId: selectedFileId,
      sheetId: workspace.activeSheetId,
      sourceRoute: "/portal/design",
    })
      .then((result) => {
        if (!active) return;
        setDeltaSummary({
          loading: false,
          message: result?.summary || "Delta analysis generated for latest drawing update.",
          result,
        });
        if (typeof window !== "undefined") window.sessionStorage.setItem(cacheKey, "1");
      })
      .catch((error) => {
        if (!active) return;
        setDeltaSummary({ loading: false, message: error.message || "Delta analysis unavailable for this revision." });
      });

    return () => {
      active = false;
    };
  }, [designFiles, projectId, selectedFileId, workspace.activeSheetId]);

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
      await startDesignCollab(projectId, {
        fileId: selectedFileId,
        participants: ["Project Manager", "Architect", "Subcontractor", state?.tenant?.name || "Workspace team"],
        sourceRoute: "/portal/design",
      });
      setLiveSyncActive(true);
      setStatusMessage("Live Sync session started. Design decisions are now tracked.");
    } catch (collabError) {
      setStatusMessage(collabError.message || "Unable to start live session.");
    } finally {
      setBusy(false);
    }
  }

  function logDesignDecision(note) {
    if (!note.trim()) return;
    const decision = createDesignDecision(note.trim(), {
      projectId,
      fileId: selectedFileId,
      sheetId: workspace.activeSheetId,
      markupId: selectedMarkup?.id || "",
      actor: state?.tenant?.name || "Workspace Team",
    });
    setDesignDecisions((current) => [decision, ...current].slice(0, 120));
    setDecisionNote("");
    setStatusMessage("Design decision recorded in Live Sync log.");
  }

  async function handleCreateRfiFromMarkup() {
    if (!selectedMarkup || !projectId) {
      setStatusMessage("Select a markup before creating RFI.");
      return;
    }
    setBusy(true);
    try {
      const snapshot = {
        fileId: selectedFileId,
        sheetId: workspace.activeSheetId,
        markupId: selectedMarkup.id,
        label: selectedMarkup.label,
        geometry: selectedMarkup.geometry,
        modelSnapshotAt: new Date().toISOString(),
      };
      await createProjectRfi(projectId, {
        number: `RFI-DESIGN-${Date.now().toString().slice(-6)}`,
        question: selectedMarkup.label || `Clarify design intent on ${activeSheet?.name || workspace.activeSheetId}`,
        trade: activeSheet?.discipline || "Design Coordination",
        priority: "High",
        dueDate: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10),
        note: `Auto-generated from Design Workspace markup ${selectedMarkup.id}.`,
        sourceRoute: "/portal/design",
        snapshot,
      });
      await linkMarkupToRfi(projectId, selectedMarkup.id, {
        question: selectedMarkup.label || "Auto-linked design clarification",
        snapshot,
      }).catch(() => null);
      setStatusMessage("Native RFI created from markup with drawing/model snapshot and metadata.");
      await workspace.refresh();
    } catch (error) {
      setStatusMessage(error.message || "Unable to create RFI from selected markup.");
    } finally {
      setBusy(false);
    }
  }

  async function handleApproveDesignChange() {
    if (!projectId || !selectedFileId) {
      setStatusMessage("Select governed project file before approving design change.");
      return;
    }
    setBusy(true);
    try {
      const summary = selectedMarkup?.label || activeSheet?.name || "Design revision";
      const flag = {
        id: `design-update-${Date.now()}`,
        projectId,
        fileId: selectedFileId,
        sheetId: workspace.activeSheetId,
        markupId: selectedMarkup?.id || "",
        summary,
        status: "update-required",
        issuedAt: new Date().toISOString(),
      };

      const existing = readLocalJson(DESIGN_UPDATE_FLAGS_KEY, []);
      writeLocalJson(DESIGN_UPDATE_FLAGS_KEY, [flag, ...existing].slice(0, 150));

      await sendPortalMessage({
        channel: "teams",
        subject: `${projectId} design change approved`,
        message: `${summary} approved in Design Workspace. Estimate + Scheduling updates required.`,
      }).catch(() => null);

      if (precon.continuity?.estimateId) {
        await mutateEstimate("add-line", {
          estimateId: precon.continuity.estimateId,
          label: `Update Required · ${summary}`,
          amount: "$0",
          note: `Auto-flag from design approval (${workspace.activeSheetId}).`,
          detail: `Design workspace approved change ${summary} requires estimate recalculation.`,
        }).catch(() => null);
      }

      await createFieldScheduleEvent({
        projectId,
        title: `Design Update Required · ${summary}`,
        date: new Date().toISOString().slice(0, 10),
        crew: "Planning / PM",
        estimatedCost: "0",
      }).catch(() => null);

      await createFieldTask({
        projectId,
        task: `Review approved design change: ${summary}`,
        assignee: assignedFieldTask?.assignee || "Field Lead",
        dueDate: new Date(Date.now() + (2 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10),
        priority: "High",
        estimatedCost: "0",
      }).catch(() => null);

      setDownstreamNotice(`Update Required pushed to Estimates and Scheduling for ${summary}.`);
      setStatusMessage("Design change approved and downstream orchestration triggered.");
    } catch (error) {
      setStatusMessage(error.message || "Unable to propagate approved change.");
    } finally {
      setBusy(false);
    }
  }

  async function handleExport() {
    setBusy(true);
    try {
      await exportDesignPackage(projectId, { fileId: selectedFileId });
      await exportFcaNativePackage(projectId, { fileId: selectedFileId });
      setStatusMessage("FCAP native export and markup package prepared on the governed spine.");
    } catch (exportError) {
      setStatusMessage(exportError.message || "Export failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleExportNative() {
    setBusy(true);
    try {
      await exportFcaNativePackage(projectId, { fileId: selectedFileId });
      setStatusMessage("FCAP package exported through fca-export — FCAM and FCAS streams included.");
    } catch (exportError) {
      setStatusMessage(exportError.message || "FCAP export failed.");
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
      const clashResult = await runBimClashDetection(projectId, selectedFileId);
      const guidance = suggestClashResolution(clashResult, activeSheet);
      setClashGuidance(guidance);
      setStatusMessage(`Clash detection completed. ${guidance.title}`);
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

  async function handleGenerateEngineeringPackage() {
    if (!selectedFileId) {
      setStatusMessage("Select a governed file before generating engineering package.");
      return;
    }

    setBusy(true);
    try {
      await runBimClashDetection(projectId, selectedFileId).catch(() => null);
      await saveBimModel(projectId, {
        fileId: selectedFileId,
        sheets: workspace.sheets,
        elements: [],
        quantities: workspace.markups.map((markup) => ({ markupId: markup.id, type: markup.type })),
        packageType: "engineering-bim-mep",
      });

      await sendAuricruxMessage({
        message: "Generate MEP coordination package and summarize high-risk clashes for issue routing.",
        route: "/portal/design",
        context: {
          designContext: {
            projectId,
            fileId: selectedFileId,
            sheetId: workspace.activeSheetId,
            markups: workspace.markups,
          },
        },
      }).catch(() => null);

      const payload = {
        projectId,
        fileId: selectedFileId,
        sheetId: workspace.activeSheetId,
        generatedAt: new Date().toISOString(),
        packageType: "engineering-bim-mep",
        markups: workspace.markups.map((markup) => ({
          id: markup.id,
          type: markup.type,
          status: markup.status,
          sheetId: markup.sheetId,
        })),
      };
      const baseName = `${projectId}-${selectedFileId}-engineering-package`.replace(/[^a-zA-Z0-9_-]+/g, "-").toLowerCase();

      if (engineeringFormat === "json") {
        downloadPayload(`${baseName}.json`, JSON.stringify(payload, null, 2), "application/json");
      } else {
        const rows = [
          "projectId,fileId,sheetId,markupId,markupType,status",
          ...payload.markups.map((markup) => `${payload.projectId},${payload.fileId},${payload.sheetId || ""},${markup.id},${markup.type},${markup.status || ""}`),
        ];
        downloadPayload(`${baseName}.csv`, rows.join("\n"), "text/csv");
      }

      setStatusMessage("Engineering BIM/MEP package generated and exported.");
    } catch (engineeringError) {
      setStatusMessage(engineeringError.message || "Unable to generate engineering package.");
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
      subtitle="Native plan room — markup, takeoff, coordination, and redlines."
      activeHref="/portal/design"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.design}
    >
      <PortalSliceAuricrux
        title="Auricrux Design Intelligence"
        targetObjectType="File"
        targetObjectId={selectedFileId || projectId}
        sourceRoute="/portal/design"
        rationale="Plan room work must stay on FCA native design surfaces with governed extraction and markup."
        nextAction="Run extraction or markup on the active sheet."
        actionHref="/portal/files"
        actionLabel="Open files"
        liveRecommend
      />
      <div style={{ display: "grid", gap: 16 }}>
        <div style={panelStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <div style={{ color: "#2563eb", fontWeight: 700 }}>FCA Design Workspace</div>
              <h1 style={{ margin: "8px 0 0" }}>Plan Room Pro — {projectId}</h1>
              <div style={{ marginTop: 8, color: "#64748b", fontSize: 13 }}>
                FCA native workflow on Microsoft resources. Supported inputs include CAD, BIM, documentation, collaboration, and visual field formats.
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <label style={{ border: "1px solid #2563eb", background: "#eff6ff", color: "#1d4ed8", borderRadius: 10, padding: "10px 12px", fontWeight: 700, cursor: "pointer" }}>
                Upload plan set
                <input type="file" accept={uploadAccept} onChange={handleUpload} style={{ display: "none" }} />
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

        {deltaSummary ? (
          <div style={{ ...panelStyle, border: "1px solid #dbeafe", background: "#eff6ff" }}>
            <div style={{ fontWeight: 800, color: "#1d4ed8", marginBottom: 6 }}>Automated Delta Analysis</div>
            <div style={{ color: "#334155", lineHeight: 1.65 }}>{deltaSummary.loading ? "Running..." : deltaSummary.message}</div>
          </div>
        ) : null}

        {downstreamNotice ? (
          <div style={{ ...panelStyle, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534" }}>
            <strong>Design-to-Execution Push:</strong> {downstreamNotice}
          </div>
        ) : null}

        {visibleRfiPins.length ? (
          <div style={{ ...panelStyle, border: "1px solid #dbeafe", background: "#eff6ff" }}>
            <div style={{ fontWeight: 800, color: "#1d4ed8", marginBottom: 6 }}>Model-Integrated RFI Pins</div>
            <div style={{ display: "grid", gap: 8 }}>
              {visibleRfiPins.map((pin) => (
                <div key={pin.id} style={{ border: "1px solid #bfdbfe", borderRadius: 10, padding: 10, background: "#fff" }}>
                  <div style={{ fontWeight: 700 }}>{pin.rfiNumber || pin.rfiId}</div>
                  <div style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>
                    Object {pin.objectId || "—"} · Coordinate {pin.coordinate || "—"} · Sheet {pin.sheetId || "—"}
                  </div>
                  <a href={`/portal/rfis?projectId=${encodeURIComponent(projectId)}`} style={{ fontSize: 12, color: "#2563eb" }}>
                    Open RFI register
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : null}

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
                {!designFiles.length ? <div style={{ color: "#64748b" }}>Upload DWG, DXF, DGN, RVT, IFC, Navisworks, SketchUp, PDF, TIFF/CALS, DWF, BCF, COBie, STEP/STP, or JPG/PNG to begin.</div> : null}
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
              <div style={{ fontWeight: 700, marginBottom: 8 }}>5D Live Thread (model → time → cost)</div>
              <div style={{ display: "grid", gap: 8, color: "#334155", fontSize: 13 }}>
                <div><strong>Selected object:</strong> {liveThread.object}</div>
                <div><strong>Estimate linkage:</strong> {liveThread.estimateId}</div>
                <div><strong>Cost impact:</strong> {liveThread.cost}</div>
                <div><strong>Procurement status:</strong> {liveThread.procurement}</div>
                <div><strong>Installer owner:</strong> {liveThread.installer}</div>
                <div><strong>Schedule commitment:</strong> {liveThread.schedule}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                <a href={`/portal/estimates?projectId=${encodeURIComponent(projectId)}`} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "7px 10px", textDecoration: "none", color: "#334155", fontWeight: 700 }}>
                  Open estimate
                </a>
                <a href={`/portal/billing?projectId=${encodeURIComponent(projectId)}`} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "7px 10px", textDecoration: "none", color: "#334155", fontWeight: 700 }}>
                  Open billing
                </a>
                <a href={`/portal/field-tasks?projectId=${encodeURIComponent(projectId)}`} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "7px 10px", textDecoration: "none", color: "#334155", fontWeight: 700 }}>
                  Open field tasks
                </a>
              </div>
            </div>

            <div style={panelStyle}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Markup to RFI + Change Control</div>
              <div style={{ color: "#475569", fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>
                Create governed RFI package from current markup and push approved changes to estimating/scheduling.
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={handleCreateRfiFromMarkup}
                  disabled={busy || !selectedMarkup}
                  style={{ border: "1px solid #1d4ed8", background: "#eff6ff", color: "#1d4ed8", borderRadius: 8, padding: "8px 10px", fontWeight: 700, cursor: "pointer" }}
                >
                  Create RFI from markup
                </button>
                <button
                  type="button"
                  onClick={handleApproveDesignChange}
                  disabled={busy}
                  style={{ border: "1px solid #166534", background: "#f0fdf4", color: "#166534", borderRadius: 8, padding: "8px 10px", fontWeight: 700, cursor: "pointer" }}
                >
                  Approve design change
                </button>
              </div>
              <div style={{ marginTop: 10, color: "#64748b", fontSize: 12 }}>
                Linked RFI: {linkedRfi?.number || linkedRfi?.rfiId || "None"}
              </div>
            </div>

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
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Live Sync review room</div>
              <div style={{ color: "#475569", fontSize: 13, marginBottom: 10 }}>
                PM, Architect, and Subcontractor alignment with AI-captured design decisions.
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <button type="button" onClick={handleCollab} disabled={busy} style={{ border: "1px solid #2563eb", background: "#eff6ff", color: "#1d4ed8", borderRadius: 8, padding: "8px 10px", fontWeight: 700, cursor: "pointer" }}>
                  {liveSyncActive ? "Live Sync active" : "Start Live Sync"}
                </button>
              </div>
              <textarea
                value={decisionNote}
                onChange={(event) => setDecisionNote(event.target.value)}
                placeholder="Log verbal agreement as a governed design decision"
                style={{ width: "100%", minHeight: 70, border: "1px solid #cbd5e1", borderRadius: 8, padding: 10, boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button type="button" onClick={() => logDesignDecision(decisionNote)} style={{ border: "1px solid #cbd5e1", background: "#fff", color: "#334155", borderRadius: 8, padding: "7px 10px", fontWeight: 700, cursor: "pointer" }}>
                  Record decision
                </button>
              </div>
              <div style={{ marginTop: 10, display: "grid", gap: 8, maxHeight: 170, overflowY: "auto" }}>
                {designDecisions.filter((item) => item.projectId === projectId).slice(0, 6).map((item) => (
                  <div key={item.id} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 8, background: "#f8fafc" }}>
                    <div style={{ color: "#334155", fontSize: 13 }}>{item.note}</div>
                    <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>{item.at}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={panelStyle}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Auricrux Compliance Bot</div>
              {complianceWarnings.length ? (
                <div style={{ display: "grid", gap: 8 }}>
                  {complianceWarnings.map((warning) => (
                    <div key={warning.code} style={{ border: "1px solid #fecaca", borderRadius: 8, padding: 10, background: "#fef2f2" }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: warning.severity === "critical" ? "#991b1b" : "#b45309" }}>{warning.code}</div>
                      <div style={{ color: "#7f1d1d", fontSize: 13, marginTop: 4 }}>{warning.message}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#166534", fontSize: 13 }}>No active compliance violations for selected markup.</div>
              )}
            </div>

            <div style={panelStyle}>
              <FcaNativeViewerPanel
                viewerSession={workspace.viewerSession}
                fileFormat={fileFormat}
                fileId={selectedFileId}
                onExportNative={handleExportNative}
              />
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e2e8f0", display: "grid", gap: 8 }}>
                <div style={{ fontWeight: 700 }}>Engineer package generation</div>
                <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>
                  Build scalable BIM/MEP-ready package artifacts from the active governed file.
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <select
                    value={engineeringFormat}
                    onChange={(event) => setEngineeringFormat(event.target.value)}
                    style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px", fontWeight: 700 }}
                    aria-label="Engineering package format"
                  >
                    <option value="json">JSON package</option>
                    <option value="csv">CSV package</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleGenerateEngineeringPackage}
                    disabled={busy || !selectedFileId}
                    style={{ border: "1px solid #2563eb", background: "#eff6ff", color: "#1d4ed8", borderRadius: 8, padding: "8px 12px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Generate BIM/MEP package
                  </button>
                </div>
              </div>
            </div>
            {clashGuidance ? (
              <div style={panelStyle}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Automated clash resolution guidance</div>
                <div style={{ color: "#334155", marginBottom: 8 }}>{clashGuidance.title}</div>
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, color: "#475569" }}>
                  {clashGuidance.recommendations.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ) : null}
            <div style={panelStyle}>
              <AuricruxDesignInsight intelligence={workspace.intelligence} onAskAuricrux={handleAskAuricrux} projectId={projectId} fileId={workspace.activeFile?.id} />
            </div>
            <div style={panelStyle}>
              <DesignPropertiesPanel activeSheet={activeSheet} selectedMarkup={selectedMarkup} intelligence={workspace.intelligence} />
            </div>
            <div style={panelStyle}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Digital Twin fidelity</div>
              <div style={{ color: "#475569", fontSize: 13, lineHeight: 1.7 }}>
                <div><strong>Field captures:</strong> {digitalTwinSignal.fieldEvidenceCount}</div>
                <div><strong>Completed field tasks:</strong> {digitalTwinSignal.completedTasks} / {digitalTwinSignal.totalTasks}</div>
                <div><strong>As-built variance:</strong> {digitalTwinSignal.variance} scope item(s) missing field evidence overlay</div>
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a href={`/portal/files?projectId=${encodeURIComponent(projectId)}`} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "7px 10px", textDecoration: "none", color: "#334155", fontWeight: 700 }}>
                  Open field evidence
                </a>
                <a href={`/portal/field-tasks?projectId=${encodeURIComponent(projectId)}`} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "7px 10px", textDecoration: "none", color: "#334155", fontWeight: 700 }}>
                  Verify as-built tasks
                </a>
              </div>
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
                <div style={{ marginTop: 0 }}>
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
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
                  <ApsInteropPanel
                    viewerSession={workspace.viewerSession}
                    fileFormat={fileFormat}
                    onQueueTranslation={workspace.queueViewerTranslation}
                    queueBusy={workspace.queueBusy}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
