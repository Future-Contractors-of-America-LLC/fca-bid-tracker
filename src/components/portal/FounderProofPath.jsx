import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FOUNDER_PROOF_PATH,
  FOUNDER_PROOF_PROJECT_ID,
  FOUNDER_PROOF_PROJECT_LABEL,
} from "../../config/productionMode";
import { isFounderSession } from "../../customerSession";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import { fetchWorkflowFiles, fetchProjectTakeoffs, fetchProjectRfis, mutateWorkflowFile } from "../../api/workflowClient";
import { fetchPortalInvoices, createPortalInvoice } from "../../api/portalClient";
import { fetchAuricruxActions, submitAuricruxAction } from "../../api/auricruxActionsClient";
import { createProjectRfi } from "../../api/constructionClient";
import { createTakeoffFromMarkup } from "../../api/designWorkspaceClient";
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
    detail: "PRJ-BID-1 must exist in /api/projects and be bound as active.",
    href: "/portal/projects",
    actionLabel: "Open projects",
  },
  {
    id: "files",
    label: "Files",
    detail: "Live /api/files for this project id — empty is OK, seeded is not.",
    href: "/portal/files",
    actionLabel: "Open files",
  },
  {
    id: "takeoff",
    label: "Takeoff",
    detail: "Live takeoffs endpoint for the same project id.",
    href: "/portal/design",
    actionLabel: "Open design",
  },
  {
    id: "rfi",
    label: "RFI",
    detail: "Live RFIs endpoint for the same project id.",
    href: "/portal/rfis",
    actionLabel: "Open RFIs",
  },
  {
    id: "invoice",
    label: "Invoice",
    detail: "Live billing invoices for this workspace.",
    href: "/portal/billing",
    actionLabel: "Open billing",
  },
  {
    id: "auricrux",
    label: "Auricrux",
    detail: "Live /api/auricrux/actions — not just a bound project id.",
    href: "/portal/auricrux",
    actionLabel: "Open Auricrux",
  },
];

const THEATER_SOURCES = /(seed|stub|smoke|fallback|localStorage|demo)/i;

function statusTone(status) {
  if (status === "live") return { color: "#166534", bg: "#f0fdf4", border: "#bbf7d0", label: "LIVE" };
  if (status === "empty") return { color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", label: "EMPTY" };
  if (status === "fail") return { color: "#991b1b", bg: "#fef2f2", border: "#fecaca", label: "DOWN" };
  return { color: portalTokens.muted, bg: portalTokens.surface, border: portalTokens.border, label: "…" };
}

function laneFromList(payload, projectId, noun) {
  if (payload?.error) {
    return { status: "fail", detail: payload.error, count: 0, source: "api-error" };
  }
  const source = payload?.backingSource || "api";
  if (THEATER_SOURCES.test(source)) {
    return {
      status: "fail",
      detail: `Theater source rejected: ${source}`,
      count: 0,
      source,
    };
  }
  const list = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload)
      ? payload
      : [];
  if (!list.length) {
    return {
      status: "empty",
      detail: `API reachable · 0 ${noun} on ${projectId} (create one to demo)`,
      count: 0,
      source,
    };
  }
  return {
    status: "live",
    detail: `API reachable · ${list.length} ${noun} on ${projectId}`,
    count: list.length,
    source,
  };
}

