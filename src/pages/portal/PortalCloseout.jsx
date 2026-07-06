import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import useWorkflowEvidence from "../../hooks/useWorkflowEvidence";
import {
  PortalAlert,
  PortalEntityTable,
  PortalEmptyState,
  PortalLoadingState,
  PortalPageIntro,
  PortalQuickStats,
  PortalStatusBadge,
} from "../../components/portal/PortalPrimitives";
import { portalButtonPrimary, portalButtonSecondary, portalCardStyle, portalInputStyle, portalTokens } from "../../portalDesignTokens";
import {
  advanceCloseoutPackage,
  createCloseoutPackage,
  createWarrantyCase,
  fetchChangeOrders,
  fetchCloseoutPackages,
  fetchJobCosts,
  fetchProjectRfis,
  fetchWarrantyCases,
} from "../../api/constructionClient";
import { fetchFieldTasks } from "../../api/fieldOpsClient";
import { fetchFinancialWorkspace } from "../../api/financialClient";
import { fetchPortalInvoices, sendPortalMessage } from "../../api/portalClient";
import { routeStateOverlays } from "../../systemState";

const CHECKLIST_STORAGE_KEY = "fca_closeout_turnover_checklist_v1";
const ARCHIVE_SIGNAL_KEY = "fca_closeout_archive_signals_v1";

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

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatUsd(value) {
  return `$${Math.round(toNumber(value)).toLocaleString()}`;
}

function detectSystemTag(text = "") {
  const hay = normalize(text);
  if (/hvac|air handler|duct|mechanical|chiller/.test(hay)) return "HVAC";
  if (/electrical|panel|switchgear|lighting|conduit/.test(hay)) return "Electrical";
  if (/plumb|pump|boiler|sanitary|domestic water/.test(hay)) return "Plumbing";
  if (/fire alarm|sprinkler|life safety/.test(hay)) return "Life Safety";
  if (/envelope|window|roof|facade|curtain wall/.test(hay)) return "Envelope";
  return "General";
}

function parseChecklistText(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
    .filter(Boolean)
    .map((line, index) => ({
      id: `req-${index + 1}`,
      title: line,
      token: normalize(line),
    }));
}

function parseTaskCompletion(task) {
  const status = normalize(task.status || task.recordStatus);
  return status.includes("complete") || status.includes("closed") || status.includes("done");
}

