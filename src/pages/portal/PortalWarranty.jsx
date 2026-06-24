import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { advanceWarrantyCase, createWarrantyCase, fetchWarrantyCases } from "../../api/constructionClient";
import { fetchWarrantyContinuity } from "../../api/warrantyIntakeClient";
import { routeStateOverlays } from "../../systemState";
import { buildWarrantyContinuityHints } from "../../utils/warrantyContinuityHints";
import { isWarrantyOverdue, warrantySlaLabel } from "../../utils/warrantySla";
import {
  PortalAlert,
  PortalLoadingState,
  PortalPageIntro,
  PortalStatusBadge,
} from "../../components/portal/PortalPrimitives";
import { portalButtonPrimary, portalCardStyle, portalInputStyle } from "../../portalDesignTokens";

export default function PortalWarranty() {
  const { projectId, hasProject } = usePortalProjectId();
  const [items, setItems] = useState([]);
  const [continuity, setContinuity] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [draft, setDraft] = useState({ title: "", description: "", severity: "standard" });

  async function reload() {
    setLoading(true);
    setError("");
    try {
      const [casesPayload, continuityPayload] = await Promise.all([
        fetchWarrantyCases(projectId),
        fetchWarrantyContinuity(projectId).catch(() => null),
      ]);
      setItems(casesPayload.items || []);
      setContinuity(continuityPayload?.continuity || continuityPayload || null);
    } catch (err) {
      setError(err.message || "Unable to load warranty cases.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, [projectId]);

  const hints = useMemo(() => buildWarrantyContinuityHints(continuity || {}), [continuity]);

  async function handleCreate(event) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    setNotice("");
    setError("");
    try {
      await createWarrantyCase({
        projectId,
        title: draft.title.trim(),
        description: draft.description.trim() || "Warranty issue logged from portal.",
        severity: draft.severity,
      });
      setDraft({ title: "", description: "", severity: "standard" });
      setNotice("Warranty case created with governed SLA.");
      await reload();
    } catch (err) {
      setError(err.message || "Unable to create warranty case.");
    }
  }

  async function handleAdvance(warrantyCase) {
    setBusyId(warrantyCase.warrantyCaseId);
    setNotice("");
    setError("");
    try {
      await advanceWarrantyCase({
        warrantyCaseId: warrantyCase.warrantyCaseId,
        status: warrantyCase.status === "open" ? "in_progress" : "resolved",
        nextAction: warrantyCase.status === "open" ? "Dispatch service crew." : "Close case and archive turnover notes.",
      });
      setNotice(`Warranty case ${warrantyCase.warrantyCaseId} advanced.`);
      await reload();
    } catch (err) {
      setError(err.message || "Unable to advance warranty case.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <PortalShell
      title="Warranty & Service Continuity"
      subtitle="Live warranty cases with SLA tracking, closeout continuity, and support escalation."
      activeHref="/portal/warranty"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.projects}
      primaryHref="/portal/closeout"
      primaryLabel="Closeout packages"
    >
      <PortalPageIntro
        eyebrow="Service continuity"
        title={`Warranty lane for project ${projectId}`}
        detail="FCA is the service rail - intake, SLA, closeout linkage, and support escalation stay on governed surfaces."
        actions={(
          <>
            <a href="/warranty" style={portalButtonPrimary}>Public warranty intake</a>
            <a href="/portal/support" style={portalButtonPrimary}>Open support</a>
          </>
        )}
      />

      <AuricruxInsightPanel
        title="Auricrux Warranty Intelligence"
        targetObjectId={projectId}
        nextAction="Resolve warranty cases only after closeout artifacts are complete and turnover walkthrough is scheduled."
        actionHref="/portal/closeout"
        actionLabel="Review closeout"
        tone="blue"
      />

      {hints.map((hint) => (
        <PortalAlert key={`${hint.kind}-${hint.actionHref}`} tone={hint.kind === "sla-breach" ? "warn" : "info"}>
          {hint.message}{" "}
          <a href={hint.actionHref}>Open next step</a>
        </PortalAlert>
      ))}

      <form onSubmit={handleCreate} style={{ ...portalCardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Log warranty case</h2>
        <label style={{ fontWeight: 600, fontSize: 14 }}>Title</label>
        <input style={portalInputStyle} value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="Lobby finish touch-up" />
        <label style={{ fontWeight: 600, fontSize: 14 }}>Description</label>
        <input style={portalInputStyle} value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} placeholder="Customer-reported issue details" />
        <label style={{ fontWeight: 600, fontSize: 14 }}>Severity</label>
        <select style={portalInputStyle} value={draft.severity} onChange={(e) => setDraft((d) => ({ ...d, severity: e.target.value }))}>
          <option value="urgent">Urgent (24h)</option>
          <option value="standard">Standard (72h)</option>
          <option value="low">Low (7d)</option>
        </select>
        <button type="submit" style={{ ...portalButtonPrimary, border: "none", cursor: "pointer", marginTop: 8 }}>Create case</button>
      </form>

      {notice ? <PortalAlert tone="success">{notice}</PortalAlert> : null}
      {error ? <PortalAlert tone="error">{error}</PortalAlert> : null}
      {loading ? <PortalLoadingState label="Loading warranty cases..." /> : null}

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {items.map((item) => (
          <div key={item.warrantyCaseId} style={portalCardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <strong>{item.title || item.warrantyCaseId}</strong>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <PortalStatusBadge status={item.status || "open"} />
                <PortalStatusBadge status={isWarrantyOverdue(item.dueAt, item.status) ? "Past SLA" : item.severity || "standard"} />
              </div>
            </div>
            <div style={{ color: "#475569", marginTop: 8, lineHeight: 1.7 }}>{item.description}</div>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>
              {warrantySlaLabel({ severity: item.severity, dueAt: item.dueAt, status: item.status })} · Project {item.projectId || projectId}
            </div>
            {item.status !== "resolved" ? (
              <button type="button" style={{ ...portalButtonPrimary, border: "none", marginTop: 12, cursor: "pointer" }} disabled={busyId === item.warrantyCaseId} onClick={() => handleAdvance(item)}>
                {busyId === item.warrantyCaseId ? "Updating..." : item.status === "open" ? "Start service" : "Resolve case"}
              </button>
            ) : null}
          </div>
        ))}
        {!loading && !items.length ? (
          <div style={portalCardStyle}>No warranty cases for {projectId} yet. Use public intake at /warranty or log a case above.</div>
        ) : null}
      </div>
    </PortalShell>
  );
}
