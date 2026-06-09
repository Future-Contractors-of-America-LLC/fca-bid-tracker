import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import SystemStateSummary from "../../components/SystemStateSummary";
import ProjectFileAuditPanel from "../../components/ProjectFileAuditPanel";
import ContinuityObjectsPanel from "../../components/ContinuityObjectsPanel";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import { portalFiles, portalContinuityObjects, projectAuditEvents } from "../../systemState";
import {
  completeQcPunch,
  markContinuityObjectBillingReady,
  readContinuityObjectsForProject,
} from "../../continuityObjectStore";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const auditRouteOverlay = {
  title: "Audit route state",
  summary: "Audit specializes the shared state around accountable execution, file evidence continuity, and Auricrux traceability.",
  status: "Audit state active",
  primaryFocus: "Timeline and correction continuity",
  primaryDetail: "This route keeps project history, evidence linkage, Auricrux actions, and continuity objects connected to the same active project root.",
  dependency: "Project, file, and continuity-object linkage",
  dependencyDetail: "Audit depends on active project context, file/evidence linkage, and continuity objects remaining stable across routes.",
  auricruxRole: "Record and explain",
  auricruxDetail: "Auricrux uses this route to explain what changed, why it changed, what object is blocked, and what should happen next.",
};

function buildEventTypeSummary(events) {
  const counts = events.reduce((acc, event) => {
    const key = event.eventType || "unspecified";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts);
}

function scopeFilesToProject(files, project) {
  const projectId = project?.id || "PRJ-A117";
  const projectSuffix = projectId.replace(/^PRJ-/, "");

  return files
    .filter((file) => (file.projectId || file.ownerObjectId || "PRJ-A117") === projectId)
    .map((file, index) => ({
      ...file,
      fileId: file.fileId || `${projectId}-FILE-${index + 1}`,
      ownerObjectType: "Project",
      ownerObjectId: projectId,
      projectId,
      linkedEvidenceTarget: file.linkedEvidenceTarget || `${projectId} continuity record`,
      name: file.name.replace(/A117/g, projectSuffix),
      note: `${file.note} Active project context: ${projectId}.`,
    }));
}

function scopeAuditEventsToProject(events, project) {
  const projectId = project?.id || "PRJ-A117";
  return events.map((event) => ({
    ...event,
    detail: event.detail.replace(/PRJ-A117/g, projectId),
    reason: event.reason?.replace(/PRJ-A117/g, projectId),
  }));
}

function scopeContinuityObjectsToProject(items, project) {
  const projectId = project?.id || "PRJ-A117";
  const seeded = items.filter((item) => item.projectId === projectId);
  const stored = readContinuityObjectsForProject(projectId);
  return stored.length ? stored : seeded;
}

function buildGeneratedAuditEvents(items = []) {
  return items
    .flatMap((item) =>
      (item.actionHistory || []).slice(0, 2).map((entry) => ({
        time: new Date(entry.at).toLocaleString(),
        eventType: "continuity-object-updated",
        actorType: "auricrux",
        targetObjectType: item.type,
        action: `${item.id} · ${entry.label}`,
        detail: entry.detail,
        reason: item.auditImpact,
        discipline: item.type,
      }))
    )
    .slice(0, 8);
}

export default function PortalAudit() {
  const { state, refreshSyncStamp } = useWorkspaceState();
  const [continuityVersion, setContinuityVersion] = useState(0);

  useEffect(() => {
    refreshSyncStamp(`Audit route synchronized to ${state.project.id}`);
  }, [refreshSyncStamp, state.project.id]);

  const scopedFiles = useMemo(() => scopeFilesToProject(portalFiles, state.project), [state.project]);
  const scopedContinuityObjects = useMemo(
    () => scopeContinuityObjectsToProject(portalContinuityObjects, state.project),
    [continuityVersion, state.project]
  );
  const generatedAuditEvents = useMemo(
    () => buildGeneratedAuditEvents(scopedContinuityObjects),
    [scopedContinuityObjects]
  );
  const scopedAuditEvents = useMemo(
    () => [...generatedAuditEvents, ...scopeAuditEventsToProject(projectAuditEvents, state.project)],
    [generatedAuditEvents, state.project]
  );
  const auditSummary = useMemo(() => buildEventTypeSummary(scopedAuditEvents), [scopedAuditEvents]);

  function handleMarkBillingReady(objectId) {
    markContinuityObjectBillingReady(objectId);
    setContinuityVersion((current) => current + 1);
    refreshSyncStamp(`Continuity object ${objectId} linked to billing continuity`);
  }

  function handleCompletePunch(objectId) {
    completeQcPunch(objectId);
    setContinuityVersion((current) => current + 1);
    refreshSyncStamp(`Continuity object ${objectId} moved to closeout continuity`);
  }

  return (
    <PortalShell
      title="Audit Timeline and Auricrux Record"
      subtitle="Continuity surface showing project-linked file movement, accountable workflow mutations, continuity objects, and Auricrux operating history under one project spine."
      activeHref="/portal/audit"
      currentJourney="coordination"
      routeOverlay={auditRouteOverlay}
      primaryHref="/portal/projects"
      primaryLabel="Open Project Flow"
      workspaceState={state}
    >
      <div style={{ marginBottom: 16 }}>
        <SystemStateSummary
          tenant={state.tenant}
          project={state.project}
          workspace={state.workspace}
          auricrux={state.auricrux}
          title="Audit visibility now reads from the active project workspace"
          detail="Project-linked file movement, continuity objects, route actions, and Auricrux traces now resolve against the same project context used by Projects and Files."
        />
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Active audit scope</div>
        <div style={{ color: "#334155", lineHeight: 1.8 }}>
          <div><strong>Project root:</strong> {state.project.id}</div>
          <div><strong>Project name:</strong> {state.project.name}</div>
          <div><strong>Current stage:</strong> {state.project.stage}</div>
          <div><strong>Next action:</strong> {state.workspace.currentNextAction}</div>
          <div><strong>Audit status:</strong> {state.project.auditStatus}</div>
          <div><strong>Continuity objects:</strong> {scopedContinuityObjects.length}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 16 }}>
        {auditSummary.map(([eventType, count]) => (
          <div key={eventType} style={cardStyle}>
            <div style={{ color: "#64748b", fontWeight: 700, fontSize: 12, textTransform: "uppercase", marginBottom: 8 }}>{eventType}</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>{count}</div>
            <div style={{ color: "#475569", lineHeight: 1.6 }}>Visible continuity records for the active project spine.</div>
          </div>
        ))}
      </div>

      <ProjectFileAuditPanel project={state.project} files={scopedFiles} auditEvents={scopedAuditEvents} />

      <div style={{ marginTop: 24 }}>
        <ContinuityObjectsPanel
          project={state.project}
          items={scopedContinuityObjects}
          onMarkBillingReady={handleMarkBillingReady}
          onCompletePunch={handleCompletePunch}
        />
      </div>
    </PortalShell>
  );
}
