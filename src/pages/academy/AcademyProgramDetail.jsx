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

function moduleStatus(moduleNumber, enrollment) {
  const completed = enrollment?.completedModuleNumbers || [];
  if (completed.includes(moduleNumber)) return "complete";
  const next = (enrollment?.completedModules || 0) + 1;
  if (moduleNumber === next) return "current";
  if (moduleNumber <= (enrollment?.completedModules || 0) + 1) return "available";
  return "locked";
}

export default function AcademyProgramDetail({ routeParams = {} }) {
  const programId = routeParams.programId;
  const { session } = useCustomerSession();
  const { academyState, assignProgram } = useAcademyLms();
  const [programDetail, setProgramDetail] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [enrollBusy, setEnrollBusy] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const learnerId = session?.email || session?.customerId;

  const enrollment = useMemo(
    () => (academyState.enrollments || []).find((item) => item.programKey === programId && (!learnerId || item.learnerId === learnerId)),
    [academyState.enrollments, programId, learnerId],
  );

  useEffect(() => {
    if (!programId) return;
    setLoadError("");
    fetchAcademyProgram(programId)
      .then((payload) => setProgramDetail(payload))
      .catch((error) => setLoadError(error.message || "Unable to load program."));
  }, [programId]);

  const program = programDetail?.program;
  const modules = programDetail?.modules || [];
  const completionRequirements = programDetail?.completionRequirements;

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

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        compact
        eyebrow="FCA Academy"
        title={program?.title || "Program"}
        subtitle={program?.completionRule || program?.deliveryModel || "Module-based training with knowledge checks and practical labs."}
        primaryHref="/academy/dashboard"
        primaryLabel="Learner dashboard"
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
              <strong>Pathway:</strong> {program.pathway || "General"} | <strong>Track:</strong> {program.track || "Core"} | <strong>Level:</strong> {program.level || "-"} | <strong>Modules:</strong> {program.duration}
            </p>
            {program.deliveryModel ? (
              <p style={{ color: "#334155", lineHeight: 1.65 }}>{program.deliveryModel}</p>
            ) : null}
            {enrollment ? (
              <div style={{ marginTop: 12 }}>
                <div style={{ color: "#334155", marginBottom: 8 }}>
                  <strong>Your progress:</strong> {enrollment.progressPercent}% | {enrollment.completedModules}/{enrollment.totalModules} modules
                </div>
                <div style={{ height: 10, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                  <div style={{ width: `${enrollment.progressPercent}%`, height: "100%", background: "#2563eb" }} />
                </div>
                {enrollment.progressPercent < 100 ? (
                  <a
                    href={`/academy/programs/${programId}/modules/${(enrollment.completedModules || 0) + 1}`}
                    style={{ display: "inline-block", marginTop: 12, border: "1px solid #2563eb", background: "#2563eb", color: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, textDecoration: "none" }}
                  >
                    Continue: Module {(enrollment.completedModules || 0) + 1}
                  </a>
                ) : (
                  <a href="/academy/credentials" style={{ display: "inline-block", marginTop: 12, color: "#15803d", fontWeight: 700, textDecoration: "none" }}>
                    Program complete - view credential
                  </a>
                )}
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                <div style={{ color: "#64748b", marginBottom: 10 }}>Enroll to access module lessons, knowledge checks, and progress tracking.</div>
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

        {completionRequirements ? (
          <div style={{ ...cardStyle, marginBottom: 24, background: "#f8fafc" }}>
            <h3 style={{ marginTop: 0 }}>Completion requirements</h3>
            <ul style={{ paddingLeft: 20, lineHeight: 1.85, color: "#334155", marginBottom: 0 }}>
              {Object.entries(completionRequirements).map(([key, value]) => (
                <li key={key}>{value}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <h2 style={{ marginBottom: 16 }}>Module sequence</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {modules.map((module) => {
            const status = enrollment ? moduleStatus(module.moduleNumber, enrollment) : "preview";
            const score = enrollment?.moduleScores?.[String(module.moduleNumber)];
            const statusColors = {
              complete: { border: "#86efac", bg: "#f0fdf4", label: "Complete", labelColor: "#15803d" },
              current: { border: "#93c5fd", bg: "#eff6ff", label: "Current", labelColor: "#2563eb" },
              available: { border: "#e2e8f0", bg: "#fff", label: "Available", labelColor: "#64748b" },
              locked: { border: "#e2e8f0", bg: "#f8fafc", label: "Locked", labelColor: "#94a3b8" },
              preview: { border: "#e2e8f0", bg: "#fff", label: "Preview", labelColor: "#64748b" },
            };
            const colors = statusColors[status] || statusColors.preview;

            return (
              <article key={module.moduleNumber} style={{ ...cardStyle, border: `1px solid ${colors.border}`, background: colors.bg }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ color: "#1d4ed8", fontWeight: 700, marginBottom: 4 }}>Module {module.moduleNumber}</div>
                    <h3 style={{ margin: 0 }}>{module.title}</h3>
                  </div>
                  <span style={{ color: colors.labelColor, fontWeight: 700, fontSize: 13 }}>
                    {colors.label}{score !== undefined ? ` (${score}%)` : ""}
                  </span>
                </div>
                {module.objective ? (
                  <p style={{ color: "#475569", lineHeight: 1.65, marginBottom: 8 }}>{module.objective}</p>
                ) : null}
                <div style={{ color: "#64748b", fontSize: 14, marginBottom: 12 }}>
                  {Array.isArray(module.lessons) ? `${module.lessons.length} lessons` : module.lessons ? `${module.lessons} lessons` : ""}
                  {module.practicalLab || module.lab ? ` | Lab: ${module.practicalLab || module.lab}` : ""}
                  {module.knowledgeCheck ? ` | Knowledge check required (80%)` : ""}
                </div>
                {status !== "locked" ? (
                  <a
                    href={`/academy/programs/${programId}/modules/${module.moduleNumber}`}
                    style={{ border: "1px solid #2563eb", background: status === "current" ? "#2563eb" : "#fff", color: status === "current" ? "#fff" : "#2563eb", borderRadius: 10, padding: "8px 14px", fontWeight: 700, textDecoration: "none", display: "inline-block" }}
                  >
                    {status === "complete" ? "Review module" : "Open module"}
                  </a>
                ) : (
                  <span style={{ color: "#94a3b8", fontSize: 14 }}>Complete prior modules to unlock</span>
                )}
              </article>
            );
          })}
        </div>
      </main>

      <ShellFooter ctaSet={academyCtaSets.home} />
    </div>
  );
}
