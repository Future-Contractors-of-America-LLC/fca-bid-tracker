import { useEffect, useMemo, useState } from "react";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import ProductAccessStatusPanel from "../../components/ProductAccessStatusPanel";
import CustomerCommsLaunchpad from "../../components/CustomerCommsLaunchpad";
import PublicCtaRow from "../../components/PublicCtaRow";
import { academyCtaSets, shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import useCustomerSession from "../../hooks/useCustomerSession";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import { pageShellStyle } from "../../publicShellStyles";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const COURSE_PROGRESS_KEY = "fca_academy_customer_courses_v6";

const classrooms = [
  {
    id: "foundations",
    title: "Contractor Command Foundations",
    credential: "FCA Academy · Launch Classroom 01",
    audience: "Owners, estimators, coordinators, project managers, and customer-success staff",
    outcome: "Teach teams to move from intake through qualification, estimate setup, file continuity, customer tasks, and Auricrux-guided next actions.",
    lessons: [
      { id: "foundations-intake", title: "Lesson 1 · Intake and opportunity capture", objective: "Create a clear intake record before qualification begins.", activity: "Review required customer facts, scope cues, and next-step language." },
      { id: "foundations-qualification", title: "Lesson 2 · Qualification and estimate readiness", objective: "Understand qualification posture and the minimum evidence needed to continue.", activity: "Use the qualification lane to identify blockers, owners, and the first estimate action." },
      { id: "foundations-files", title: "Lesson 3 · File and evidence continuity", objective: "Keep plan sets, photos, and customer documents attached to the right context.", activity: "Review how Auricrux uses files to explain what is missing and what should happen next." },
      { id: "foundations-customer", title: "Lesson 4 · Customer task and portal execution", objective: "Move from commentary into real customer-visible work by assigning and completing tasks.", activity: "Create or complete a task in the customer workspace and confirm the next follow-up action." },
      { id: "foundations-auricrux", title: "Lesson 5 · Auricrux explain, recommend, execute", objective: "Confirm the three core Auricrux capabilities across SaaS and Academy.", activity: "Document one explain action, one recommend action, and one execute action tied to a real customer workflow." },
    ],
  },
  {
    id: "qualification",
    title: "Opportunity Qualification and Estimate Launch",
    credential: "FCA Academy · Launch Classroom 02",
    audience: "Sales leads, estimators, preconstruction coordinators, and customer-success operators",
    outcome: "Train teams to qualify opportunities, confirm evidence, route work into estimates, and preserve branded customer continuity.",
    lessons: [
      { id: "qualification-score", title: "Lesson 1 · Score the opportunity", objective: "Read score, blocker, and next-gate posture inside Contractor Command.", activity: "Open the qualification board and identify what prevents estimate launch today." },
      { id: "qualification-budget", title: "Lesson 2 · Confirm budget and scope", objective: "Use customer facts and evidence packets to confirm commercial fit.", activity: "Review budget fit, scope fit, and evidence notes before moving status forward." },
      { id: "qualification-estimate", title: "Lesson 3 · Route to estimate", objective: "Move a qualified opportunity into estimate readiness without losing continuity.", activity: "Trigger estimate routing and verify the next customer deliverable." },
      { id: "qualification-award", title: "Lesson 4 · Convert award into project", objective: "Understand when an opportunity is truly ready for award and project creation.", activity: "Review the award action and resulting project-creation path inside the workspace." },
      { id: "qualification-auricrux", title: "Lesson 5 · Auricrux sales-to-operations handoff", objective: "Use Auricrux to explain, recommend, and execute the handoff into project delivery.", activity: "Record the exact next action Auricrux should take after estimate approval." },
    ],
  },
  {
    id: "estimate-studio",
    title: "Estimate Studio and Proposal Packaging",
    credential: "FCA Academy · Launch Classroom 03",
    audience: "Estimators, coordinators, account managers, and owners",
    outcome: "Train teams to shape branded estimates, add scope notes, create line-item continuity, and package proposals with Auricrux support.",
    lessons: [
      { id: "estimate-studio-status", title: "Lesson 1 · Read estimate status", objective: "Understand the difference between review, pricing readiness, and proposal packaging.", activity: "Open Estimate Studio and explain the current status of one estimate package." },
      { id: "estimate-studio-scope", title: "Lesson 2 · Write branded scope notes", objective: "Create customer-facing scope language that stays attached to the estimate record.", activity: "Draft one scope note that clarifies what the customer is buying." },
      { id: "estimate-studio-lines", title: "Lesson 3 · Build estimate line continuity", objective: "Use line items to keep cost, scope, and customer explanation aligned.", activity: "Add or review estimate line entries and confirm the reason each exists." },
      { id: "estimate-studio-proposal", title: "Lesson 4 · Package the proposal", objective: "Move from pricing review into a customer-ready proposal handoff.", activity: "Generate a proposal and verify the next customer action after delivery." },
      { id: "estimate-studio-auricrux", title: "Lesson 5 · Auricrux pricing guidance", objective: "Use Auricrux to explain pricing, recommend next steps, and execute proposal generation.", activity: "Document one pricing explanation, one recommendation, and one execution action Auricrux should provide." },
    ],
  },
  {
    id: "file-intake",
    title: "File Intake and Evidence Continuity",
    credential: "FCA Academy · Launch Classroom 04",
    audience: "Project coordinators, document controllers, estimators, and customer-success operators",
    outcome: "Train teams to register files, classify evidence, generate Auricrux briefings, and keep document continuity attached to real customer work.",
    lessons: [
      { id: "file-intake-register", title: "Lesson 1 · Register the file", objective: "Create a governed file record under the correct project root.", activity: "Use the File Intake workspace to register one customer file with owner, category, discipline, and evidence target." },
      { id: "file-intake-classify", title: "Lesson 2 · Classify and link evidence", objective: "Tie the file to the right governed evidence chain before downstream actions advance.", activity: "Confirm category, owner, evidence target, and reason the file matters commercially or operationally." },
      { id: "file-intake-briefing", title: "Lesson 3 · Generate the Auricrux briefing", objective: "Turn a document into a usable briefing artifact.", activity: "Create a briefing and review key facts, detected gaps, and recommended next actions." },
      { id: "file-intake-customer", title: "Lesson 4 · Preserve customer continuity", objective: "Keep file actions tied to customer promises, estimate progression, and project execution.", activity: "Identify which customer-visible step depends on the registered file and what happens if it is missing." },
      { id: "file-intake-auricrux", title: "Lesson 5 · Auricrux document control operations", objective: "Use Auricrux to explain, recommend, and execute file-control actions.", activity: "Record one explain action, one recommend action, and one execute action Auricrux should provide inside the file workspace." },
    ],
  },
  {
    id: "project-command",
    title: "Project Command and Customer Milestone Control",
    credential: "FCA Academy · Launch Classroom 05",
    audience: "Owners, project managers, coordinators, superintendents, and customer-success staff",
    outcome: "Train teams to move projects through branded milestones, stage progression, permit recovery, and customer communication with Auricrux embedded in the command flow.",
    lessons: [
      { id: "project-command-stage", title: "Lesson 1 · Read stage and delivery posture", objective: "Understand what the current stage says about mobilization, closeout, and customer expectations.", activity: "Open Project Command Board and explain the active stage, next action, and site status for one project." },
      { id: "project-command-root", title: "Lesson 2 · Set the active project root", objective: "Move the workspace onto the right project context before executing downstream actions.", activity: "Select the correct active project and confirm why the workspace root matters." },
      { id: "project-command-milestone", title: "Lesson 3 · Set branded owner notes and customer milestones", objective: "Create customer-facing milestone continuity inside the branded portal.", activity: "Draft one owner note and one customer milestone for a live project." },
      { id: "project-command-stage-advance", title: "Lesson 4 · Advance stage and recover blockers", objective: "Use Project Command to move a project into mobilization, closeout, or permit recovery.", activity: "Advance one stage or clear a permit blocker and confirm the resulting next action." },
      { id: "project-command-auricrux", title: "Lesson 5 · Auricrux project execution guidance", objective: "Use Auricrux to explain readiness, recommend the next move, and execute project command actions.", activity: "Record one explain action, one recommendation, and one execution action Auricrux should provide in the project workspace." },
    ],
  },
  {
    id: "communications-command",
    title: "Customer Communications Command",
    credential: "FCA Academy · Launch Classroom 06",
    audience: "Customer-success teams, owners, project coordinators, estimators, and account managers",
    outcome: "Train teams to send branded customer communications, preserve cross-channel continuity, and let Auricrux guide the next message or escalation path.",
    lessons: [
      { id: "communications-channel", title: "Lesson 1 · Choose the right customer channel", objective: "Understand when to use email, chat, SMS, phone, Teams, conference, or lecture lanes.", activity: "Review one live communication need and choose the channel that best protects customer continuity." },
      { id: "communications-subject", title: "Lesson 2 · Frame the update", objective: "Write a customer-ready subject and message that clearly explains what changed and what happens next.", activity: "Draft one branded customer message inside Communications Command." },
      { id: "communications-send", title: "Lesson 3 · Send and preserve the record", objective: "Keep sent communications visible inside the workspace instead of losing them in external threads.", activity: "Send a customer update and confirm it remains visible in the communication record." },
      { id: "communications-stream", title: "Lesson 4 · Read live communication continuity", objective: "Use the communications stream to understand priority, blockers, and the next action across channels.", activity: "Open the live stream and identify the highest-priority next customer action." },
      { id: "communications-auricrux", title: "Lesson 5 · Auricrux communication operations", objective: "Use Auricrux to explain communication posture, recommend the next contact step, and execute branded updates.", activity: "Record one explain action, one recommend action, and one execute action Auricrux should provide in Communications Command." },
    ],
  },
];

function readCourseProgress() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(COURSE_PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeCourseProgress(progress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COURSE_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // best effort only
  }
}

export default function AcademyHome() {
  const { session } = useCustomerSession();
  const { refreshSyncStamp } = useWorkspaceState();
  const [progress, setProgress] = useState(() => readCourseProgress());

  useEffect(() => {
    refreshSyncStamp("Academy classroom continuity active");
  }, [refreshSyncStamp]);

  useEffect(() => {
    writeCourseProgress(progress);
  }, [progress]);

  function toggleLesson(lessonId) {
    setProgress((current) => ({ ...current, [lessonId]: !current[lessonId] }));
  }

  const classroomSummaries = useMemo(() => classrooms.map((classroom) => {
    const completedCount = classroom.lessons.filter((lesson) => progress[lesson.id]).length;
    return {
      ...classroom,
      completedCount,
      completionPercent: Math.round((completedCount / classroom.lessons.length) * 100),
    };
  }), [progress]);

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        eyebrow="FCA Academy"
        title="Customer classroom delivery"
        subtitle="Every customer workspace now includes complete classrooms that train teams to use Contractor Command with Auricrux embedded across intake, qualification, estimates, files, projects, communications, tasks, and execution continuity."
        primaryHref={shellHeaderCtaSets.academy.primaryHref}
        primaryLabel={shellHeaderCtaSets.academy.primaryLabel}
        secondaryHref={shellHeaderCtaSets.academy.secondaryHref}
        secondaryLabel={shellHeaderCtaSets.academy.secondaryLabel}
        journey={shellJourney}
        currentJourney="academy"
      />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 18, padding: "14px 16px", border: "1px solid #dbe3ef", borderRadius: 18, background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)" }}>
        <FcaBrandMark compact />
        <AuricruxBrandMark compact />
      </div>

      <ProductAccessStatusPanel session={session} />
      <CustomerCommsLaunchpad session={session} title="Launch training and communications from one branded customer experience" />

      <div style={{ display: "grid", gap: 24, marginBottom: 24 }}>
        {classroomSummaries.map((classroom) => (
          <div key={classroom.id} style={{ ...cardStyle, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>{classroom.credential}</div>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>{classroom.title}</h2>
            <p style={{ color: "#334155", lineHeight: 1.7 }}>{classroom.outcome}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 16 }}>
              <div><strong>Audience</strong><div style={{ color: "#475569", lineHeight: 1.7 }}>{classroom.audience}</div></div>
              <div><strong>Completion</strong><div style={{ color: "#475569", lineHeight: 1.7 }}>{classroom.completedCount} / {classroom.lessons.length} lessons · {classroom.completionPercent}% complete</div></div>
              <div><strong>Auricrux presence</strong><div style={{ color: "#475569", lineHeight: 1.7 }}>Explain, recommend, and execute actions are reinforced in every lesson.</div></div>
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              {classroom.lessons.map((lesson, index) => (
                <label key={lesson.id} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, background: progress[lesson.id] ? "#f0fdf4" : "#fff", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 8 }}>
                    <div>
                      <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 4 }}>Module {index + 1}</div>
                      <strong>{lesson.title}</strong>
                    </div>
                    <input type="checkbox" checked={Boolean(progress[lesson.id])} onChange={() => toggleLesson(lesson.id)} />
                  </div>
                  <div style={{ color: "#334155", lineHeight: 1.7, marginBottom: 8 }}><strong>Objective:</strong> {lesson.objective}</div>
                  <div style={{ color: "#475569", lineHeight: 1.7 }}><strong>Activity:</strong> {lesson.activity}</div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Auricrux confirmed in Academy</h2>
        <ul style={{ paddingLeft: 20, lineHeight: 1.9, color: "#334155", marginBottom: 0 }}>
          <li>Explains the lesson objective and why it matters in the customer workflow</li>
          <li>Recommends the next SaaS action tied to intake, qualification, estimates, files, projects, communications, and tasks</li>
          <li>Executes guided completion signals and keeps learning-to-workflow continuity visible</li>
        </ul>
      </div>

      <PublicCtaRow actions={academyCtaSets.productionClose} />
      <ShellFooter />
    </div>
  );
}
