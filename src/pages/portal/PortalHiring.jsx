import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import PortalApiStatusBanner from "../../components/portal/PortalApiStatusBanner";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import {
  PortalAlert,
  PortalEntityTable,
  PortalPageIntro,
  PortalQuickStats,
  PortalStatusBadge,
} from "../../components/portal/PortalPrimitives";
import { portalButtonPrimary, portalButtonSecondary, portalCardStyle, portalEyebrowStyle, portalInputStyle, portalTokens } from "../../portalDesignTokens";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import { fetchFieldSchedule, fetchFieldTasks } from "../../api/fieldOpsClient";
import { fetchWorkflowProjects } from "../../api/workflowClient";
import { fetchAcademyLms } from "../../api/academyClient";
import { fetchPortalMessages, sendPortalMessage } from "../../api/portalClient";
import { createPortalLead } from "../../api/portalLeadsClient";
import { adminGovernance } from "../../adminGovernance";
import { routeStateOverlays } from "../../systemState";

const HIRING_RUNTIME_KEY = "fca_hiring_runtime_v1";

const seedCandidates = [
  {
    id: "CAND-001",
    name: "Jordan Alvarez",
    persona: "Foreman",
    source: "academy-graduate",
    employer: "Summit Industrial Group",
    certifications: ["OSHA 30", "Advanced Field Safety Leadership", "Daily Log Mastery", "Forklift Operator"],
    fcaSystemProficiency: "Advanced",
    equipmentHours: 1230,
    availability: "ready",
    culturalFit: 86,
    skillFit: 90,
    retentionLikelihood: 88,
    internal: false,
  },
  {
    id: "CAND-002",
    name: "Nina Carter",
    persona: "Project Engineer",
    source: "academy-apprenticeship",
    employer: "FCA Internal Apprentices",
    certifications: ["OSHA 10", "Advanced BIM Coordination", "Field Reporting Basics", "Change Order Governance"],
    fcaSystemProficiency: "Intermediate",
    equipmentHours: 410,
    availability: "ready",
    culturalFit: 80,
    skillFit: 84,
    retentionLikelihood: 82,
    internal: true,
  },
  {
    id: "CAND-003",
    name: "Elias Moore",
    persona: "Equipment Operator",
    source: "job-board",
    employer: "Moore Siteworks",
    certifications: ["OSHA 10", "Excavator Operator", "Skid Steer Operator"],
    fcaSystemProficiency: "Foundational",
    equipmentHours: 980,
    availability: "idle",
    culturalFit: 72,
    skillFit: 76,
    retentionLikelihood: 70,
    internal: false,
  },
  {
    id: "CAND-004",
    name: "Avery Bennett",
    persona: "Assistant Superintendent",
    source: "academy-leadership",
    employer: "FCA Internal Apprentices",
    certifications: ["OSHA 30", "Crew Productivity Management", "Critical Path Recovery", "Advanced Field Safety Leadership"],
    fcaSystemProficiency: "Advanced",
    equipmentHours: 660,
    availability: "ready",
    culturalFit: 91,
    skillFit: 89,
    retentionLikelihood: 90,
    internal: true,
  },
];

const requirementMap = [
  { token: "safety", cert: "Advanced Field Safety Leadership" },
  { token: "rfi", cert: "Field Reporting Basics" },
  { token: "schedule", cert: "Critical Path Recovery" },
  { token: "change order", cert: "Change Order Governance" },
  { token: "bim", cert: "Advanced BIM Coordination" },
  { token: "log", cert: "Daily Log Mastery" },
  { token: "equipment", cert: "Forklift Operator" },
  { token: "excavation", cert: "Excavator Operator" },
  { token: "supervision", cert: "Advanced Field Safety Leadership" },
];

function normalize(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatUsd(value) {
  return `$${Math.round(toNumber(value)).toLocaleString()}`;
}

function readRuntimeState() {
  if (typeof window === "undefined") return { hired: [], orchestrationLog: [], laborLending: [] };
  try {
    const raw = window.localStorage.getItem(HIRING_RUNTIME_KEY);
    return raw ? JSON.parse(raw) : { hired: [], orchestrationLog: [], laborLending: [] };
  } catch {
    return { hired: [], orchestrationLog: [], laborLending: [] };
  }
}

function writeRuntimeState(value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HIRING_RUNTIME_KEY, JSON.stringify(value));
  } catch {
    // best effort persistence only
  }
}

