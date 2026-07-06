import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import useWorkflowEvidence from "../../hooks/useWorkflowEvidence";
import useJobCost from "../../hooks/useJobCost";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import {
  advanceWarrantyCase,
  createWarrantyCase,
  fetchCloseoutPackages,
  fetchWarrantyCases,
} from "../../api/constructionClient";
import { createFieldTask } from "../../api/fieldOpsClient";
import { fetchWarrantyContinuity } from "../../api/warrantyIntakeClient";
import { sendPortalMessage } from "../../api/portalClient";
import { routeStateOverlays } from "../../systemState";
import { buildWarrantyContinuityHints } from "../../utils/warrantyContinuityHints";
import { isWarrantyOverdue, warrantySlaLabel } from "../../utils/warrantySla";
import {
  PortalAlert,
  PortalEntityTable,
  PortalLoadingState,
  PortalPageIntro,
  PortalQuickStats,
  PortalStatusBadge,
} from "../../components/portal/PortalPrimitives";
import { portalButtonPrimary, portalButtonSecondary, portalCardStyle, portalInputStyle, portalTokens } from "../../portalDesignTokens";

const WARRANTY_ASSET_REGISTRY_KEY = "fca_warranty_asset_registry_v1";
const WARRANTY_CASE_META_KEY = "fca_warranty_case_meta_v1";
const WARRANTY_COST_LEDGER_KEY = "fca_warranty_cost_ledger_v1";
const WARRANTY_SCORECARD_KEY = "fca_warranty_sub_scorecard_v1";

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

