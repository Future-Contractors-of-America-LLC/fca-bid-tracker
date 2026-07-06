import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import {
  PortalEntityTable,
  PortalPageIntro,
  PortalQuickStats,
  PortalStatusBadge,
} from "../../components/portal/PortalPrimitives";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { portalButtonSecondary, portalCardStyle, portalTokens } from "../../portalDesignTokens";
import { routeStateOverlays } from "../../systemState";
import {
  getPersonaManifests,
  getTriadCommandMetrics,
  listTriadEvents,
  listTriadHandoffs,
  listTriadJobs,
  replayTriadScenario,
  subscribeTriadEvents,
} from "../../triadFlywheel";
import { probeCommandTowerCapability } from "../../api/moduleCapabilityClient";

function formatUsd(value) {
  const amount = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `$${Math.round(amount).toLocaleString()}`;
}

export default function PortalCommandTower() {
  const [jobs, setJobs] = useState(() => listTriadJobs());
  const [events, setEvents] = useState(() => listTriadEvents(30));
  const [handoffs, setHandoffs] = useState(() => listTriadHandoffs(20));
  const [notice, setNotice] = useState("");
  const [apiSpineStatus, setApiSpineStatus] = useState("checking");

  useEffect(() => {
    setJobs(listTriadJobs());
    setEvents(listTriadEvents(30));
    setHandoffs(listTriadHandoffs(20));
    return subscribeTriadEvents(() => {
      setJobs(listTriadJobs());
      setEvents(listTriadEvents(30));
      setHandoffs(listTriadHandoffs(20));
    });
  }, []);

  useEffect(() => {
    let active = true;
    probeCommandTowerCapability()
      .then((probe) => {
        if (!active) return;
        setApiSpineStatus(probe.ok ? "connected" : "offline");
      })
      .catch(() => {
        if (active) setApiSpineStatus("offline");
      });
    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => getTriadCommandMetrics(), [jobs, events]);
  const personaManifests = useMemo(() => getPersonaManifests(), [events]);

  async function runReplay(kind) {
    const result = await replayTriadScenario(kind);
    if (!result?.ok) {
      setNotice(result?.message || "Replay failed.");
      return;
    }
    setNotice(`Replay executed: ${kind}`);
    setJobs(listTriadJobs());
    setEvents(listTriadEvents(30));
    setHandoffs(listTriadHandoffs(20));
  }

  return (
    <PortalShell
      title="Auricrux Command Tower"
      subtitle="Pilot Triad command surface for pipeline health, project velocity, and cash-flow status."
      activeHref="/portal/command-tower"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.platform}
      primaryHref="/portal/platform"
      primaryLabel="Open full platform dashboard"
    >
      <AuricruxInsightPanel
        title="Auricrux Command Guidance"
        targetObjectId="triad-command-tower"
        sourceRoute="/portal/command-tower"
        rationale="Command operations should prioritize risk-containment and continuity for pipeline, project, and finance loops."
        nextAction="Review unresolved decision queue items before replaying new flywheel scenarios."
        actionHref="/portal/decision-queue"
        actionLabel="Open Decision Queue"
        tone="blue"
        liveRecommend
      />

      <PortalPageIntro
        eyebrow="Phase 2 Pilot"
        title="Revenue flywheel command surface"
        detail={`This tower monitors the Lead -> Project -> Billing autonomous loop and its constitutional gate outcomes in real time. API spine: ${apiSpineStatus}.`}
      />

      <PortalQuickStats
        items={[
          {
            label: "Pipeline Health",
            value: `${metrics.pipelineHealth.percentInMotion}%`,
            hint: `${metrics.pipelineHealth.inMotion}/${metrics.pipelineHealth.totalJobs} jobs in motion`,
          },
          {
            label: "Project Velocity",
            value: `${metrics.projectVelocity.percentOnTrack}%`,
            hint: `${metrics.projectVelocity.onTrack} on track / ${metrics.projectVelocity.atRisk} at risk`,
          },
          {
            label: "Billed",
            value: formatUsd(metrics.cashFlow.billedUsd),
            hint: "Pay-app drafts and ready invoices",
          },
          {
            label: "Collected",
            value: formatUsd(metrics.cashFlow.collectedUsd),
            hint: `Outstanding ${formatUsd(metrics.cashFlow.outstandingUsd)}`,
          },
        ]}
      />

      {notice ? <div style={{ ...portalCardStyle, marginTop: 14, color: "#065f46" }}>{notice}</div> : null}

      <div style={{ ...portalCardStyle, marginTop: 14 }}>
        <h3 style={{ marginTop: 0 }}>Replay Panel</h3>
        <div style={{ color: portalTokens.body, marginBottom: 10 }}>
          Simulate golden handoff events for executive demo and regression confidence.
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" style={portalButtonSecondary} onClick={() => runReplay("lead-won")}>Replay Lead Won</button>
          <button type="button" style={portalButtonSecondary} onClick={() => runReplay("milestone")}>Replay Milestone</button>
          <button type="button" style={portalButtonSecondary} onClick={() => runReplay("safety-incident")}>Replay Safety Incident</button>
          <a href="/portal/decision-queue" style={{ ...portalButtonSecondary, textDecoration: "none" }}>Open Decision Queue</a>
        </div>
      </div>

      <div style={{ ...portalCardStyle, marginTop: 14 }}>
        <h3 style={{ marginTop: 0 }}>Persona Manifests</h3>
        <PortalEntityTable
          columns={[
            { key: "title", label: "Persona" },
            { key: "summary", label: "Instruction" },
            { key: "weights", label: "Weights" },
          ]}
          rows={Object.values(personaManifests || {}).map((persona) => ({
            id: persona.id,
            title: persona.title,
            summary: persona.instructions,
            weights: Object.entries(persona.weights || {}).map(([k, v]) => `${k}:${v}`).join(" | "),
          }))}
          emptyTitle="No persona manifests"
          emptyDetail="Phase 3 persona instructions are emitted from the triad flywheel state."
        />
      </div>

      <div style={{ ...portalCardStyle, marginTop: 14 }}>
        <h3 style={{ marginTop: 0 }}>Triad jobs</h3>
        <PortalEntityTable
          columns={[
            { key: "projectId", label: "Project" },
            { key: "lead", label: "Lead", render: (row) => <strong>{row.lead.company}</strong> },
            { key: "persona", label: "Persona", render: (row) => row.project.aiPersona || "Field Guardian" },
            { key: "critical", label: "Critical Path", render: (row) => <PortalStatusBadge status={row.project.criticalPathStatus || "On Track"} active={row.project.criticalPathStatus === "At Risk"} /> },
            { key: "billed", label: "Billed", render: (row) => formatUsd(row.finance.billedUsd || 0) },
            { key: "collected", label: "Collected", render: (row) => formatUsd(row.finance.collectedUsd || 0) },
            {
              key: "actions",
              label: "",
              render: (row) => (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <a href="/portal/leads" style={{ ...portalButtonSecondary, textDecoration: "none" }}>Leads</a>
                  <a href={`/portal/field-tasks?projectId=${encodeURIComponent(row.project.projectId)}`} style={{ ...portalButtonSecondary, textDecoration: "none" }}>Field</a>
                  <a href="/portal/finance" style={{ ...portalButtonSecondary, textDecoration: "none" }}>Finance</a>
                </div>
              ),
            },
          ]}
          rows={jobs.map((job) => ({
            id: job.project.projectId,
            projectId: job.project.projectId,
            lead: job.lead,
            project: job.project,
            finance: job.finance,
          }))}
          emptyTitle="No pilot-triad jobs yet"
          emptyDetail="Mark a lead as Won from the Leads module to initialize the autonomous flywheel."
          emptyPrimaryHref="/portal/leads"
          emptyPrimaryLabel="Open leads"
        />
      </div>

      <div style={{ ...portalCardStyle, marginTop: 14 }}>
        <h3 style={{ marginTop: 0 }}>State-bus event stream</h3>
        <PortalEntityTable
          columns={[
            { key: "timestamp", label: "Time" },
            { key: "type", label: "Event Type" },
            {
              key: "projectId",
              label: "Project",
              render: (row) => row.payload?.projectId || "-",
            },
            {
              key: "summary",
              label: "Summary",
              render: (row) => (
                <span style={{ color: portalTokens.body }}>
                  {row.payload?.reason || row.payload?.action || row.payload?.taskName || row.payload?.persona || "State transition captured."}
                </span>
              ),
            },
          ]}
          rows={events.map((eventRow) => ({
            id: eventRow.id,
            timestamp: eventRow.timestamp,
            type: eventRow.type,
            payload: eventRow.payload || {},
          }))}
          emptyTitle="No events"
          emptyDetail="State-bus handoffs appear here when triad modules execute autonomous transitions."
          emptyPrimaryHref="/portal/leads"
          emptyPrimaryLabel="Trigger pilot event"
        />
      </div>

      <div style={{ ...portalCardStyle, marginTop: 14 }}>
        <h3 style={{ marginTop: 0 }}>Cross-Persona Handoffs</h3>
        <PortalEntityTable
          columns={[
            { key: "timestamp", label: "Time" },
            { key: "stage", label: "Handoff Stage" },
            { key: "projectId", label: "Project", render: (row) => row.payload?.projectId || "-" },
            { key: "signal", label: "Signal", render: (row) => row.payload?.signal || row.payload?.leadId || "-" },
          ]}
          rows={handoffs.map((row) => ({
            id: row.id,
            timestamp: row.timestamp,
            stage: row.stage,
            payload: row.payload || {},
          }))}
          emptyTitle="No handoffs"
          emptyDetail="Cross-persona handoff hooks appear after replay or live events."
        />
      </div>
    </PortalShell>
  );
}