function sentimentFromMessages(items = []) {
  const positiveTokens = ["thanks", "approved", "great", "resolved", "win", "excellent", "good"];
  const negativeTokens = ["blocked", "issue", "delay", "escalate", "unhappy", "concern", "late"];
  let positive = 0;
  let negative = 0;

  for (const row of items.slice(0, 60)) {
    const text = normalize(`${row.subject || ""} ${row.message || ""} ${row.preview || ""}`);
    if (positiveTokens.some((token) => text.includes(token))) positive += 1;
    if (negativeTokens.some((token) => text.includes(token))) negative += 1;
  }

  const net = positive - negative;
  const sentiment = net >= 6 ? "Positive" : net <= -3 ? "Negative" : "Neutral";
  return { sentiment, positive, negative, net };
}

function parseAcademyLearners(payload) {
  const direct = Array.isArray(payload?.learners) ? payload.learners : [];
  if (direct.length) return direct;
  const nested = Array.isArray(payload?.summary?.learners) ? payload.summary.learners : [];
  if (nested.length) return nested;
  const fallback = Array.isArray(payload?.items) ? payload.items : [];
  return fallback;
}

function inferRequiredCertsFromWork(tasks = [], schedule = []) {
  const certCounts = {};
  const workRows = [...tasks.slice(0, 50), ...schedule.slice(0, 50)];

  for (const row of workRows) {
    const text = normalize(`${row.task || ""} ${row.title || ""} ${row.zone || ""} ${row.status || ""}`);
    for (const entry of requirementMap) {
      if (text.includes(entry.token)) {
        certCounts[entry.cert] = (certCounts[entry.cert] || 0) + 1;
      }
    }
  }

  const certs = Object.entries(certCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

  return certs.length ? certs : ["OSHA 30", "Field Reporting Basics", "Critical Path Recovery"];
}

function computeCandidateScore(candidate, requiredCerts, shortagePressure) {
  const certMatches = requiredCerts.filter((cert) => candidate.certifications.some((owned) => normalize(owned).includes(normalize(cert)))).length;
  const certCoveragePct = Math.round((certMatches / Math.max(1, requiredCerts.length)) * 100);
  const availabilityScore = candidate.availability === "ready" ? 95 : candidate.availability === "idle" ? 85 : 60;
  const proficiencyScore = candidate.fcaSystemProficiency === "Advanced" ? 94 : candidate.fcaSystemProficiency === "Intermediate" ? 80 : 66;
  const equipmentScore = clamp(Math.round((candidate.equipmentHours / 1400) * 100), 40, 96);

  const readinessScore = Math.round(
    (certCoveragePct * 0.36)
    + (availabilityScore * 0.16)
    + (proficiencyScore * 0.16)
    + (equipmentScore * 0.12)
    + (candidate.skillFit * 0.12)
    + (candidate.culturalFit * 0.08),
  );

  const fitScore = Math.round((candidate.skillFit * 0.6) + (candidate.culturalFit * 0.4));
  const retentionScore = Math.round((candidate.retentionLikelihood * 0.7) + (fitScore * 0.3) + (shortagePressure > 0 ? 2 : 0));

  return {
    certCoveragePct,
    readinessScore: clamp(readinessScore, 0, 100),
    fitScore: clamp(fitScore, 0, 100),
    retentionScore: clamp(retentionScore, 0, 100),
  };
}

function getCapacitySignal(tasks = [], schedule = []) {
  const activeTasks = tasks.filter((row) => !/complete|done|closed/i.test(String(row.status || ""))).length;
  const nearMilestones = schedule.filter((row) => {
    const due = Date.parse(row.date || row.dueDate || row.updatedAt || "");
    if (!Number.isFinite(due)) return false;
    const days = Math.floor((due - Date.now()) / 86400000);
    return days >= 0 && days <= 90;
  }).length;

  const weightedNeed = Math.round((activeTasks * 0.45) + (nearMilestones * 0.75));
  return {
    activeTasks,
    nearMilestones,
    weightedNeed,
  };
}

export default function PortalHiring() {
  const [candidateId, setCandidateId] = useState(seedCandidates[0].id);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [runtime, setRuntime] = useState(() => readRuntimeState());
  const [talentState, setTalentState] = useState(() => readTalentOrchestratorState());
  const [latestDossier, setLatestDossier] = useState(null);

  const projectsLoad = usePortalApiLoad(() => fetchWorkflowProjects(), []);
  const tasksLoad = usePortalApiLoad(() => fetchFieldTasks({}), []);
  const scheduleLoad = usePortalApiLoad(() => fetchFieldSchedule({}), []);
  const academyLoad = usePortalApiLoad(() => fetchAcademyLms({ view: "summary" }), []);
  const messagesLoad = usePortalApiLoad(() => fetchPortalMessages(), []);

  const projects = projectsLoad.data?.items || [];
  const tasks = tasksLoad.data?.items || [];
  const schedule = scheduleLoad.data?.items || [];
  const academyLearners = parseAcademyLearners(academyLoad.data || {});
  const messages = messagesLoad.data?.items || [];

  const selectedCandidate = useMemo(
    () => seedCandidates.find((row) => row.id === candidateId) || seedCandidates[0],
    [candidateId],
  );

  const sentiment = useMemo(() => sentimentFromMessages(messages), [messages]);
  const requiredCerts = useMemo(() => inferRequiredCertsFromWork(tasks, schedule), [tasks, schedule]);
  const capacity = useMemo(() => getCapacitySignal(tasks, schedule), [tasks, schedule]);
  const futureDemand = useMemo(() => computeFutureCapacityDemand(schedule, adminGovernance?.module27TalentAutonomy?.predictiveProvisioning?.planningHorizonMonths || 6), [schedule]);

  const operationsThresholds = adminGovernance.operationsGovernance?.interventionThresholds || {};
  const shortageThreshold = toNumber(operationsThresholds.maxCapacityGapCrewUnits || 0);
  const shortagePressure = Math.max(0, capacity.weightedNeed - (seedCandidates.filter((row) => row.availability === "ready" || row.availability === "idle").length * 4));

  const candidateRows = useMemo(() => {
    return seedCandidates
      .map((candidate) => {
        const score = computeCandidateScore(candidate, requiredCerts, shortagePressure);
        return {
          id: candidate.id,
          candidate,
          ...score,
          matchBand: score.readinessScore >= 85 ? "Priority" : score.readinessScore >= 70 ? "Strong" : "Review",
        };
      })
      .sort((a, b) => b.readinessScore - a.readinessScore);
  }, [requiredCerts, shortagePressure]);

  const selectedMatch = candidateRows.find((row) => row.id === selectedCandidate.id) || candidateRows[0];
  const credentialGate = useMemo(() => checkCredentialGate(selectedCandidate, adminGovernance), [selectedCandidate]);
  const cultureAlignment = useMemo(() => evaluateCultureAlignment(selectedCandidate, adminGovernance, talentState?.cultureWeights), [selectedCandidate, talentState?.cultureWeights]);

  const internalMobilityRows = candidateRows.filter((row) => row.candidate.internal && row.readinessScore >= 75);
  const lendingSupplyRows = candidateRows.filter((row) => row.candidate.availability === "idle");
  const zeroTouchReadyCount = candidateRows.filter((row) => {
    const gate = checkCredentialGate(row.candidate, adminGovernance);
    return row.readinessScore >= (adminGovernance?.module27TalentAutonomy?.zeroTouchInterview?.minimumGoScorePct || 95) && gate.pass;
  }).length;

  const retentionAlerts = useMemo(() => {
    const alerts = [];
    if (sentiment.sentiment !== "Positive") {
      alerts.push({
        id: "sentiment-watch",
        title: `Sentiment is ${sentiment.sentiment.toLowerCase()} across message traffic`,
        detail: "Schedule proactive retention conversations for high-value workers this week.",
      });
    }

    for (const hire of runtime.hired.slice(0, 8)) {
      const daysSinceTouch = Math.max(0, Math.floor((Date.now() - Date.parse(hire.hiredAt || "")) / 86400000));
      if (daysSinceTouch >= 21) {
        alerts.push({
          id: `checkin-${hire.id}`,
          title: `${hire.name} has no recorded retention check-in for ${daysSinceTouch} days`,
          detail: "Assign manager outreach and review workload / progression goals.",
        });
      }
    }

    return alerts.slice(0, 4);
  }, [runtime.hired, sentiment.sentiment]);

  const careersPreview = useMemo(() => {
    const highlightedProjects = projects.slice(0, 3).map((project) => project.name || project.id);
    return {
      headline: "Build with verified crews, modern safety, and credential-first execution.",
      projects: highlightedProjects.length ? highlightedProjects : ["Active healthcare TI", "Regional logistics build-out", "Campus modernization"],
      trainingCommitment: "Every hire is mapped to Academy pathways with measurable credential milestones.",
    };
  }, [projects]);

  const academyFunnelProspects = useMemo(() => {
    const rows = academyLearners.slice(0, 6).map((learner, index) => {
      const name = learner.fullName || learner.name || `Academy Learner ${index + 1}`;
      const email = learner.email || `learner${index + 1}@example.com`;
      const credentialCount = Array.isArray(learner.certifications)
        ? learner.certifications.length
        : Array.isArray(learner.credentials)
          ? learner.credentials.length
          : 0;
      return {
        id: learner.id || learner.learnerId || `LEARNER-${index + 1}`,
        name,
        email,
        credentialCount,
        company: learner.company || "Unmapped firm",
      };
    });
    return rows;
  }, [academyLearners]);

  useEffect(() => {
    writeRuntimeState(runtime);
  }, [runtime]);

  function appendOrchestration(action, detail) {
    setRuntime((current) => ({
      ...current,
      orchestrationLog: [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
          at: new Date().toISOString(),
          action,
          detail,
        },
        ...current.orchestrationLog,
      ].slice(0, 80),
    }));
  }

  function runSmartScreening() {
    const screening = runZeroTouchInterview(selectedCandidate, requiredCerts, adminGovernance, talentState?.cultureWeights);
    appendOrchestration(
      "Smart screening triggered",
      screening.zeroTouchEligible
        ? `Zero-touch interview passed at ${screening.goScore}% for ${selectedCandidate.name}. Candidate is 95%+ verified for autonomous progression.`
        : `Interview sequence launched for ${selectedCandidate.name}. Current autonomous Go score is ${screening.goScore}%.`,
    );
    setNotice(
      screening.zeroTouchEligible
        ? `Zero-touch interview passed for ${selectedCandidate.name}.`
        : `Smart screening launched for ${selectedCandidate.name}.`,
    );
  }

  async function markHired() {
    if (!selectedCandidate) return;
    if (!credentialGate.pass) {
      setNotice(`Credential gate blocked: ${selectedCandidate.name} is missing ${credentialGate.required}.`);
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const onboardingPlan = planAutonomousOnboarding(selectedCandidate, projects, tasks);
      const hireRecord = {
        id: selectedCandidate.id,
        name: selectedCandidate.name,
        hiredAt: new Date().toISOString(),
        onboarding: {
          portalAccess: "Provisioned for /portal/platform",
          academyPathway: selectedCandidate.persona.includes("Superintendent")
            ? "Advanced Field Safety Leadership"
            : "Field Reporting Basics",
          payroll: "Finance profile queued",
          credentialProvisioning: onboardingPlan.credentialProvisioning,
          projectAssignment: onboardingPlan.projectAssignment,
          firstTaskAssignment: onboardingPlan.firstTaskAssignment,
        },
      };

      setRuntime((current) => ({
        ...current,
        hired: [hireRecord, ...current.hired.filter((row) => row.id !== selectedCandidate.id)].slice(0, 40),
      }));

      await sendPortalMessage({
        subject: `Autonomous onboarding completed for ${selectedCandidate.name}`,
        message: `Auricrux provisioned dashboard access, assigned Academy pathway, and queued finance onboarding tasks for ${selectedCandidate.name}.`,
        channel: "email",
        sourceRoute: "/portal/hiring",
      }).catch(() => null);

      appendOrchestration(
        "Predictive onboarding executed",
        `${selectedCandidate.name} was hired and provisioning across Dashboard, Academy, Finance, project assignment, and first field task completed.`,
      );
      setNotice(`${selectedCandidate.name} marked hired and autonomous onboarding completed.`);
    } finally {
      setBusy(false);
    }
  }

  async function escalateSensitiveHiringCase() {
    const escalation = shouldEscalateToFounder({
      salaryNegotiationAmountUsd: selectedMatch.readinessScore >= 90 ? 180000 : 90000,
      performanceDisciplinary: false,
      cultureFitDispute: cultureAlignment.score < 70,
    }, adminGovernance);

    if (!escalation.escalate) {
      setNotice("No founder escalation required for current candidate profile.");
      return;
    }

    const dossier = createContextualDossier(
      selectedCandidate,
      {
        type: "hiring-sensitive-case",
        summary: `Founder intervention requested for ${selectedCandidate.name}.`,
        dataPoints: {
          goScore: selectedMatch.readinessScore,
          cultureScore: cultureAlignment.score,
          credentialGate: credentialGate.pass,
          reasons: escalation.reasons,
        },
      },
      [
        "Proceed with controlled offer and probationary culture milestones.",
        "Re-route candidate to Academy upskilling before offer.",
        "Pause action and trigger executive interview round.",
      ],
    );

    setLatestDossier(dossier);

    await sendPortalMessage({
      subject: `Founder intervention dossier prepared for ${selectedCandidate.name}`,
      message: `Auricrux prepared dossier ${dossier.id} with recommended paths: ${dossier.recommendedPaths.join(" | ")}`,
      channel: "email",
      sourceRoute: "/portal/hiring",
    }).catch(() => null);

    await createWorkflowAuditEvent({
      eventType: "talent-founder-escalation",
      actorType: "auricrux",
      severity: "E2",
      note: `Founder intervention dossier ${dossier.id} generated for ${selectedCandidate.name}.`,
      route: "/portal/hiring",
      candidateId: selectedCandidate.id,
      reasons: escalation.reasons,
    }).catch(() => null);

    logTriadBlackboxEvent("talent-founder-escalation", {
      projectId: projects[0]?.id || selectedCandidate.id,
      candidateId: selectedCandidate.id,
      dossierId: dossier.id,
      reasons: escalation.reasons,
    });

    appendOrchestration("Founder escalation dossier issued", `Dossier ${dossier.id} issued for ${selectedCandidate.name}.`);
    setNotice(`Founder intervention protocol triggered for ${selectedCandidate.name}. Dossier ${dossier.id} ready.`);
  }

  function triggerCapacityCampaign() {
    appendOrchestration(
      "Capacity-driven hiring campaign",
      `Forecast need ${capacity.weightedNeed} versus available crew posture; Auricrux launched early recruitment wave for Q4 demand protection.`,
    );
    setNotice("Capacity campaign launched from Operations-linked shortage forecast.");
  }

  function executeLaborLending(candidate) {
    const lending = {
      id: `${candidate.id}-${Date.now()}`,
      candidateId: candidate.id,
      candidateName: candidate.name,
      fromEmployer: candidate.employer,
      toEmployer: "FCA Network Demand Pool",
      status: "proposed",
      proposedAt: new Date().toISOString(),
      reason: "Idle verified capacity matched to shortage hotspot.",
    };

    setRuntime((current) => ({
      ...current,
      laborLending: [lending, ...current.laborLending].slice(0, 40),
    }));
    appendOrchestration("Skill-based labor lending proposal", `${candidate.name} offered into ecosystem lending pool with verified credentials.`);
    setNotice(`Labor lending proposal generated for ${candidate.name}.`);
  }

  async function convertAcademyProspect(prospect) {
    setBusy(true);
    setNotice("");
    try {
      await createPortalLead({
        sourceChannel: "academy-funnel",
        serviceLine: "talent-pipeline",
        projectIntent: "academy-to-portal-conversion",
        sourceRoute: "/portal/hiring",
        createdBy: "auricrux-hiring-funnel",
        client: {
          name: prospect.company,
          contactName: prospect.name,
          contactEmail: prospect.email,
        },
        notes: `Academy funnel conversion candidate with ${prospect.credentialCount} credential(s).`,
        site: {
          name: "Talent pipeline conversion",
          estimatedValue: 0,
        },
      });
      appendOrchestration("Academy-to-Portal conversion", `${prospect.name} from ${prospect.company} converted into enterprise lead funnel.`);
      setNotice(`Academy prospect ${prospect.name} converted into enterprise lead funnel.`);
    } catch (error) {
      setNotice(error?.message || "Unable to convert academy prospect.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalShell
      title="Hiring and Employment Command"
      subtitle="Competency-verified workforce pipeline that links Academy credentials to project execution demand."
      activeHref="/portal/hiring"
      currentJourney="academy"
      routeOverlay={routeStateOverlays.hiring || routeStateOverlays.academy}
      primaryHref="/portal/operations"
      primaryLabel="Open operations command"
      showRouteOverlay={false}
    >
      <AuricruxInsightPanel
        title="Auricrux Workforce Orchestrator"
        targetObjectId={selectedCandidate?.id || "WORKFORCE"}
        sourceRoute="/portal/hiring"
        rationale="Link verified talent to real schedule demand and automate high-touch hiring activities."
        nextAction={shortagePressure > shortageThreshold
          ? `Capacity gap signal detected (${shortagePressure}). Launch recruitment and labor lending workflows now.`
          : `Top match ${selectedCandidate.name} is ${selectedMatch.readinessScore}% ready. Advance screening and onboarding.`}
        recommendations={[
          `${requiredCerts.slice(0, 3).join(", ")} are currently the most demanded credentials across scheduling and field tasks.`,
          `Retention sentiment is ${sentiment.sentiment.toLowerCase()} with net score ${sentiment.net}.`,
          `${internalMobilityRows.length} internal candidate(s) are promotion-ready from Academy and field performance.`,
        ]}
        tone="green"
        liveRecommend
      />

      <PortalPageIntro
        eyebrow="Module 27"
        title="Workforce Talent Pipeline"
        detail="This module treats hiring as capability deployment. Candidates are Academy-verified, matched by project demand, and orchestrated through autonomous screening, onboarding, retention, and capacity planning."
        actions={(
          <>
            <button type="button" style={{ ...portalButtonPrimary, border: "none", cursor: "pointer" }} onClick={runSmartScreening} disabled={busy}>Run Smart Screening</button>
            <button type="button" style={portalButtonSecondary} onClick={markHired} disabled={busy}>{busy ? "Processing..." : "Mark Candidate Hired"}</button>
            <button type="button" style={portalButtonSecondary} onClick={escalateSensitiveHiringCase} disabled={busy}>Trigger Founder Intervention</button>
          </>
        )}
      />

      <PortalApiStatusBanner status={tasksLoad.status} error={tasksLoad.error} onRetry={tasksLoad.reload} label="field tasks" />
      <PortalApiStatusBanner status={scheduleLoad.status} error={scheduleLoad.error} onRetry={scheduleLoad.reload} label="field schedule" />
      <PortalApiStatusBanner status={academyLoad.status} error={academyLoad.error} onRetry={academyLoad.reload} label="academy" />

      {notice ? <PortalAlert tone={notice.includes("Unable") ? "warning" : "success"}>{notice}</PortalAlert> : null}

      {latestDossier ? (
        <PortalAlert tone="warning" title="Founder Dossier Ready">
          {`Dossier ${latestDossier.id} generated for ${latestDossier.candidateName}. Scenario: ${latestDossier.scenarioType}.`}
        </PortalAlert>
      ) : null}

      <PortalQuickStats
        items={[
          { label: "Open Labor Demand", value: capacity.weightedNeed, hint: `${capacity.activeTasks} active tasks + ${capacity.nearMilestones} near milestones` },
          { label: "AI Priority Matches", value: candidateRows.filter((row) => row.readinessScore >= 85).length, hint: "Readiness >= 85" },
          { label: "Zero-Touch Ready", value: zeroTouchReadyCount, hint: "95%+ Go and credential gate pass" },
          { label: "Hired (Autonomous)", value: runtime.hired.length, hint: "Provisioned across portal, academy, finance" },
          { label: "Lending Opportunities", value: lendingSupplyRows.length, hint: "Idle verified workers" },
        ]}
      />

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Culture Weighting + Credential Gate</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 12, color: portalTokens.muted }}>Safety ownership weight</span>
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={talentState?.cultureWeights?.safetyOwnership ?? 0.35}
              onChange={(event) => setTalentState(setCultureWeights({ safetyOwnership: Number(event.target.value) }))}
              style={portalInputStyle}
            />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 12, color: portalTokens.muted }}>Accountability weight</span>
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={talentState?.cultureWeights?.accountability ?? 0.35}
              onChange={(event) => setTalentState(setCultureWeights({ accountability: Number(event.target.value) }))}
              style={portalInputStyle}
            />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 12, color: portalTokens.muted }}>Team humility weight</span>
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={talentState?.cultureWeights?.teamHumility ?? 0.3}
              onChange={(event) => setTalentState(setCultureWeights({ teamHumility: Number(event.target.value) }))}
              style={portalInputStyle}
            />
          </label>
        </div>
        <div style={{ marginTop: 8, color: portalTokens.body, fontSize: 13 }}>
          Candidate {selectedCandidate.name} culture alignment is <strong>{cultureAlignment.score}%</strong>. Credential gate status: <strong>{credentialGate.pass ? "PASS" : "BLOCKED"}</strong> ({credentialGate.required}).
        </div>
        <div style={{ marginTop: 6, color: portalTokens.muted, fontSize: 13 }}>
          Predictive provisioning horizon: {futureDemand.horizonMonths} months. Forecast rows in scope: {futureDemand.futureRows}. Top demand signals: {(futureDemand.summary || []).join(" | ") || "No forecasted role spikes"}.
        </div>
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Talent-to-Credential Integration</div>
        <PortalEntityTable
          columns={[
            { key: "name", label: "Candidate", render: (row) => <strong>{row.candidate.name}</strong> },
            { key: "persona", label: "Role", render: (row) => row.candidate.persona },
            { key: "readiness", label: "Readiness", render: (row) => <PortalStatusBadge status={`${row.readinessScore}%`} active={row.readinessScore >= 85} /> },
            { key: "certCoverage", label: "Cert Coverage", render: (row) => `${row.certCoveragePct}%` },
            { key: "fit", label: "Fit", render: (row) => `${row.fitScore}%` },
            { key: "retention", label: "Retention", render: (row) => `${row.retentionScore}%` },
            {
              key: "action",
              label: "",
              render: (row) => (
                <button type="button" style={portalButtonSecondary} onClick={() => setCandidateId(row.id)}>
                  {row.id === selectedCandidate.id ? "Selected" : "Review"}
                </button>
              ),
            },
          ]}
          rows={candidateRows}
          emptyTitle="No candidate profiles"
          emptyDetail="Candidate cards appear when Academy and hiring feeds are connected."
          emptyPrimaryHref="/portal/academy"
          emptyPrimaryLabel="Open academy"
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10, marginTop: 12 }}>
          <div style={{ border: "1px solid #dbe3ef", borderRadius: 10, padding: 10, background: "#fff" }}>
            <div style={{ fontSize: 12, color: portalTokens.muted }}>Selected candidate profile</div>
            <strong>{selectedCandidate.name} ({selectedCandidate.persona})</strong>
            <div style={{ color: portalTokens.body, marginTop: 6 }}>Certifications: {selectedCandidate.certifications.join(", ")}</div>
            <div style={{ color: portalTokens.body, marginTop: 4 }}>FCA system proficiency: {selectedCandidate.fcaSystemProficiency}</div>
            <div style={{ color: portalTokens.body, marginTop: 4 }}>Equipment operating hours: {selectedCandidate.equipmentHours}</div>
          </div>
          <div style={{ border: "1px solid #dbe3ef", borderRadius: 10, padding: 10, background: "#fff" }}>
            <div style={{ fontSize: 12, color: portalTokens.muted }}>AI demand extraction</div>
            <strong>Top required credentials from Scheduling + Field Tasks</strong>
            <div style={{ color: portalTokens.body, marginTop: 6 }}>{requiredCerts.join(" | ")}</div>
          </div>
        </div>
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Autonomous Hiring Orchestration</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
            <strong>1. Smart screening</strong>
            <div style={{ color: portalTokens.body, marginTop: 6 }}>Interview scheduling, Academy pre-assessment, and secure background checks in one run.</div>
          </div>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
            <strong>2. Predictive onboarding</strong>
            <div style={{ color: portalTokens.body, marginTop: 6 }}>Portal dashboard access, Academy pathway, and finance onboarding package created on hire event.</div>
          </div>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
            <strong>3. Fit scoring</strong>
            <div style={{ color: portalTokens.body, marginTop: 6 }}>Cultural fit + skill fit + retention probability drive hiring priority and manager recommendations.</div>
          </div>
        </div>
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={portalEyebrowStyle}>Capacity-Driven Hiring</div>
            <strong>Operations-linked labor capacity planning</strong>
          </div>
          <button type="button" style={portalButtonPrimary} onClick={triggerCapacityCampaign}>Launch Recruitment Drive</button>
        </div>
        <div style={{ marginTop: 8, color: portalTokens.body, lineHeight: 1.6 }}>
          Weighted labor need is <strong>{capacity.weightedNeed}</strong>. Current shortage pressure is <strong>{shortagePressure}</strong>. Auricrux triggers campaigns before shortages become schedule delays.
        </div>
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Internal Mobility Engine</div>
        <PortalEntityTable
          columns={[
            { key: "name", label: "Internal Candidate", render: (row) => <strong>{row.candidate.name}</strong> },
            { key: "current", label: "Current Role", render: (row) => row.candidate.persona },
            { key: "target", label: "Promotion Target", render: (row) => row.candidate.persona.includes("Assistant") ? "Superintendent" : "Journeyman" },
            { key: "score", label: "Readiness", render: (row) => `${row.readinessScore}%` },
          ]}
          rows={internalMobilityRows}
          emptyTitle="No internal mobility candidates"
          emptyDetail="Internal promotions populate as Academy and field performance maturity increase."
          emptyPrimaryHref="/portal/academy"
          emptyPrimaryLabel="Open Academy"
        />
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Employer Branding Tool</div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "#fff" }}>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>Branded Careers Page Preview</h3>
          <div style={{ color: portalTokens.body, marginBottom: 8 }}>{careersPreview.headline}</div>
          <div style={{ color: portalTokens.body }}><strong>Featured Project Portfolio:</strong> {careersPreview.projects.join(" | ")}</div>
          <div style={{ color: portalTokens.body, marginTop: 6 }}><strong>Training Commitment:</strong> {careersPreview.trainingCommitment}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <a href="/portal/projects" style={{ ...portalButtonSecondary, textDecoration: "none" }}>Open Project Portfolio</a>
            <a href="/academy" style={{ ...portalButtonSecondary, textDecoration: "none" }}>Open Academy</a>
          </div>
        </div>
      </div>

      {retentionAlerts.length ? (
        <div style={{ ...portalCardStyle, marginBottom: 16 }}>
          <div style={portalEyebrowStyle}>Retention Analytics</div>
          <div style={{ display: "grid", gap: 8 }}>
            {retentionAlerts.map((alert) => (
              <PortalAlert key={alert.id} tone="warning" title={alert.title}>{alert.detail}</PortalAlert>
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Skill-Based Labor Lending</div>
        <div style={{ color: portalTokens.body, marginBottom: 10 }}>
          Verified idle capacity can be proposed into the FCA network demand pool, enabling cross-customer labor mobility with credential assurance.
        </div>
        <PortalEntityTable
          columns={[
            { key: "name", label: "Worker", render: (row) => <strong>{row.candidate.name}</strong> },
            { key: "employer", label: "Current Employer", render: (row) => row.candidate.employer },
            { key: "certs", label: "Verified Credentials", render: (row) => row.candidate.certifications.slice(0, 2).join(", ") },
            {
              key: "action",
              label: "",
              render: (row) => <button type="button" style={portalButtonSecondary} onClick={() => executeLaborLending(row.candidate)}>Propose lending</button>,
            },
          ]}
          rows={lendingSupplyRows}
          emptyTitle="No idle verified labor"
          emptyDetail="Labor lending opportunities appear when availability is idle and credential profile is valid."
          emptyPrimaryHref="/portal/operations"
          emptyPrimaryLabel="Open Operations"
        />
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Academy-as-Funnel</div>
        <div style={{ color: portalTokens.body, marginBottom: 10 }}>
          Convert certified learners into enterprise prospects with one click. This keeps Academy and OS growth in a single flywheel.
        </div>
        <PortalEntityTable
          columns={[
            { key: "name", label: "Learner", render: (row) => <strong>{row.name}</strong> },
            { key: "company", label: "Firm", render: (row) => row.company },
            { key: "credentials", label: "Credentials", render: (row) => row.credentialCount },
            {
              key: "action",
              label: "",
              render: (row) => (
                <button type="button" style={portalButtonSecondary} onClick={() => convertAcademyProspect(row)} disabled={busy}>
                  Convert to Portal Lead
                </button>
              ),
            },
          ]}
          rows={academyFunnelProspects}
          emptyTitle="No academy prospects"
          emptyDetail="Learners appear when Academy feed is available."
          emptyPrimaryHref="/academy"
          emptyPrimaryLabel="Open Academy"
        />
      </div>

      <div style={{ ...portalCardStyle }}>
        <div style={portalEyebrowStyle}>Orchestration Log</div>
        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
          {runtime.orchestrationLog.map((row) => (
            <div key={row.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <strong>{row.action}</strong>
                <span style={{ color: portalTokens.muted, fontSize: 12 }}>{new Date(row.at).toLocaleString()}</span>
              </div>
              <div style={{ color: portalTokens.body, marginTop: 4 }}>{row.detail}</div>
            </div>
          ))}
          {!runtime.orchestrationLog.length ? <div style={{ color: portalTokens.muted }}>No hiring orchestration events yet.</div> : null}
        </div>
      </div>
    </PortalShell>
  );
}
