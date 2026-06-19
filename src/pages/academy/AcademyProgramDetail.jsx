import { useEffect, useMemo, useState } from "react";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import useAcademyLms from "../../hooks/useAcademyLms";
import useCustomerSession from "../../hooks/useCustomerSession";
import { fetchAcademyProgram } from "../../api/academyClient";
import { academyCtaSets, shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { pageShellStyle } from "../../publicShellStyles";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function AcademyProgramDetail({ routeParams = {} }) {
  const programId = routeParams.programId;
  const { session } = useCustomerSession();
  const { academyState, completeModule, assignProgram } = useAcademyLms();
  const [programDetail, setProgramDetail] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [busyModule, setBusyModule] = useState(null);
  const [enrollBusy, setEnrollBusy] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const learnerId = session?.email || session?.customerId;

  const enrollment = useMemo(() => {
    return (academyState.enrollments || []).find((item) => item.programKey === programId && (!learnerId || item.learnerId === learnerId));
  }, [academyState.enrollments, programId, learnerId]);

  useEffect(() => {
    if (!programId) return;
    setLoadError("");
    fetchAcademyProgram(programId)
      .then((payload) => setProgramDetail(payload))
      .catch((error) => setLoadError(error.message || "Unable to load program."));
  }, [programId]);

  const program = programDetail?.program;
  const modules = programDetail?.modules || [];

  async function enrollNow() {
    if (!programId || !learnerId) {
      setActionMessage("Sign in to enroll in this program.");
      return;
    }
    setEnrollBusy(true);
    setActionMessage("");
    try {
      await assignProgram(learnerId, programId, "Auricrux");
      setActionMessage("Enrollment active. Start with module 1 below.");
    } catch (error) {
      setActionMessage(error.message || "Unable to enroll in this program.");
    } finally {
      setEnrollBusy(false);
    }
  }

  async function markModuleComplete(module) {
    if (!enrollment?.enrollmentId) {
      setActionMessage("Enroll in this program to track progress.");
      return;
    }
    setBusyModule(module.moduleNumber);
    setActionMessage("");
    try {
      await completeModule(enrollment.enrollmentId, {
        moduleNumber: module.moduleNumber,
        moduleTitle: module.title,
        nextLesson: module.title,
      });
      setActionMessage(`Module ${module.moduleNumber} marked complete.`);
    } catch (error) {
      setActionMessage(error.message || "Unable to update progress.");
    } finally {
      setBusyModule(null);
    }
  }

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        compact
        eyebrow="FCA Academy"
        title={program?.title || "Program"}
        subtitle={program?.completionRule || "Module-based training from Auricrux-Central catalog."}
        primaryHref={shellHeaderCtaSets.academy.primaryHref}
        primaryLabel={shellHeaderCtaSets.academy.primaryLabel}
        secondaryHref="/academy/catalog"
        secondaryLabel="Back to catalog"
        journey={shellJourney}
        currentJourney="academy"
      />

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px 48px" }}>
        {loadError ? (
          <div style={{ ...cardStyle, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b" }}>{loadError}</div>
        ) : null}

        {program ? (
          <div style={{ ...cardStyle, marginBottom: 24 }}>
            <div style={{ color: "#1d4ed8", fontWeight: 700, marginBottom: 6 }}>{program.credential}</div>
            <p style={{ color: "#475569", lineHeight: 1.7 }}>
              <strong>Pathway:</strong> {program.pathway} | <strong>Level:</strong> {program.level} | <strong>Modules:</strong> {program.duration}
            </p>
            {enrollment ? (
              <div style={{ marginTop: 12, color: "#334155" }}>
                <strong>Your progress:</strong> {enrollment.progressPercent}% | {enrollment.completedModules}/{enrollment.totalModules} modules
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                <div style={{ color: "#64748b", marginBottom: 10 }}>You are not enrolled in this program yet.</div>
                <button
                  type="button"
                  disabled={enrollBusy}
                  onClick={enrollNow}
                  style={{ border: "1px solid #2563eb", background: "#2563eb", color: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}
                >
                  {enrollBusy ? "Enrolling..." : "Enroll now"}
                </button>
              </div>
            )}
            {actionMessage ? <div style={{ marginTop: 10, color: "#15803d" }}>{actionMessage}</div> : null}
          </div>
        ) : null}

        <div style={{ display: "grid", gap: 16 }}>
          {modules.map((module) => (
            <article key={module.moduleNumber} style={cardStyle}>
              <div style={{ color: "#1d4ed8", fontWeight: 700, marginBottom: 6 }}>Module {module.moduleNumber}</div>
              <h3 style={{ marginTop: 0 }}>{module.title}</h3>
              {module.objective ? <p style={{ color: "#334155", lineHeight: 1.7 }}><strong>Objective:</strong> {module.objective}</p> : null}
              {Array.isArray(module.lessons) ? (
                <ul style={{ color: "#475569", lineHeight: 1.8 }}>
                  {module.lessons.map((lesson) => (
                    <li key={typeof lesson === "string" ? lesson : lesson.title}>{typeof lesson === "string" ? lesson : lesson.title}</li>
                  ))}
                </ul>
              ) : null}
              {module.practicalLab ? <p style={{ color: "#334155" }}><strong>Lab:</strong> {module.practicalLab}</p> : module.lab ? <p style={{ color: "#334155" }}><strong>Lab:</strong> {module.lab}</p> : null}
              {module.knowledgeCheck ? <p style={{ color: "#64748b" }}><strong>Knowledge check:</strong> {module.knowledgeCheck}</p> : null}
              {enrollment ? (
                <button
                  type="button"
                  disabled={busyModule === module.moduleNumber}
                  onClick={() => markModuleComplete(module)}
                  style={{ marginTop: 12, border: "1px solid #2563eb", background: "#2563eb", color: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}
                >
                  {busyModule === module.moduleNumber ? "Saving..." : "Mark module complete"}
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </main>

      <ShellFooter ctaSet={academyCtaSets.home} />
    </div>
  );
}