/**
 * Connectivity + honesty probe for the demo spine.
 * Green = live API with data. Blue = live API empty. Red = down or theater.
 * This does NOT prove sellable mutate end-to-end — only that lanes are real.
 */
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
    auricrux: null,
    error: "",
  });
  const [binding, setBinding] = useState(false);
  const [bindError, setBindError] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState("");

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
      auricrux: null,
      error: "",
    };
    try {
      const [filesPayload, takeoffsPayload, rfisPayload, invoicesPayload, auricruxPayload] = await Promise.all([
        fetchWorkflowFiles({ projectId }).catch((err) => ({ error: err.message })),
        fetchProjectTakeoffs(projectId).catch((err) => ({ error: err.message })),
        fetchProjectRfis(projectId).catch((err) => ({ error: err.message })),
        fetchPortalInvoices().catch((err) => ({ error: err.message })),
        fetchAuricruxActions().catch((err) => ({ error: err.message })),
      ]);

      if (meta.backingSource === "api-error") {
        next.project = {
          status: "fail",
          detail: meta.loadError || "Projects API unavailable",
          count: 0,
          source: "api-error",
        };
      } else if (THEATER_SOURCES.test(meta.backingSource || "")) {
        next.project = {
          status: "fail",
          detail: `Theater source rejected: ${meta.backingSource}`,
          count: 0,
          source: meta.backingSource,
        };
      } else if (liveProject) {
        next.project = {
          status: activeProject?.id === FOUNDER_PROOF_PROJECT_ID ? "live" : "empty",
          detail:
            activeProject?.id === FOUNDER_PROOF_PROJECT_ID
              ? `${liveProject.id} | ${liveProject.name || FOUNDER_PROOF_PROJECT_LABEL} bound`
              : `${liveProject.id} exists — click Bind to activate`,
          count: 1,
          source: meta.backingSource || "api",
        };
      } else {
        next.project = {
          status: "fail",
          detail: "PRJ-BID-1 not returned by /api/projects — cannot demo without a live project root",
          count: 0,
          source: meta.backingSource || "api",
        };
      }

      next.files = laneFromList(filesPayload, projectId, "file(s)");
      next.takeoffs = laneFromList(takeoffsPayload, projectId, "takeoff(s)");
      next.rfis = laneFromList(rfisPayload, projectId, "RFI(s)");
      next.invoices = laneFromList(invoicesPayload, "workspace", "invoice(s)");

      if (auricruxPayload?.error) {
        next.auricrux = { status: "fail", detail: auricruxPayload.error, count: 0, source: "api-error" };
      } else if (THEATER_SOURCES.test(auricruxPayload?.backingSource || "")) {
        next.auricrux = {
          status: "fail",
          detail: `Theater source rejected: ${auricruxPayload.backingSource}`,
          count: 0,
          source: auricruxPayload.backingSource,
        };
      } else {
        const actions = Array.isArray(auricruxPayload?.items) ? auricruxPayload.items : [];
        next.auricrux = {
          status: actions.length ? "live" : "empty",
          detail: actions.length
            ? `Auricrux API reachable · ${actions.length} action(s)`
            : "Auricrux API reachable · 0 actions (empty is honest)",
          count: actions.length,
          source: auricruxPayload?.backingSource || "api",
        };
      }
    } catch (err) {
      next.error = err?.message || "Unable to probe live proof spine.";
    }
    setProbe(next);
  }, [activeProject?.id, liveProject, meta.backingSource, meta.loadError]);

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

  async function seedDemoRecords() {
    setSeeding(true);
    setSeedNotice("");
    setBindError("");
    const projectId = FOUNDER_PROOF_PROJECT_ID;
    const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
    const results = [];
    try {
      if (activeProject?.id !== projectId) {
        await selectActiveProject(projectId, `Demo seed bound ${projectId}.`);
      }

      try {
        await mutateWorkflowFile("create-file-record", {
          projectId,
          name: `Demo Spec Sheet ${stamp}.pdf`,
          category: "Document",
          discipline: "Document Control",
          owner: "Demo Operator",
          linkedEvidenceTarget: `${projectId} demo evidence`,
          detail: `Demo file created for ${projectId}`,
          status: "Registered",
          evidenceStatus: "Pending review",
          actionLabel: "Review",
        });
        results.push("file");
      } catch (err) {
        results.push(`file FAILED: ${err.message}`);
      }

      try {
        await createTakeoffFromMarkup(projectId, {
          description: `Demo takeoff ${stamp}`,
          quantity: 1,
          unit: "LS",
          sourceRoute: "/portal/proof",
        });
        results.push("takeoff");
      } catch (err) {
        results.push(`takeoff FAILED: ${err.message}`);
      }

      try {
        await createProjectRfi(projectId, {
          question: `Demo RFI ${stamp}: Confirm ceiling height at grid B-4.`,
          sourceRoute: "/portal/proof",
        });
        results.push("rfi");
      } catch (err) {
        results.push(`rfi FAILED: ${err.message}`);
      }

      try {
        await createPortalInvoice({
          invoiceName: `Demo Invoice ${stamp}`,
          amount: "2500.00",
          note: `Demo billing for ${projectId}`,
          projectId,
        });
        results.push("invoice");
      } catch (err) {
        results.push(`invoice FAILED: ${err.message}`);
      }

      try {
        await submitAuricruxAction({
          mode: "recommend",
          capabilityId: "demo-spine-next-action",
          targetObjectType: "Project",
          targetObjectId: projectId,
          rationale: `Advise next demo step for ${projectId} after seeding file, takeoff, RFI, and invoice.`,
          sourceRoute: "/portal/proof",
        });
        results.push("auricrux");
      } catch (err) {
        results.push(`auricrux FAILED: ${err.message}`);
      }

      setSeedNotice(results.join(" · "));
      await reloadProjects();
      await refreshProbe();
    } catch (err) {
      setBindError(err?.message || "Demo seed failed.");
    } finally {
      setSeeding(false);
    }
  }

  const stepStatus = useMemo(
    () => ({
      project: probe.project,
      files: probe.files,
      takeoff: probe.takeoffs,
      rfi: probe.rfis,
      invoice: probe.invoices,
      auricrux: probe.auricrux,
    }),
    [probe],
  );

  const overall = useMemo(() => {
    const lanes = Object.values(stepStatus).filter(Boolean);
    if (probe.loading || lanes.length < 6) {
      return { status: "pending", title: "Checking live APIs…", detail: "Not a product score — connectivity only." };
    }
    const down = lanes.filter((lane) => lane.status === "fail");
    const live = lanes.filter((lane) => lane.status === "live");
    const empty = lanes.filter((lane) => lane.status === "empty");
    if (down.length) {
      return {
        status: "fail",
        title: "Not demo-ready",
        detail: `${down.length} lane(s) down or theater. Do not show this to a customer until red is gone.`,
      };
    }
    if (live.length === 0) {
      return {
        status: "empty",
        title: "APIs reachable · no job data yet",
        detail: "Connectivity works. Create files/RFIs/invoices on PRJ-BID-1 before a sales walkthrough.",
      };
    }
    return {
      status: "live",
      title: "Spine reachable",
      detail: `${live.length} lane(s) with data · ${empty.length} empty. This is connectivity — not “product 100%.” Mutate still has to work in the walk.`,
    };
  }, [probe.loading, stepStatus]);

  if (!founder) return null;

  const overallTone = statusTone(overall.status === "pending" ? "warn" : overall.status);

  return (
    <section
      style={{
        marginBottom: compact ? 16 : 24,
        padding: compact ? "18px 18px 16px" : "22px 22px 18px",
        border: `1px solid ${overallTone.border}`,
        borderRadius: portalTokens.radiusLg,
        background: overallTone.bg,
        boxShadow: portalTokens.shadowSm,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 280px" }}>
          <div style={{ ...portalEyebrowStyle, color: overallTone.color }}>Demo spine · honesty check</div>
          <h2 style={{ margin: "8px 0 6px", color: portalTokens.ink, fontSize: compact ? "1.25rem" : "1.45rem", letterSpacing: "-0.02em" }}>
            {overall.title}
          </h2>
          <p style={{ margin: 0, color: portalTokens.body, lineHeight: 1.6, maxWidth: 640 }}>
            {overall.detail}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={bindProofProject}
            disabled={binding || seeding || meta.backingSource === "loading"}
            style={{ ...portalButtonPrimary, border: "none", opacity: binding ? 0.7 : 1 }}
          >
            {binding ? "Binding..." : activeProject?.id === FOUNDER_PROOF_PROJECT_ID ? "Re-bind PRJ-BID-1" : "Bind PRJ-BID-1"}
          </button>
          <button
            type="button"
            onClick={seedDemoRecords}
            disabled={seeding || binding}
            style={{ ...portalButtonPrimary, border: "none", background: "#0f172a", opacity: seeding ? 0.7 : 1 }}
          >
            {seeding ? "Creating demo records..." : "Create demo records"}
          </button>
          <button type="button" onClick={refreshProbe} style={{ ...portalButtonSecondary, cursor: "pointer" }}>
            Re-check APIs
          </button>
          {!compact ? (
            <a href={FOUNDER_PROOF_PATH} style={portalButtonSecondary}>
              Full proof page
            </a>
          ) : null}
        </div>
      </div>

      {seedNotice ? (
        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: portalTokens.radiusSm,
            background: seedNotice.includes("FAILED") ? "#fef2f2" : "#f0fdf4",
            border: `1px solid ${seedNotice.includes("FAILED") ? "#fecaca" : "#bbf7d0"}`,
            color: seedNotice.includes("FAILED") ? "#991b1b" : "#166534",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          Seed result: {seedNotice}
        </div>
      ) : null}

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
        Active:{" "}
        <strong style={{ color: portalTokens.ink }}>{activeProject?.id || "none"}</strong>
        {activeProject?.name ? ` · ${activeProject.name}` : ""}
        {" · Projects API: "}
        {meta.backingSource}
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
                background: "#fff",
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
                  fontSize: 11,
                  color: tone.color,
                  background: tone.bg,
                  border: `1px solid ${tone.border}`,
                }}
              >
                {probe.loading ? index + 1 : tone.label}
              </div>
              <div>
                <div style={{ fontWeight: 800, color: portalTokens.ink }}>{step.label}</div>
                <div style={{ color: portalTokens.body, fontSize: 13, lineHeight: 1.5, marginTop: 2 }}>
                  {step.detail}
                </div>
                <div style={{ color: tone.color, fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                  {probe.loading ? "Checking live API..." : status.detail}
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