function joinCsvRow(values) {
  return values
    .map((item) => {
      const text = String(item ?? "");
      if (/[,"\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
      return text;
    })
    .join(",");
}

function downloadFile(fileName, content, type = "text/plain") {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function PortalCloseout() {
  const { projectId, hasProject } = usePortalProjectId();
  const { projects } = useProjectWorkspace();
  const { files } = useWorkflowEvidence(projectId);

  const [checklistDraft, setChecklistDraft] = useState("");
  const [savedChecklistMap, setSavedChecklistMap] = useState(() => readLocalJson(CHECKLIST_STORAGE_KEY, {}));
  const [archiveSignals, setArchiveSignals] = useState(() => readLocalJson(ARCHIVE_SIGNAL_KEY, {}));
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const closeoutLoad = usePortalApiLoad(() => (hasProject ? fetchCloseoutPackages(projectId) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const warrantyLoad = usePortalApiLoad(() => (hasProject ? fetchWarrantyCases(projectId) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const taskLoad = usePortalApiLoad(() => (hasProject ? fetchFieldTasks({ projectId }) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const rfiLoad = usePortalApiLoad(() => (hasProject ? fetchProjectRfis(projectId) : Promise.resolve([])), [projectId, hasProject]);
  const coLoad = usePortalApiLoad(() => (hasProject ? fetchChangeOrders(projectId) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const invoiceLoad = usePortalApiLoad(() => fetchPortalInvoices(), []);
  const jobCostLoad = usePortalApiLoad(() => (hasProject ? fetchJobCosts(projectId) : Promise.resolve({ items: [], rollup: {} })), [projectId, hasProject]);
  const financeLoad = usePortalApiLoad(() => (hasProject ? fetchFinancialWorkspace("construction", { projectId }) : Promise.resolve({ package: {} })), [projectId, hasProject]);

  const closeoutPackages = closeoutLoad.data?.items || [];
  const warranties = warrantyLoad.data?.items || [];
  const fieldTasks = taskLoad.data?.items || [];
  const rfis = rfiLoad.data || [];
  const changeOrders = coLoad.data?.items || [];
  const invoices = invoiceLoad.data?.items || [];
  const jobCostRollup = jobCostLoad.data?.rollup || {};
  const financePackage = financeLoad.data?.package || {};

  const activeProject = projects.find((project) => project.id === projectId) || null;

  useEffect(() => {
    writeLocalJson(CHECKLIST_STORAGE_KEY, savedChecklistMap);
  }, [savedChecklistMap]);

  useEffect(() => {
    writeLocalJson(ARCHIVE_SIGNAL_KEY, archiveSignals);
  }, [archiveSignals]);

  useEffect(() => {
    const current = savedChecklistMap[projectId];
    if (current?.raw) {
      setChecklistDraft(current.raw);
    }
  }, [projectId]);

  const completedTasks = useMemo(() => fieldTasks.filter((task) => parseTaskCompletion(task)), [fieldTasks]);

  const requiredTokens = useMemo(() => {
    const baseline = [
      { id: "req-om", title: "O&M manuals", token: "manual" },
      { id: "req-asbuilt", title: "As-built model and drawings", token: "as built" },
      { id: "req-warranty", title: "Warranty certificates", token: "warranty" },
      { id: "req-photo", title: "As-built field photos", token: "photo" },
      { id: "req-lien", title: "Lien waiver package", token: "lien waiver" },
      { id: "req-cobie", title: "COBie/FM export", token: "cobie" },
      { id: "req-substantial", title: "Certificate of substantial completion", token: "substantial completion" },
    ];
    const uploaded = savedChecklistMap[projectId]?.items || [];
    return [...baseline, ...uploaded];
  }, [savedChecklistMap, projectId]);

  const turnoverAssembly = useMemo(() => {
    const byToken = requiredTokens.map((req) => {
      const token = normalize(req.token || req.title);
      const hits = files.filter((file) => {
        const hay = normalize(`${file.name || ""} ${file.category || ""} ${file.note || ""} ${file.linkedEvidenceTarget || ""}`);
        return token && hay.includes(token);
      });
      const approvedHits = hits.filter((file) => /approved|verified|ready/i.test(`${file.status || ""} ${file.evidenceStatus || ""}`));
      return {
        ...req,
        matchedCount: hits.length,
        approvedCount: approvedHits.length,
        matchedFiles: hits,
        complete: approvedHits.length > 0,
      };
    });

    const completedCount = byToken.filter((item) => item.complete).length;
    const completionPct = byToken.length ? Math.round((completedCount / byToken.length) * 100) : 0;

    return {
      rows: byToken,
      completedCount,
      totalCount: byToken.length,
      completionPct,
      missing: byToken.filter((item) => !item.complete),
    };
  }, [requiredTokens, files]);

  const turnoverAgentRows = useMemo(() => {
    return completedTasks.map((task) => {
      const taskKey = normalize(`${task.task || task.title || ""} ${task.zone || ""} ${task.bimObjectId || ""}`);
      const relatedFiles = files.filter((file) => {
        const hay = normalize(`${file.name || ""} ${file.note || ""} ${file.linkedEvidenceTarget || ""}`);
        return taskKey.split(" ").some((token) => token.length > 3 && hay.includes(token));
      });
      const warrantyDoc = relatedFiles.find((file) => /warranty/i.test(`${file.name || ""} ${file.category || ""}`));
      const manualDoc = relatedFiles.find((file) => /manual|o&m|operation/i.test(`${file.name || ""} ${file.category || ""}`));
      const asBuiltPhoto = relatedFiles.find((file) => /photo|as[- ]?built/i.test(`${file.name || ""} ${file.category || ""}`));

      const missing = [
        !warrantyDoc ? "Warranty cert" : "",
        !manualDoc ? "Maintenance manual" : "",
        !asBuiltPhoto ? "As-built photo" : "",
      ].filter(Boolean);

      return {
        id: String(task.taskId || task.id || taskKey),
        task: task.task || task.title || "Field scope",
        zone: task.zone || "Zone n/a",
        relatedFiles,
        missing,
        status: missing.length ? "Needs docs" : "Compliant",
      };
    });
  }, [completedTasks, files]);

  const warrantyMatrix = useMemo(() => {
    const mapped = files
      .filter((file) => /warranty|guarantee/i.test(`${file.name || ""} ${file.category || ""}`))
      .map((file) => {
        const system = detectSystemTag(`${file.name || ""} ${file.note || ""} ${file.linkedEvidenceTarget || ""}`);
        const linkedWarrantyCase = warranties.find((entry) => normalize(`${entry.title || ""} ${entry.description || ""}`).includes(normalize(system)));
        return {
          id: file.fileId || file.id,
          system,
          file,
          installerSub: file.owner || file.discipline || "Subcontractor",
          linkedWarrantyCase,
        };
      });
    return mapped;
  }, [files, warranties]);

  const financialGate = useMemo(() => {
    const financeMetrics = financePackage.metrics || {};
    const payApps = financePackage.payApps || [];

    const retainageReleased = payApps.length
      ? payApps.every((payApp) => toNumber(payApp.retentionHeld || payApp.retainageHeld || 0) <= 0)
      : toNumber(financeMetrics.retentionHeld || 0) <= 0;

    const unsignedChangeOrders = changeOrders.filter((item) => {
      const status = normalize(item.status || item.recordStatus);
      return !status.includes("approved") && !status.includes("executed") && !status.includes("signed");
    });

    const signedButUninvoiced = changeOrders.filter((item) => {
      const status = normalize(item.status || item.recordStatus);
      if (!(status.includes("approved") || status.includes("signed") || status.includes("executed"))) return false;
      const coId = String(item.changeOrderId || item.id || "");
      return !invoices.some((invoice) => normalize(`${invoice.invoiceName || ""} ${invoice.note || ""}`).includes(normalize(coId)));
    });

    const lienWaivers = files.filter((file) => /lien waiver|waiver/i.test(`${file.name || ""} ${file.category || ""}`));
    const lienWaiversVerified = lienWaivers.filter((file) => /approved|verified|ready/i.test(`${file.status || ""} ${file.evidenceStatus || ""}`));

    const openSubBalance = Math.max(0, toNumber(jobCostRollup.committedCost || 0) - toNumber(jobCostRollup.actualCost || 0));
    const substantialCert = files.find((file) => /certificate of substantial completion|substantial completion/i.test(`${file.name || ""} ${file.note || ""}`));

    return {
      retainageReleased,
      unsignedChangeOrders,
      signedButUninvoiced,
      lienWaivers,
      lienWaiversVerified,
      openSubBalance,
      substantialCert,
      readyForArchive: retainageReleased
        && unsignedChangeOrders.length === 0
        && signedButUninvoiced.length === 0
        && lienWaivers.length > 0
        && lienWaiversVerified.length === lienWaivers.length
        && openSubBalance <= 1
        && Boolean(substantialCert),
    };
  }, [financePackage, changeOrders, invoices, files, jobCostRollup]);

  const archiveSignal = archiveSignals[projectId] || null;

  const loading = closeoutLoad.status === "loading" || taskLoad.status === "loading" || financeLoad.status === "loading";

  async function ensureCloseoutPackage() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (!closeoutPackages.length) {
        await createCloseoutPackage({
          projectId,
          title: `Operational handover package - ${projectId}`,
          requiredArtifacts: requiredTokens.map((item) => item.title),
          nextAction: "Turnover agent is assembling evidence continuously from project spine.",
        });
        await closeoutLoad.reload();
        setNotice("Closeout-by-design package created and tethered to project spine.");
      } else {
        setNotice("Closeout package already exists for this project.");
      }
    } catch (ensureError) {
      setError(ensureError.message || "Unable to create closeout package.");
    } finally {
      setBusy(false);
    }
  }

  async function refreshAll() {
    setBusy(true);
    setError("");
    try {
      await Promise.all([
        closeoutLoad.reload(),
        warrantyLoad.reload(),
        taskLoad.reload(),
        rfiLoad.reload(),
        coLoad.reload(),
        invoiceLoad.reload(),
        jobCostLoad.reload(),
        financeLoad.reload(),
      ]);
      setNotice("Turnover telemetry refreshed.");
    } catch {
      setNotice("Turnover telemetry refreshed with partial data.");
    } finally {
      setBusy(false);
    }
  }

  async function saveRequirementChecklist() {
    const rows = parseChecklistText(checklistDraft);
    setSavedChecklistMap((current) => ({
      ...current,
      [projectId]: {
        raw: checklistDraft,
        items: rows,
        savedAt: new Date().toISOString(),
      },
    }));
    setNotice(`Saved turnover requirement checklist (${rows.length} requirement(s)).`);
  }

  async function promoteTurnoverProgress() {
    if (!closeoutPackages.length) {
      await ensureCloseoutPackage();
      return;
    }

    const pkg = closeoutPackages[0];
    const completed = turnoverAssembly.rows.filter((item) => item.complete).map((item) => item.title);
    const nextStatus = turnoverAssembly.missing.length ? "in_progress" : "ready_for_turnover";

    setBusy(true);
    setError("");
    try {
      const advancePayload = await advanceCloseoutPackage({
        closeoutPackageId: pkg.closeoutPackageId,
        completedArtifacts: completed,
        status: nextStatus,
        nextAction: turnoverAssembly.missing.length
          ? `Missing: ${turnoverAssembly.missing.slice(0, 3).map((item) => item.title).join(", ")}`
          : "Turnover package complete. Trigger owner handover and archive gates.",
        sourceRoute: "/portal/closeout",
      });
      if (advancePayload?.pendingReview) {
        setNotice(`Safe-Mode active: closeout progression queued for Instructor Review (${advancePayload.reviewItem?.id || "pending"}).`);
        return;
      }
      await closeoutLoad.reload();
      setNotice(`Closeout package updated: ${turnoverAssembly.completedCount}/${turnoverAssembly.totalCount} artifacts complete.`);
    } catch (advanceError) {
      setError(advanceError.message || "Unable to update closeout package progress.");
    } finally {
      setBusy(false);
    }
  }

  async function triggerWarrantyFromAsset(row) {
    setBusy(true);
    setError("");
    try {
      await createWarrantyCase({
        projectId,
        title: `${row.system} warranty continuity case`,
        description: `Asset continuity trace from closeout package. Installer: ${row.installerSub}. Source file: ${row.file.name || row.file.fileId}.`,
        severity: "standard",
      });
      await warrantyLoad.reload();
      setNotice(`Warranty case created for ${row.system}.`);
    } catch (warrantyError) {
      setError(warrantyError.message || "Unable to create warranty case.");
    } finally {
      setBusy(false);
    }
  }

  function exportCobie() {
    const rows = [
      joinCsvRow(["Asset", "System", "Zone", "Installer", "WarrantyFile", "ManualFile", "AsBuiltPhoto", "ProjectId"]),
      ...turnoverAgentRows.map((row) => {
        const warrantyFile = row.relatedFiles.find((file) => /warranty/i.test(`${file.name || ""} ${file.category || ""}`));
        const manualFile = row.relatedFiles.find((file) => /manual|o&m/i.test(`${file.name || ""} ${file.category || ""}`));
        const photoFile = row.relatedFiles.find((file) => /photo|as[- ]?built/i.test(`${file.name || ""} ${file.category || ""}`));
        const system = detectSystemTag(`${row.task} ${row.zone}`);
        return joinCsvRow([
          row.task,
          system,
          row.zone,
          warrantyFile?.owner || manualFile?.owner || "Unknown sub",
          warrantyFile?.name || "",
          manualFile?.name || "",
          photoFile?.name || "",
          projectId,
        ]);
      }),
    ];
    downloadFile(`cobie-fm-export-${projectId}.csv`, rows.join("\n"), "text/csv;charset=utf-8");
    setNotice("COBie/FM export generated for owner FM onboarding.");
  }

  async function triggerArchiveSignal() {
    if (!financialGate.readyForArchive) {
      setError("Financial finality gates are not complete. Resolve retainage, COs, lien waivers, and zero-balance before archiving.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const signal = {
        projectId,
        archivedAt: new Date().toISOString(),
        gateSummary: {
          retainageReleased: financialGate.retainageReleased,
          unsignedChangeOrders: financialGate.unsignedChangeOrders.length,
          signedButUninvoiced: financialGate.signedButUninvoiced.length,
          lienWaiversVerified: financialGate.lienWaiversVerified.length,
          lienWaiversTotal: financialGate.lienWaivers.length,
          openSubBalance: financialGate.openSubBalance,
          substantialCertificate: Boolean(financialGate.substantialCert),
        },
      };
      setArchiveSignals((current) => ({ ...current, [projectId]: signal }));
      await sendPortalMessage({
        subject: `Zero-balance archive signal: ${projectId}`,
        message: `Project ${projectId} passed financial finality and turnover controls. Route to long-term compliance archive.`,
        sourceRoute: "/portal/closeout",
      });
      setNotice("Zero-balance archive signal sent. Project is ready for long-term compliance archive transition.");
    } catch (archiveError) {
      setError(archiveError.message || "Unable to send archive signal.");
    } finally {
      setBusy(false);
    }
  }

  const blockedChecklist = turnoverAssembly.missing.slice(0, 4).map((item) => item.title).join(", ");

  return (
    <PortalShell
      title="Closeout Handover Portal"
      subtitle="Living turnover package, warranty continuity, and financial finality gates for operational handover."
      activeHref="/portal/closeout"
      currentJourney="job"
      routeOverlay={routeStateOverlays.projects}
      primaryHref={hasProject ? `/portal/projects/${encodeURIComponent(projectId)}` : "/portal/projects"}
      primaryLabel="Project detail"
    >
      {error ? <PortalAlert tone="error">{error}</PortalAlert> : null}
      {notice ? <PortalAlert tone="success">{notice}</PortalAlert> : null}

      <AuricruxInsightPanel
        title="Auricrux Turnover Agent"
        targetObjectId={projectId}
        sourceRoute="/portal/closeout"
        rationale="Build closeout continuously from project spine evidence so operational handover is always ready, not month-end panic work."
        nextAction={turnoverAssembly.missing.length
          ? `Resolve missing turnover docs: ${blockedChecklist || "see turnover checklist"}.`
          : "Turnover package complete. Trigger owner handover, FM export, and archive transition."}
        recommendations={[
          `${completedTasks.length} closed field task(s) scanned for manuals, warranties, and as-built photos.`,
          `${turnoverAssembly.completedCount}/${turnoverAssembly.totalCount} turnover requirements currently compliant.`,
          `${financialGate.readyForArchive ? "Financial finality gate ready" : "Financial finality gate still blocked"}.`,
        ]}
        tone="blue"
        liveRecommend
      />

      {!hasProject ? (
        <PortalEmptyState
          title="Select a project to operate closeout"
          detail="Closeout-by-design needs an active project spine so turnover intelligence can track files, costs, invoices, and task closures."
          primaryHref="/portal/projects"
          primaryLabel="Open projects"
        />
      ) : null}

      {hasProject && loading ? <PortalLoadingState label="Loading closeout turnover intelligence..." /> : null}

      {hasProject && !loading ? (
        <>
          <PortalPageIntro
            eyebrow="Closeout-by-design"
            title={`Operational handover lane for ${activeProject?.name || projectId}`}
            detail="This module runs as a living archive during construction: every new artifact linked to the project spine is scored for turnover readiness in real time."
            actions={(
              <>
                <button type="button" style={portalButtonPrimary} onClick={ensureCloseoutPackage} disabled={busy}>Initialize package</button>
                <button type="button" style={portalButtonSecondary} onClick={promoteTurnoverProgress} disabled={busy}>Sync package progress</button>
                <button type="button" style={portalButtonSecondary} onClick={refreshAll} disabled={busy}>Refresh telemetry</button>
              </>
            )}
          />

          <PortalQuickStats
            items={[
              { label: "Turnover Complete", value: `${turnoverAssembly.completionPct}%`, hint: `${turnoverAssembly.completedCount}/${turnoverAssembly.totalCount} requirements` },
              { label: "Closed Tasks Scanned", value: completedTasks.length, hint: `${turnoverAgentRows.filter((row) => row.missing.length).length} missing evidence` },
              { label: "Warranty Assets", value: warrantyMatrix.length, hint: `${warrantyMatrix.filter((row) => row.linkedWarrantyCase).length} linked cases` },
              { label: "Open RFIs", value: rfis.length, hint: "Close technical risk before handover" },
            ]}
          />

          <div style={{ ...portalCardStyle, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
              <strong>Automated Turnover Package Assembly</strong>
              <button type="button" style={portalButtonSecondary} onClick={exportCobie}>Export COBie/FM CSV</button>
            </div>
            <PortalEntityTable
              columns={[
                { key: "title", label: "Requirement", render: (row) => <strong>{row.title}</strong> },
                { key: "matched", label: "Evidence", render: (row) => `${row.approvedCount}/${row.matchedCount}` },
                { key: "status", label: "Status", render: (row) => <PortalStatusBadge status={row.complete ? "Compliant" : "Missing"} active={!row.complete} /> },
                {
                  key: "files",
                  label: "Linked Files",
                  render: (row) => row.matchedFiles.length
                    ? row.matchedFiles.slice(0, 2).map((file) => file.name || file.fileId).join(" | ")
                    : "No linked artifact",
                },
              ]}
              rows={turnoverAssembly.rows}
              emptyTitle="No turnover requirements"
              emptyDetail="Upload a turnover requirement checklist or initialize package defaults."
              emptyPrimaryHref="/portal/files"
              emptyPrimaryLabel="Open files"
            />
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 16 }}>
            <strong>Turnover Compliance Checklist Monitor</strong>
            <div style={{ color: portalTokens.muted, fontSize: 13, margin: "6px 0 10px" }}>
              Upload client turnover requirements once; Auricrux monitors missing artifacts continuously.
            </div>
            <textarea
              value={checklistDraft}
              onChange={(event) => setChecklistDraft(event.target.value)}
              placeholder="Paste owner turnover requirements (one line per requirement)..."
              style={{ ...portalInputStyle, minHeight: 110, resize: "vertical" }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <button type="button" style={portalButtonPrimary} onClick={saveRequirementChecklist}>Save checklist</button>
              <a href={`/portal/files?projectId=${encodeURIComponent(projectId)}`} style={{ ...portalButtonSecondary, textDecoration: "none" }}>Open evidence spine</a>
            </div>
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 16 }}>
            <strong>Auricrux Turnover Agent by Closed Task</strong>
            <PortalEntityTable
              columns={[
                { key: "task", label: "Closed Scope", render: (row) => <div><strong>{row.task}</strong><div style={{ color: portalTokens.muted, fontSize: 12 }}>{row.zone}</div></div> },
                { key: "docs", label: "Evidence Count", render: (row) => row.relatedFiles.length },
                { key: "status", label: "Compliance", render: (row) => <PortalStatusBadge status={row.status} active={row.status !== "Compliant"} /> },
                { key: "missing", label: "Missing", render: (row) => row.missing.length ? row.missing.join(", ") : "None" },
              ]}
              rows={turnoverAgentRows}
              emptyTitle="No closed tasks yet"
              emptyDetail="As field tasks close, the turnover agent auto-assembles manuals, warranties, and as-built imagery."
              emptyPrimaryHref="/portal/field-tasks"
              emptyPrimaryLabel="Open field tasks"
            />
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 16 }}>
            <strong>Warranty-to-System Mapping</strong>
            <PortalEntityTable
              columns={[
                { key: "system", label: "System", render: (row) => <strong>{row.system}</strong> },
                { key: "sub", label: "Installing Sub", render: (row) => row.installerSub },
                { key: "doc", label: "Warranty Doc", render: (row) => row.file.name || row.file.fileId },
                { key: "status", label: "Warranty Continuity", render: (row) => <PortalStatusBadge status={row.linkedWarrantyCase ? "Case Linked" : "Ready to Trigger"} active={!row.linkedWarrantyCase} /> },
                {
                  key: "action",
                  label: "",
                  render: (row) => row.linkedWarrantyCase
                    ? <a href={`/portal/warranty?projectId=${encodeURIComponent(projectId)}`} style={{ color: portalTokens.primary }}>Open case</a>
                    : <button type="button" style={portalButtonPrimary} onClick={() => triggerWarrantyFromAsset(row)} disabled={busy}>Trigger case</button>,
                },
              ]}
              rows={warrantyMatrix}
              emptyTitle="No warranty assets mapped"
              emptyDetail="Upload warranty files in the evidence spine to map systems and activate lifecycle continuity."
              emptyPrimaryHref="/portal/files"
              emptyPrimaryLabel="Upload files"
            />
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 16 }}>
            <strong>Financial Finality Gate</strong>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 10 }}>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ color: portalTokens.muted, fontSize: 12 }}>Retainage Status</div>
                <PortalStatusBadge status={financialGate.retainageReleased ? "Released" : "Not released"} active={!financialGate.retainageReleased} />
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ color: portalTokens.muted, fontSize: 12 }}>Unsigned COs</div>
                <strong>{financialGate.unsignedChangeOrders.length}</strong>
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ color: portalTokens.muted, fontSize: 12 }}>Signed but Uninvoiced COs</div>
                <strong>{financialGate.signedButUninvoiced.length}</strong>
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ color: portalTokens.muted, fontSize: 12 }}>Lien Waivers Verified</div>
                <strong>{financialGate.lienWaiversVerified.length}/{financialGate.lienWaivers.length}</strong>
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ color: portalTokens.muted, fontSize: 12 }}>Open Subcontract Balance</div>
                <strong>{formatUsd(financialGate.openSubBalance)}</strong>
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ color: portalTokens.muted, fontSize: 12 }}>Substantial Completion Cert</div>
                <PortalStatusBadge status={financialGate.substantialCert ? "Collected" : "Missing"} active={!financialGate.substantialCert} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              <button type="button" style={portalButtonPrimary} onClick={triggerArchiveSignal} disabled={busy}>Emit Zero-Balance Archive Signal</button>
              <a href={`/portal/finance?projectId=${encodeURIComponent(projectId)}&view=construction`} style={{ ...portalButtonSecondary, textDecoration: "none" }}>Open finance gate</a>
              <a href={`/portal/change-orders?projectId=${encodeURIComponent(projectId)}`} style={{ ...portalButtonSecondary, textDecoration: "none" }}>Open change orders</a>
              <a href={`/portal/billing?projectId=${encodeURIComponent(projectId)}`} style={{ ...portalButtonSecondary, textDecoration: "none" }}>Open billing</a>
            </div>

            {archiveSignal ? (
              <PortalAlert tone="success">
                Archive signal posted at {new Date(archiveSignal.archivedAt).toLocaleString()}. Compliance archive handoff is now traceable in Audit.
              </PortalAlert>
            ) : null}
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 16 }}>
            <strong>Handover Portal (not one-way archive)</strong>
            <div style={{ color: portalTokens.muted, marginTop: 8, lineHeight: 1.65 }}>
              Owner continuity remains active after project turnover. The same workspace becomes an FM-ready operations portal for warranty, manuals, and compliance evidence.
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <a href={`/portal/warranty?projectId=${encodeURIComponent(projectId)}`} style={{ ...portalButtonPrimary, textDecoration: "none" }}>Owner Warranty Hub</a>
              <a href={`/portal/files?projectId=${encodeURIComponent(projectId)}`} style={{ ...portalButtonSecondary, textDecoration: "none" }}>Owner Document Library</a>
              <a href={`/portal/audit?projectId=${encodeURIComponent(projectId)}`} style={{ ...portalButtonSecondary, textDecoration: "none" }}>Compliance Archive Trail</a>
            </div>
          </div>
        </>
      ) : null}
    </PortalShell>
  );
}