function normalize(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatUsd(value) {
  return `$${Math.round(toNumber(value)).toLocaleString()}`;
}

function inferSystem(text = "") {
  const hay = normalize(text);
  if (/hvac|air handler|chiller|duct|mechanical/.test(hay)) return "HVAC";
  if (/electrical|panel|switchgear|lighting|conduit/.test(hay)) return "Electrical";
  if (/plumb|boiler|pump|sanitary|water heater/.test(hay)) return "Plumbing";
  if (/fire alarm|sprinkler|life safety/.test(hay)) return "Life Safety";
  if (/roof|facade|window|envelope/.test(hay)) return "Envelope";
  return "General";
}

function inferWarrantyMonths(text = "") {
  const yearsMatch = String(text).match(/(\d+)\s*year/i);
  if (yearsMatch) return Number(yearsMatch[1]) * 12;
  const monthMatch = String(text).match(/(\d+)\s*month/i);
  if (monthMatch) return Number(monthMatch[1]);
  return 12;
}

function addMonths(dateIso, months) {
  const base = new Date(dateIso || Date.now());
  if (Number.isNaN(base.getTime())) return "";
  const next = new Date(base);
  next.setMonth(next.getMonth() + months);
  return next.toISOString();
}

function parseDate(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function daysUntil(dateIso) {
  const at = parseDate(dateIso);
  if (!at) return null;
  return Math.ceil((at - Date.now()) / 86400000);
}

function routeWarrantyCase(caseRecord, asset) {
  const text = normalize(`${caseRecord.title || ""} ${caseRecord.description || ""}`);
  if (/manufacturer defect|factory|component failed|sealed unit|compressor/.test(text)) {
    return { category: "Manufacturer Defect", routeTarget: "Manufacturer", disposition: "Route under manufacturer warranty." };
  }
  if (/install|workmanship|leak at joint|improper|alignment|finish defect|quality/.test(text)) {
    return {
      category: "Workmanship Issue",
      routeTarget: asset?.installerSub || "Original subcontractor",
      disposition: "Issue Notice to Remedy with contract response SLA.",
    };
  }
  if (/user error|misuse|impact damage|tenant caused|operator/.test(text)) {
    return { category: "User Error", routeTarget: "Owner care quoting lane", disposition: "Generate corrective quote for non-warranty repair." };
  }
  return {
    category: "Workmanship Issue",
    routeTarget: asset?.installerSub || "Subcontractor review",
    disposition: "Require scope validation and accountable party confirmation.",
  };
}

function severityCost(severity) {
  if (severity === "urgent") return 4500;
  if (severity === "low") return 850;
  return 2200;
}

function mergeCaseMeta(caseRecord, caseMetaMap, assetLookup) {
  const id = caseRecord.warrantyCaseId || caseRecord.id;
  const assetId = caseMetaMap[id]?.assetId || "";
  const asset = assetLookup[assetId] || null;
  const aiRouting = routeWarrantyCase(caseRecord, asset);
  return {
    id,
    ...caseRecord,
    assetId,
    asset,
    ownerPhotoUrl: caseMetaMap[id]?.ownerPhotoUrl || "",
    reportedBy: caseMetaMap[id]?.reportedBy || "Owner",
    aiRouting,
  };
}

export default function PortalWarranty() {
  const { projectId, hasProject } = usePortalProjectId();
  const { files } = useWorkflowEvidence(projectId);
  const jobCost = useJobCost(projectId);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const [assetRegistryMap, setAssetRegistryMap] = useState(() => readLocalJson(WARRANTY_ASSET_REGISTRY_KEY, {}));
  const [caseMetaMap, setCaseMetaMap] = useState(() => readLocalJson(WARRANTY_CASE_META_KEY, {}));
  const [costLedgerMap, setCostLedgerMap] = useState(() => readLocalJson(WARRANTY_COST_LEDGER_KEY, {}));
  const [scorecardMap, setScorecardMap] = useState(() => readLocalJson(WARRANTY_SCORECARD_KEY, {}));

  const [draft, setDraft] = useState({
    title: "",
    description: "",
    severity: "standard",
    assetId: "",
    ownerPhotoUrl: "",
    reportedBy: "Owner",
  });

  const [assetDraft, setAssetDraft] = useState({
    assetName: "",
    modelNumber: "",
    installDate: new Date().toISOString().slice(0, 10),
    installerSub: "",
    warrantyMonths: "12",
    warrantyFileRef: "",
  });

  const casesLoad = usePortalApiLoad(() => (hasProject ? fetchWarrantyCases(projectId) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const continuityLoad = usePortalApiLoad(() => (hasProject ? fetchWarrantyContinuity(projectId) : Promise.resolve(null)), [projectId, hasProject]);
  const closeoutLoad = usePortalApiLoad(() => (hasProject ? fetchCloseoutPackages(projectId) : Promise.resolve({ items: [] })), [projectId, hasProject]);

  const cases = casesLoad.data?.items || [];
  const continuity = continuityLoad.data?.continuity || continuityLoad.data || null;
  const closeoutPackages = closeoutLoad.data?.items || [];

  useEffect(() => {
    writeLocalJson(WARRANTY_ASSET_REGISTRY_KEY, assetRegistryMap);
  }, [assetRegistryMap]);

  useEffect(() => {
    writeLocalJson(WARRANTY_CASE_META_KEY, caseMetaMap);
  }, [caseMetaMap]);

  useEffect(() => {
    writeLocalJson(WARRANTY_COST_LEDGER_KEY, costLedgerMap);
  }, [costLedgerMap]);

  useEffect(() => {
    writeLocalJson(WARRANTY_SCORECARD_KEY, scorecardMap);
  }, [scorecardMap]);

  const seededAssets = useMemo(() => {
    const warrantyFiles = files.filter((file) => /warranty|guarantee/i.test(`${file.name || ""} ${file.category || ""}`));
    return warrantyFiles.map((file, index) => {
      const fileText = `${file.name || ""} ${file.note || ""} ${file.linkedEvidenceTarget || ""}`;
      const system = inferSystem(fileText);
      const assetName = `${system} Asset ${index + 1}`;
      const installDate = file.createdAt || file.updatedAt || new Date().toISOString();
      const warrantyMonths = inferWarrantyMonths(fileText);
      const assetId = `${projectId}-asset-${file.fileId || index + 1}`;
      return {
        assetId,
        projectId,
        assetName,
        system,
        modelNumber: `MODEL-${(file.fileId || `${index + 1}`).slice(-6)}`,
        installDate,
        installerSub: file.owner || file.discipline || "Trade Partner",
        warrantyMonths,
        warrantyExpiresAt: addMonths(installDate, warrantyMonths),
        warrantyFileRef: file.name || file.fileId,
        evidenceFileId: file.fileId,
      };
    });
  }, [files, projectId]);

  useEffect(() => {
    if (!hasProject) return;
    const existing = assetRegistryMap[projectId] || [];
    if (existing.length || !seededAssets.length) return;
    setAssetRegistryMap((current) => ({ ...current, [projectId]: seededAssets }));
  }, [hasProject, projectId, assetRegistryMap, seededAssets]);

  const assetRows = assetRegistryMap[projectId] || [];
  const assetLookup = Object.fromEntries(assetRows.map((asset) => [asset.assetId, asset]));

  const enrichedCases = useMemo(
    () => cases.map((entry) => mergeCaseMeta(entry, caseMetaMap, assetLookup)),
    [cases, caseMetaMap, assetLookup],
  );

  const hints = useMemo(() => buildWarrantyContinuityHints(continuity || {}), [continuity]);

  const maintenanceRows = useMemo(() => {
    return assetRows.map((asset) => {
      const installAt = parseDate(asset.installDate);
      const sixMonthService = installAt ? addMonths(asset.installDate, 6) : "";
      const annualService = installAt ? addMonths(asset.installDate, 12) : "";
      return {
        ...asset,
        sixMonthService,
        annualService,
      };
    });
  }, [assetRows]);

  const expiryRows = useMemo(() => {
    return assetRows
      .map((asset) => {
        const left = daysUntil(asset.warrantyExpiresAt);
        return { ...asset, daysToExpiry: left };
      })
      .filter((asset) => asset.daysToExpiry !== null && asset.daysToExpiry <= 30)
      .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  }, [assetRows]);

  const workmanshipScoreRows = useMemo(() => {
    const grouped = {};
    for (const entry of enrichedCases) {
      const sub = entry.asset?.installerSub || "Unknown subcontractor";
      grouped[sub] = grouped[sub] || {
        subcontractor: sub,
        workmanshipClaims: 0,
        manufacturerClaims: 0,
        userErrorClaims: 0,
        unresolved: 0,
      };
      if (entry.aiRouting.category === "Workmanship Issue") grouped[sub].workmanshipClaims += 1;
      if (entry.aiRouting.category === "Manufacturer Defect") grouped[sub].manufacturerClaims += 1;
      if (entry.aiRouting.category === "User Error") grouped[sub].userErrorClaims += 1;
      if (String(entry.status || "").toLowerCase() !== "resolved") grouped[sub].unresolved += 1;
    }
    return Object.values(grouped).map((row) => {
      const total = row.workmanshipClaims + row.manufacturerClaims + row.userErrorClaims;
      const liabilityRate = total ? (row.workmanshipClaims / total) * 100 : 0;
      const qualityScore = Math.max(0, Math.round(100 - (liabilityRate * 0.75) - (row.unresolved * 6)));
      return {
        ...row,
        total,
        liabilityRate,
        qualityScore,
        bidPriority: qualityScore < 60 ? "Reduce/Blacklist" : qualityScore < 78 ? "Monitor" : "Preferred",
      };
    }).sort((a, b) => a.qualityScore - b.qualityScore);
  }, [enrichedCases]);

  const warrantyCostRows = useMemo(() => {
    const rows = enrichedCases.map((entry) => {
      const explicit = costLedgerMap[entry.id]?.repairCost;
      const derived = explicit ?? severityCost(entry.severity || "standard");
      return {
        id: entry.id,
        title: entry.title,
        status: entry.status,
        category: entry.aiRouting.category,
        cost: derived,
      };
    });
    const totalCost = rows.reduce((sum, row) => sum + row.cost, 0);
    const baseMargin = toNumber(jobCost.rollup?.grossMarginForecast || 0);
    const adjustedMargin = baseMargin - totalCost;
    return {
      rows,
      totalCost,
      baseMargin,
      adjustedMargin,
    };
  }, [enrichedCases, costLedgerMap, jobCost.rollup]);

  async function handleCreate(event) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    setNotice("");
    setError("");
    try {
      const payload = await createWarrantyCase({
        projectId,
        title: draft.title.trim(),
        description: draft.description.trim() || "Warranty issue logged from care portal.",
        severity: draft.severity,
      });
      const created = payload.item || payload.data || payload;
      const caseId = created?.warrantyCaseId || created?.id;
      if (caseId) {
        setCaseMetaMap((current) => ({
          ...current,
          [caseId]: {
            assetId: draft.assetId,
            ownerPhotoUrl: draft.ownerPhotoUrl.trim(),
            reportedBy: draft.reportedBy,
          },
        }));
      }
      setDraft({ title: "", description: "", severity: "standard", assetId: "", ownerPhotoUrl: "", reportedBy: "Owner" });
      setNotice("Warranty claim logged and routed by Auricrux.");
      await casesLoad.reload();
    } catch (createError) {
      setError(createError.message || "Unable to create warranty case.");
    }
  }

  async function handleAdvance(warrantyCase) {
    const nextStatus = String(warrantyCase.status || "").toLowerCase() === "open" ? "in_progress" : "resolved";
    setBusyId(warrantyCase.id);
    setNotice("");
    setError("");
    try {
      const advancePayload = await advanceWarrantyCase({
        warrantyCaseId: warrantyCase.id,
        status: nextStatus,
        nextAction: nextStatus === "in_progress" ? "Dispatch accountable party and collect repair evidence." : "Close case and lock repair evidence in archive.",
        sourceRoute: "/portal/warranty",
      });
      if (advancePayload?.pendingReview) {
        setNotice(`Safe-Mode active: warranty progression queued for Instructor Review (${advancePayload.reviewItem?.id || "pending"}).`);
        return;
      }
      setNotice(`Warranty case ${warrantyCase.id} moved to ${nextStatus}.`);
      await casesLoad.reload();
    } catch (advanceError) {
      setError(advanceError.message || "Unable to advance warranty case.");
    } finally {
      setBusyId("");
    }
  }

  async function createMaintenanceTask(asset, dueDate) {
    setBusyId(asset.assetId);
    setError("");
    try {
      await createFieldTask({
        projectId,
        task: `Preventative maintenance - ${asset.assetName}`,
        assignee: asset.installerSub || "Service Team",
        dueDate: dueDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        priority: "Normal",
        sourceRoute: "/portal/warranty",
      });
      setNotice(`Preventative maintenance task generated for ${asset.assetName}.`);
    } catch (taskError) {
      setError(taskError.message || "Unable to create maintenance task.");
    } finally {
      setBusyId("");
    }
  }

  async function publishWorkmanshipScorecard() {
    setError("");
    try {
      const payload = {
        projectId,
        publishedAt: new Date().toISOString(),
        scoreRows: workmanshipScoreRows,
      };
      setScorecardMap((current) => ({ ...current, [projectId]: payload }));
      await sendPortalMessage({
        subject: `Warranty workmanship scorecard - ${projectId}`,
        message: `Published ${workmanshipScoreRows.length} subcontractor quality rows to Admin and Pipeline governance review.`,
        sourceRoute: "/portal/warranty",
      });
      setNotice("Workmanship scorecard published to governance signal bus.");
    } catch (publishError) {
      setError(publishError.message || "Unable to publish workmanship scorecard.");
    }
  }

  async function issueNoticeToRemedy(caseRow) {
    const deadline = new Date(Date.now() + (5 * 86400000)).toISOString().slice(0, 10);
    const target = caseRow.asset?.installerSub || "Responsible subcontractor";
    const memo = [
      `NOTICE TO REMEDY - ${caseRow.id}`,
      `Project: ${projectId}`,
      `Issue: ${caseRow.title}`,
      `Category: ${caseRow.aiRouting.category}`,
      `Accountable Party: ${target}`,
      `Deadline: ${deadline}`,
      "Contract Basis: Warranty workmanship obligation and correction-at-cost clause.",
    ].join("\n");

    try {
      await sendPortalMessage({
        subject: `Notice to Remedy issued - ${caseRow.id}`,
        message: memo,
        sourceRoute: "/portal/warranty",
      });
      const blob = new Blob([memo], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `notice-to-remedy-${caseRow.id}.txt`;
      anchor.click();
      URL.revokeObjectURL(url);
      setNotice(`Notice to Remedy issued for ${caseRow.id}.`);
    } catch (noticeError) {
      setError(noticeError.message || "Unable to issue notice to remedy.");
    }
  }

  async function sendExpiryAlert(asset) {
    try {
      await sendPortalMessage({
        subject: `Warranty expiry alert - ${asset.assetName}`,
        message: `Final inspection invitation: ${asset.assetName} warranty expires in ${asset.daysToExpiry} day(s). Route owner walkthrough now.`,
        sourceRoute: "/portal/warranty",
      });
      setNotice(`Final inspection invitation sent for ${asset.assetName}.`);
    } catch (alertError) {
      setError(alertError.message || "Unable to send expiry alert.");
    }
  }

  const loading = casesLoad.status === "loading" || continuityLoad.status === "loading" || closeoutLoad.status === "loading";

  return (
    <PortalShell
      title="Warranty Asset Stewardship"
      subtitle="Asset-linked warranty, accountability, and owner care continuity through lifecycle closeout."
      activeHref="/portal/warranty"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.projects}
      primaryHref="/portal/closeout"
      primaryLabel="Open closeout"
    >
      {notice ? <PortalAlert tone="success">{notice}</PortalAlert> : null}
      {error ? <PortalAlert tone="error">{error}</PortalAlert> : null}

      <PortalPageIntro
        eyebrow="Lifetime stewardship"
        title={`Warranty spine for project ${projectId}`}
        detail="Cases are indexed to turnover assets, routed to accountable parties, and costed against long-term project quality performance."
        actions={(
          <>
            <a href="/warranty" style={portalButtonPrimary}>Owner care intake</a>
            <button type="button" style={portalButtonSecondary} onClick={publishWorkmanshipScorecard}>Publish workmanship scorecard</button>
          </>
        )}
      />

      <AuricruxInsightPanel
        title="Auricrux Warranty Guardian"
        targetObjectId={projectId}
        nextAction={expiryRows.length
          ? `Send final inspection invite for ${expiryRows[0].assetName} (${expiryRows[0].daysToExpiry} day(s) left).`
          : "Route workmanship issues to accountable subs and schedule preventative maintenance tasks."}
        recommendations={[
          `${assetRows.length} turnover asset(s) indexed to warranty spine.`,
          `${enrichedCases.filter((entry) => entry.aiRouting.category === "Workmanship Issue").length} workmanship issue(s) currently tracked.`,
          `${formatUsd(warrantyCostRows.totalCost)} warranty cost captured against lifecycle margin.`,
        ]}
        actionHref="/portal/closeout"
        actionLabel="Review turnover package"
        tone="blue"
      />

      {hints.map((hint) => (
        <PortalAlert key={`${hint.kind}-${hint.actionHref}`} tone={hint.kind === "sla-breach" ? "warning" : "info"}>
          {hint.message} <a href={hint.actionHref}>Open next step</a>
        </PortalAlert>
      ))}

      {loading ? <PortalLoadingState label="Loading warranty stewardship workspace..." /> : null}

      {!loading ? (
        <>
          <PortalQuickStats
            items={[
              { label: "Asset Registry", value: assetRows.length, hint: `${closeoutPackages.length} closeout package(s)` },
              { label: "Open Cases", value: enrichedCases.filter((entry) => String(entry.status || "").toLowerCase() !== "resolved").length, hint: "Active stewardship" },
              { label: "Expiring <=30d", value: expiryRows.length, hint: "Final inspection invites" },
              { label: "Lifecycle Cost", value: formatUsd(warrantyCostRows.totalCost), hint: "Negative margin overlay" },
            ]}
          />

          <div style={{ ...portalCardStyle, marginBottom: 16 }}>
            <strong>Asset-Linked Coverage Registry</strong>
            <div style={{ color: portalTokens.muted, fontSize: 13, margin: "6px 0 12px" }}>
              Every case is tied to as-built turnover assets with model, installer, install date, and warranty documents.
            </div>

            <PortalEntityTable
              columns={[
                { key: "asset", label: "Asset", render: (row) => <div><strong>{row.assetName}</strong><div style={{ color: portalTokens.muted, fontSize: 12 }}>{row.system} | {row.modelNumber}</div></div> },
                { key: "installerSub", label: "Installer" },
                { key: "installDate", label: "Installed", render: (row) => new Date(row.installDate).toLocaleDateString() },
                { key: "warrantyExpiresAt", label: "Expires", render: (row) => new Date(row.warrantyExpiresAt).toLocaleDateString() },
                { key: "warrantyFileRef", label: "Warranty Doc" },
                {
                  key: "maint",
                  label: "Maintenance",
                  render: (row) => (
                    <button type="button" style={portalButtonSecondary} disabled={busyId === row.assetId} onClick={() => createMaintenanceTask(row, addMonths(row.installDate, 6))}>
                      Auto PM Task
                    </button>
                  ),
                },
              ]}
              rows={assetRows}
              emptyTitle="No assets indexed yet"
              emptyDetail="Upload turnover warranty documents in closeout/files to auto-seed the warranty asset spine."
              emptyPrimaryHref="/portal/closeout"
              emptyPrimaryLabel="Open closeout"
            />

            <div style={{ marginTop: 12, borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Add asset manually</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
                <input style={portalInputStyle} placeholder="Asset name" value={assetDraft.assetName} onChange={(event) => setAssetDraft((current) => ({ ...current, assetName: event.target.value }))} />
                <input style={portalInputStyle} placeholder="Model number" value={assetDraft.modelNumber} onChange={(event) => setAssetDraft((current) => ({ ...current, modelNumber: event.target.value }))} />
                <input style={portalInputStyle} type="date" value={assetDraft.installDate} onChange={(event) => setAssetDraft((current) => ({ ...current, installDate: event.target.value }))} />
                <input style={portalInputStyle} placeholder="Installing subcontractor" value={assetDraft.installerSub} onChange={(event) => setAssetDraft((current) => ({ ...current, installerSub: event.target.value }))} />
                <input style={portalInputStyle} placeholder="Warranty months" value={assetDraft.warrantyMonths} onChange={(event) => setAssetDraft((current) => ({ ...current, warrantyMonths: event.target.value }))} />
                <input style={portalInputStyle} placeholder="Warranty file ref" value={assetDraft.warrantyFileRef} onChange={(event) => setAssetDraft((current) => ({ ...current, warrantyFileRef: event.target.value }))} />
              </div>
              <button
                type="button"
                style={{ ...portalButtonPrimary, marginTop: 10 }}
                onClick={() => {
                  if (!assetDraft.assetName.trim()) return;
                  const months = Math.max(1, toNumber(assetDraft.warrantyMonths || 12));
                  const installDateIso = new Date(assetDraft.installDate || Date.now()).toISOString();
                  const asset = {
                    assetId: `${projectId}-manual-${Date.now()}`,
                    projectId,
                    assetName: assetDraft.assetName.trim(),
                    system: inferSystem(assetDraft.assetName),
                    modelNumber: assetDraft.modelNumber.trim() || "MODEL-UNSET",
                    installDate: installDateIso,
                    installerSub: assetDraft.installerSub.trim() || "Trade Partner",
                    warrantyMonths: months,
                    warrantyExpiresAt: addMonths(installDateIso, months),
                    warrantyFileRef: assetDraft.warrantyFileRef.trim() || "manual-entry",
                  };
                  setAssetRegistryMap((current) => ({ ...current, [projectId]: [asset, ...(current[projectId] || [])] }));
                  setAssetDraft({ assetName: "", modelNumber: "", installDate: new Date().toISOString().slice(0, 10), installerSub: "", warrantyMonths: "12", warrantyFileRef: "" });
                  setNotice("Asset added to warranty spine.");
                }}
              >
                Add asset
              </button>
            </div>
          </div>

          <form onSubmit={handleCreate} style={{ ...portalCardStyle, marginBottom: 16 }}>
            <strong>Owner Care Portal Intake</strong>
            <div style={{ color: portalTokens.muted, fontSize: 13, margin: "6px 0 10px" }}>
              Self-service claim reporting with transparent status and evidence archive access.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
              <input style={portalInputStyle} value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Issue title" />
              <input style={portalInputStyle} value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Issue description" />
              <select style={portalInputStyle} value={draft.assetId} onChange={(event) => setDraft((current) => ({ ...current, assetId: event.target.value }))}>
                <option value="">Select affected asset</option>
                {assetRows.map((asset) => <option key={asset.assetId} value={asset.assetId}>{asset.assetName}</option>)}
              </select>
              <select style={portalInputStyle} value={draft.severity} onChange={(event) => setDraft((current) => ({ ...current, severity: event.target.value }))}>
                <option value="urgent">Urgent (24h)</option>
                <option value="standard">Standard (72h)</option>
                <option value="low">Low (7d)</option>
              </select>
              <input style={portalInputStyle} value={draft.ownerPhotoUrl} onChange={(event) => setDraft((current) => ({ ...current, ownerPhotoUrl: event.target.value }))} placeholder="Owner photo URL (optional)" />
              <input style={portalInputStyle} value={draft.reportedBy} onChange={(event) => setDraft((current) => ({ ...current, reportedBy: event.target.value }))} placeholder="Reported by" />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <button type="submit" style={portalButtonPrimary}>Log warranty claim</button>
              <a href="/portal/files" style={{ ...portalButtonSecondary, textDecoration: "none" }}>Open evidence archive</a>
            </div>
          </form>

          <div style={{ ...portalCardStyle, marginBottom: 16 }}>
            <strong>Auricrux Case Categorization and Routing</strong>
            <PortalEntityTable
              columns={[
                { key: "title", label: "Case", render: (row) => <div><strong>{row.title || row.id}</strong><div style={{ color: portalTokens.muted, fontSize: 12 }}>{row.asset?.assetName || "Unlinked asset"}</div></div> },
                { key: "status", label: "Status", render: (row) => <PortalStatusBadge status={row.status || "open"} active={isWarrantyOverdue(row.dueAt, row.status)} /> },
                { key: "sla", label: "SLA", render: (row) => warrantySlaLabel({ severity: row.severity, dueAt: row.dueAt, status: row.status }) },
                { key: "category", label: "AI Category", render: (row) => row.aiRouting.category },
                { key: "route", label: "Route", render: (row) => row.aiRouting.routeTarget },
                {
                  key: "actions",
                  label: "",
                  render: (row) => (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button type="button" style={portalButtonPrimary} disabled={busyId === row.id} onClick={() => handleAdvance(row)}>
                        {busyId === row.id ? "Updating..." : String(row.status || "").toLowerCase() === "open" ? "Start" : "Resolve"}
                      </button>
                      {row.aiRouting.category === "Workmanship Issue" ? (
                        <button type="button" style={portalButtonSecondary} onClick={() => issueNoticeToRemedy(row)}>Notice to Remedy</button>
                      ) : null}
                    </div>
                  ),
                },
              ]}
              rows={enrichedCases}
              emptyTitle="No warranty claims"
              emptyDetail="Owner or PM can log warranty claims from the care intake form above."
              emptyPrimaryHref="/warranty"
              emptyPrimaryLabel="Public intake"
            />
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 16 }}>
            <strong>Subcontractor Workmanship Credit Score</strong>
            <PortalEntityTable
              columns={[
                { key: "subcontractor", label: "Subcontractor" },
                { key: "workmanshipClaims", label: "Workmanship Claims" },
                { key: "unresolved", label: "Unresolved" },
                { key: "qualityScore", label: "Quality Score", render: (row) => <strong>{row.qualityScore}</strong> },
                { key: "bidPriority", label: "Pipeline Priority", render: (row) => <PortalStatusBadge status={row.bidPriority} active={row.bidPriority !== "Preferred"} /> },
              ]}
              rows={workmanshipScoreRows}
              emptyTitle="No scorecard rows"
              emptyDetail="Rows appear as warranty claims are classified and tied to installing subcontractors."
              emptyPrimaryHref="/portal/pipeline"
              emptyPrimaryLabel="Open pipeline"
            />
            {scorecardMap[projectId] ? (
              <div style={{ marginTop: 8, color: portalTokens.muted, fontSize: 12 }}>
                Last published: {new Date(scorecardMap[projectId].publishedAt).toLocaleString()}
              </div>
            ) : null}
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 16 }}>
            <strong>Warranty-to-Cost Lifecycle Tracking</strong>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 10, marginBottom: 10 }}>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ color: portalTokens.muted, fontSize: 12 }}>Base Margin Forecast</div>
                <strong>{formatUsd(warrantyCostRows.baseMargin)}</strong>
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ color: portalTokens.muted, fontSize: 12 }}>Warranty Cost Drag</div>
                <strong style={{ color: "#991b1b" }}>-{formatUsd(warrantyCostRows.totalCost)}</strong>
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ color: portalTokens.muted, fontSize: 12 }}>Adjusted Margin</div>
                <strong>{formatUsd(warrantyCostRows.adjustedMargin)}</strong>
              </div>
            </div>
            <PortalEntityTable
              columns={[
                { key: "title", label: "Case" },
                { key: "category", label: "Category" },
                { key: "status", label: "Status" },
                { key: "cost", label: "Tracked Cost", render: (row) => formatUsd(row.cost) },
              ]}
              rows={warrantyCostRows.rows}
              emptyTitle="No warranty cost entries"
              emptyDetail="Warranty case costs are tracked as long-tail quality drag on project margin."
              emptyPrimaryHref="/portal/job-cost"
              emptyPrimaryLabel="Open job cost"
            />
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 16 }}>
            <strong>Automated Warranty Expiry Alerts</strong>
            <div style={{ color: portalTokens.muted, fontSize: 13, margin: "6px 0 12px" }}>
              Send final inspection invitations 30 days before expiry to protect owner outcomes and reduce delayed-claim litigation risk.
            </div>
            <PortalEntityTable
              columns={[
                { key: "assetName", label: "Asset", render: (row) => <strong>{row.assetName}</strong> },
                { key: "installerSub", label: "Installer" },
                { key: "daysToExpiry", label: "Days Left", render: (row) => row.daysToExpiry },
                { key: "expires", label: "Expires", render: (row) => new Date(row.warrantyExpiresAt).toLocaleDateString() },
                {
                  key: "action",
                  label: "",
                  render: (row) => <button type="button" style={portalButtonPrimary} onClick={() => sendExpiryAlert(row)}>Send Final Inspection Invite</button>,
                },
              ]}
              rows={expiryRows}
              emptyTitle="No near-term expiries"
              emptyDetail="Expiry alerts activate automatically as assets approach the 30-day threshold."
              emptyPrimaryHref="/portal/closeout"
              emptyPrimaryLabel="Review closeout assets"
            />
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 16 }}>
            <strong>Care Portal Transparency</strong>
            <div style={{ color: portalTokens.muted, lineHeight: 1.65, marginTop: 8 }}>
              Owner-facing claim visibility is kept simple and transparent, while technicians retain instant access to original plans and field evidence.
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
              <a href="/warranty" style={{ ...portalButtonPrimary, textDecoration: "none" }}>Open public care portal</a>
              <a href="/portal/files" style={{ ...portalButtonSecondary, textDecoration: "none" }}>As-built evidence archive</a>
              <a href="/portal/closeout" style={{ ...portalButtonSecondary, textDecoration: "none" }}>Turnover package linkage</a>
              <a href="/portal/support" style={{ ...portalButtonSecondary, textDecoration: "none" }}>Support escalation</a>
            </div>
          </div>
        </>
      ) : null}
    </PortalShell>
  );
}
