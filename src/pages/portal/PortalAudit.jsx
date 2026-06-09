import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import SystemStateSummary from "../../components/SystemStateSummary";
import ProjectFileAuditPanel from "../../components/ProjectFileAuditPanel";
import ContinuityObjectsPanel from "../../components/ContinuityObjectsPanel";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import { portalFiles, portalContinuityObjects, projectAuditEvents } from "../../systemState";
import {
  completeQcPunch,
  createContinuityObjectWithFallback,
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

const inputStyle = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid #dbe3ef",
  padding: "10px 12px",
  fontSize: 14,
};

const buttonStyle = {
  border: "1px solid #2563eb",
  background: "#eff6ff",
  color: "#1d4ed8",
  borderRadius: 10,
  padding: "10px 12px",
  fontWeight: 700,
  cursor: "pointer",
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

function initialFormState(projectId) {
  return {
    type: "RFI",
    title: "",
    fileId: "",
    owner: "",
    nextAction: "",
    auditImpact: "",
    projectId,
  };
}

export default function PortalAudit() {
  const { state, refreshSyncStamp } = useWorkspaceState();
  const [continuityVersion, setContinuityVersion] = useState(0);
  const [formState, setFormState] = useState(() => initialFormState(state.project.id));
  const [creationMode, setCreationMode] = useState("none");

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

  function handleChange(event) {
    const { name, value } = event.target;
    setFormState((current) => ({
      ...current,
      [name]: value,
      projectId: state.project.id,
    }));
  }

  async function handleCreateContinuityObject(event) {
    event.preventDefault();
    const { mode } = await createContinuityObjectWithFallback({
      ...formState,
      projectId: state.project.id,
      owner: formState.owner || state.project.owner || "Project Coordinator",
      nextAction: formState.nextAction || "Review newly created continuity object",
      auditImpact: formState.auditImpact || "New continuity object entered into project audit posture.",
    });

    setCreationMode(mode);
    setContinuityVersion((current) => current + 1);
    setFormState(initialFormState(state.project.id));
    refreshSyncStamp(`Continuity object created through ${mode} persistence path`);
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
          <div><strong>Persistence path:</strong> {creationMode === "none" ? "No new continuity object created this session" : creationMode}</div>
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

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Create continuity object</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Enter a new RFI, change, or QC object into the active project spine</h2>
        <form onSubmit={handleCreateContinuityObject} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <select name="type" value={formState.type} onChange={handleChange} style={inputStyle}>
            <option value="RFI">RFI</option>
            <option value="Change Event">Change Event</option>
            <option value="Change Order">Change Order</option>
            <option value="QC / Punch">QC / Punch</option>
          </select>
          <input name="title" value={formState.title} onChange={handleChange} placeholder="Continuity object title" style={inputStyle} required />
          <input name="fileId" value={formState.fileId} onChange={handleChange} placeholder="Linked file ID (optional)" style={inputStyle} />
          <input name="owner" value={formState.owner} onChange={handleChange} placeholder="Owner" style={inputStyle} />
          <input name="nextAction" value={formState.nextAction} onChange={handleChange} placeholder="Next action" style={inputStyle} />
          <input name="auditImpact" value={formState.auditImpact} onChange={handleChange} placeholder="Audit impact" style={inputStyle} />
          <button type="submit" style={buttonStyle}>Create continuity object</button>
        </form>
      </div>

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
