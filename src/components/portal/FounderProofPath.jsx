import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FOUNDER_PROOF_PATH,
  FOUNDER_PROOF_PROJECT_ID,
  FOUNDER_PROOF_PROJECT_LABEL,
} from "../../config/productionMode";
import { isFounderSession } from "../../customerSession";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import {
  fetchPortalInvoices,
  fetchWorkflowFiles,
  fetchProjectTakeoffs,
  fetchProjectRfis,
} from "../../api/workflowClient";
import { fetchPortalInvoices as fetchInvoicesFromPortal } from "../../api/portalClient";
import {
  portalButtonPrimary,
  portalButtonSecondary,
  portalEyebrowStyle,
  portalTokens,
} from "../../portalDesignTokens";

const STEPS = [
  {
    id: "project",
    label: "Project",
    detail: "Bind the live Package A-117 root (PRJ-BID-1).",
    href: "/portal/projects",
    actionLabel: "Open projects",
  },
  {
    id: "files",
    label: "Files",
    detail: "Confirm workflow files on the same project id.",
    href: "/portal/files",
    actionLabel: "Open files",
  },
  {
    id: "takeoff",
    label: "Takeoff",
    detail: "Quantity takeoffs under the same project spine.",
    href: "/portal/design",
    actionLabel: "Open design / takeoff",
  },
  {
    id: "rfi",
    label: "RFI",
    detail: "Field RFIs linked to the same project id.",
    href: "/portal/rfis",
    actionLabel: "Open RFIs",
  },
  {
    id: "invoice",
    label: "Invoice",
    detail: "Billing artifacts for this workspace.",
    href: "/portal/billing",
    actionLabel: "Open billing",
  },
  {
    id: "auricrux",
    label: "Auricrux",
    detail: "Operator guidance bound to the live project context.",
    href: "/portal/auricrux",
    actionLabel: "Open Auricrux",
  },
];

function statusTone(status) {
  if (status === "pass") return { color: "#166534", bg: "#f0fdf4", border: "#bbf7d0" };
  if (status === "warn") return { color: "#92400e", bg: "#fffbeb", border: "#fde68a" };
  if (status === "fail") return { color: "#991b1b", bg: "#fef2f2", border: "#fecaca" };
  return { color: portalTokens.muted, bg: portalTokens.surface, border: portalTokens.border };
}

async function probeInvoices() {
  try {
    if (typeof fetchPortalInvoices === "function") {
      const payload = await fetchPortalInvoices();
      return Array.isArray(payload?.items) ? payload.items : [];
    }
  } catch {
    // fall through to portal client
  }
  const payload = await fetchInvoicesFromPortal();
  return Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
}

