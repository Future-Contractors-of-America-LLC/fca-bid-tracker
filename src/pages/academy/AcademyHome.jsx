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

const COURSE_PROGRESS_KEY = "fca_academy_foundations_course_v1";

const classroom = {
  title: "Contractor Command Foundations",
  credential: "FCA Academy · Launch Classroom 01",
  audience: "Owners, estimators, coordinators, project managers, and customer-success staff",
  outcome: "Complete one full classroom that teaches how to move from intake through qualification, estimate setup, file continuity, customer tasks, and Auricrux-guided next actions.",
  lessons: [
    {
      id: "lesson-intake",
      title: "Lesson 1 · Intake and opportunity capture",
      objective: "Create a clear intake record and define what information is required before qualification begins.",
      activity: "Review required customer facts, scope cues, and next-step language used in Contractor Command.",
    },
    {
      id: "lesson-qualification",
      title: "Lesson 2 · Qualification and estimate readiness",
      objective: "Understand qualification posture, estimate entry timing, and the minimum evidence needed to continue.",
      activity: "Use the SaaS qualification lane to identify blockers, owners, and the first estimate action.",
    },
    {
      id: "lesson-files",
      title: "Lesson 3 · File and evidence continuity",
      objective: "Keep plan sets, photos, and customer documents attached to the correct opportunity or project context.",
      activity: "Review how Auricrux uses files to explain what is missing and what should happen next.",
    },
    {
      id: "lesson-customer",
      title: "Lesson 4 · Customer task and portal execution",
      objective: "Move from commentary into real customer-visible work by assigning and completing tasks inside the branded workspace.",
      activity: "Create or complete a task in the customer workspace and confirm the next follow-up action.",
    },
    {
      id: "lesson-auricrux",
      title: "Lesson 5 · Auricrux explain, recommend, execute",
      objective: "Confirm the three core Auricrux capabilities across SaaS and Academy.",
      activity: "Document one explain action, one recommend action, and one execute action tied to a real customer workflow.",
    },
  ],
};

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
  const completedCount = useMemo(() => classroom.lessons.filter((lesson) => progress[lesson.id]).length, [progress]);
  const completionPercent = Math.round((completedCount / classroom.lessons.length) * 100);

  useEffect(() => {
    refreshSyncStamp("Academy classroom continuity active");
  }, [refreshSyncStamp]);

  useEffect(() => {
    writeCourseProgress(progress);
  }, [progress]);

  function toggleLesson(lessonId) {
    setProgress((current) => ({ ...current, [lessonId]: !current[lessonId] }));
  }

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        eyebrow="FCA Academy"
        title="Customer classroom delivery"
        subtitle="Every customer workspace now includes a real classroom that trains teams to use Contractor Command with Auricrux embedded across intake, qualification, files, tasks, and execution continuity."
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

      <div style={{ ...cardStyle, marginBottom: 24, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>{classroom.credential}</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>{classroom.title}</h2>
        <p style={{ color: "#334155", lineHeight: 1.7 }}>{classroom.outcome}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <div>
            <strong>Audience</strong>
            <div style={{ color: "#475569", lineHeight: 1.7 }}>{classroom.audience}</div>
          </div>
          <div>
            <strong>Completion</strong>
            <div style={{ color: "#475569", lineHeight: 1.7 }}>{completedCount} / {classroom.lessons.length} lessons · {completionPercent}% complete</div>
          </div>
          <div>
            <strong>Auricrux presence</strong>
            <div style={{ color: "#475569", lineHeight: 1.7 }}>Explain, recommend, and execute actions are reinforced in every lesson.</div>
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Complete classroom course</h2>
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

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Auricrux confirmed in Academy</h2>
        <ul style={{ paddingLeft: 20, lineHeight: 1.9, color: "#334155", marginBottom: 0 }}>
          <li>Explains the lesson objective and why it matters in the customer workflow</li>
          <li>Recommends the next SaaS action tied to intake, qualification, files, and tasks</li>
          <li>Executes guided completion signals and keeps the learning-to-workflow continuity visible</li>
        </ul>
      </div>

      <PublicCtaRow actions={academyCtaSets.productionClose} />
      <ShellFooter />
    </div>
  );
}