export default function FounderProofPath({ session = null, compact = false }) {
  const founder = isFounderSession(session);
  const { projects, activeProject, meta, selectActiveProject, reloadProjects } = useProjectWorkspace();
  const [probe, setProbe] = useState({
    loading: true,
    project: null,
    files: null,
    takeoffs: null,
    rfis: null,
    invoices: null,
    error: "",
  });
  const [binding, setBinding] = useState(false);
  const [bindError, setBindError] = useState("");

  const liveProject =
    projects.find((project) => project.id === FOUNDER_PROOF_PROJECT_ID) ||
    projects.find((project) => (project.name || "").includes("A-117")) ||
    null;

  const refreshProbe = useCallback(async () => {
    setProbe((current) => ({ ...current, loading: true, error: "" }));
    const projectId = FOUNDER_PROOF_PROJECT_ID;
    const next = {
      loading: false,
      project: null,
      files: null,
      takeoffs: null,
      rfis: null,
      invoices: null,
      error: "",
    };
    try {
      const [filesPayload, takeoffsPayload, rfisPayload, invoices] = await Promise.all([
        fetchWorkflowFiles({ projectId }).catch((err) => ({ error: err.message })),
        fetchProjectTakeoffs(projectId).catch((err) => ({ error: err.message })),
        fetchProjectRfis(projectId).catch((err) => ({ error: err.message })),
        probeInvoices().catch((err) => ({ error: err.message })),
      ]);

      next.project = {
        status: liveProject ? "pass" : meta.backingSource === "api-error" ? "fail" : "warn",
        detail: liveProject
          ? `${liveProject.id} · ${liveProject.name || FOUNDER_PROOF_PROJECT_LABEL}`
          : meta.loadError || "PRJ-BID-1 not returned by /api/projects",
        count: liveProject ? 1 : 0,
      };
      next.files = filesPayload?.error
        ? { status: "fail", detail: filesPayload.error, count: 0 }
        : {
            status: (filesPayload?.items || []).length ? "pass" : "warn",
            detail: `${(filesPayload?.items || []).length} file(s) on ${projectId}`,
            count: (filesPayload?.items || []).length,
          };
      next.takeoffs = takeoffsPayload?.error
        ? { status: "fail", detail: takeoffsPayload.error, count: 0 }
        : {
            status: (takeoffsPayload?.items || []).length ? "pass" : "warn",
            detail: `${(takeoffsPayload?.items || []).length} takeoff(s) on ${projectId}`,
            count: (takeoffsPayload?.items || []).length,
          };
      const rfiItems = takeoffsPayload?.error
        ? []
        : rfisPayload?.items || (Array.isArray(rfisPayload) ? rfisPayload : rfisPayload?.data?.items) || [];
      // fetchProjectRfis from workflowClient returns payload; construction client returns array.
      // Prefer workflow shape; fall back if array.
      let rfiList = [];
      if (rfisPayload?.error) {
        next.rfis = { status: "fail", detail: rfisPayload.error, count: 0 };
      } else {
        rfiList = Array.isArray(rfisPayload?.items)
          ? rfisPayload.items
          : Array.isArray(rfisPayload)
            ? rfisPayload
            : [];
        next.rfis = {
          status: rfiList.length ? "pass" : "warn",
          detail: `${rfiList.length} RFI(s) on ${projectId}`,
          count: rfiList.length,
        };
      }
      if (invoices?.error) {
        next.invoices = { status: "fail", detail: invoices.error, count: 0 };
      } else {
        const list = Array.isArray(invoices) ? invoices : [];
        next.invoices = {
          status: list.length ? "pass" : "warn",
          detail: `${list.length} invoice(s) in workspace billing`,
          count: list.length,
        };
      }
    } catch (err) {
      next.error = err?.message || "Unable to probe live proof spine.";
    }
    setProbe(next);
  }, [liveProject, meta.backingSource, meta.loadError]);

  useEffect(() => {
    refreshProbe();
  }, [refreshProbe]);

  async function bindProofProject() {
    setBinding(true);
    setBindError("");
    try {
      await selectActiveProject(
        FOUNDER_PROOF_PROJECT_ID,
        `Founder Proof Path bound ${FOUNDER_PROOF_PROJECT_ID} as active project root.`,
      );
      await reloadProjects();
      await refreshProbe();
    } catch (err) {
      setBindError(err?.message || "Unable to bind PRJ-BID-1.");
    } finally {
      setBinding(false);
    }
  }

  const stepStatus = useMemo(
    () => ({
      project: probe.project,
      files: probe.files,
      takeoff: probe.takeoffs,
      rfi: probe.rfis,
      invoice: probe.invoices,
      auricrux: {
        status: activeProject?.id === FOUNDER_PROOF_PROJECT_ID ? "pass" : "warn",
        detail:
          activeProject?.id === FOUNDER_PROOF_PROJECT_ID
            ? `Auricrux context = ${activeProject.id}`
            : activeProject?.id
              ? `Active project is ${activeProject.id} — bind PRJ-BID-1`
              : "No active project for Auricrux context",
        count: activeProject?.id === FOUNDER_PROOF_PROJECT_ID ? 1 : 0,
      },
    }),
    [activeProject?.id, probe],
  );

  if (!founder) return null;

  return (
    <section
      style={{
        marginBottom: compact ? 16 : 24,
        padding: compact ? "18px 18px 16px" : "22px 22px 18px",
        border: `1px solid ${portalTokens.borderStrong}`,
        borderRadius: portalTokens.radiusLg,
        background: `linear-gradient(160deg, #f8fafc 0%, #ffffff 42%, #f1f5f9 100%)`,
        boxShadow: portalTokens.shadowSm,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 280px" }}>
          <div style={{ ...portalEyebrowStyle, color: portalTokens.primaryInk }}>Founder Proof Path</div>
          <h2 style={{ margin: "8px 0 6px", color: portalTokens.ink, fontSize: compact ? "1.25rem" : "1.45rem", letterSpacing: "-0.02em" }}>
            One live job spine
          </h2>
          <p style={{ margin: 0, color: portalTokens.body, lineHeight: 1.6, maxWidth: 560 }}>
            Login ? {FOUNDER_PROOF_PROJECT_ID} ({FOUNDER_PROOF_PROJECT_LABEL}) ? files ? takeoff ? RFI ? invoice ? Auricrux.
            Same ids end to end. No seeded theater.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={bindProofProject}
            disabled={binding || meta.backingSource === "loading"}
            style={{ ...portalButtonPrimary, border: "none", opacity: binding ? 0.7 : 1 }}
          >
            {binding ? "Binding…" : activeProject?.id === FOUNDER_PROOF_PROJECT_ID ? "Re-bind PRJ-BID-1" : "Bind PRJ-BID-1"}
          </button>
          <button type="button" onClick={refreshProbe} style={{ ...portalButtonSecondary, cursor: "pointer" }}>
            Refresh live status
          </button>
          {!compact ? (
            <a href={FOUNDER_PROOF_PATH} style={portalButtonSecondary}>
              Full proof page
            </a>
          ) : null}
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          padding: "10px 12px",
          borderRadius: portalTokens.radiusSm,
          background: portalTokens.panel,
          border: `1px solid ${portalTokens.border}`,
          color: portalTokens.body,
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        Active project:{" "}
        <strong style={{ color: portalTokens.ink }}>{activeProject?.id || "none"}</strong>
        {activeProject?.name ? ` · ${activeProject.name}` : ""}
        {" · "}
        API: {meta.backingSource}
        {bindError ? <span style={{ color: "#991b1b" }}> · {bindError}</span> : null}
        {probe.error ? <span style={{ color: "#991b1b" }}> · {probe.error}</span> : null}
      </div>

      <ol style={{ listStyle: "none", margin: "16px 0 0", padding: 0, display: "grid", gap: 10 }}>
        {STEPS.map((step, index) => {
          const status = stepStatus[step.id] || { status: "warn", detail: "Pending", count: 0 };
          const tone = statusTone(probe.loading ? "warn" : status.status);
          return (
            <li
              key={step.id}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 12,
                alignItems: "center",
                padding: "12px 14px",
                borderRadius: portalTokens.radiusMd,
                border: `1px solid ${tone.border}`,
                background: tone.bg,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: 12,
                  color: tone.color,
                  background: "#fff",
                  border: `1px solid ${tone.border}`,
                }}
              >
                {index + 1}
              </div>
              <div>
                <div style={{ fontWeight: 800, color: portalTokens.ink }}>{step.label}</div>
                <div style={{ color: portalTokens.body, fontSize: 13, lineHeight: 1.5, marginTop: 2 }}>
                  {step.detail}
                </div>
                <div style={{ color: tone.color, fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                  {probe.loading ? "Checking live API…" : status.detail}
                </div>
              </div>
              <a href={step.href} style={{ ...portalButtonSecondary, whiteSpace: "nowrap", fontSize: 13, padding: "8px 12px" }}>
                {step.actionLabel}
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
