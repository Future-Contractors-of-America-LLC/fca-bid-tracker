import { useEffect, useMemo, useState } from "react";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import KnowledgeCheckQuiz from "../../components/academy/KnowledgeCheckQuiz";
import FcaSafetySiteLab from "../../components/immersive/FcaSafetySiteLab";
import AuricruxImmersiveHint from "../../components/immersive/AuricruxImmersiveHint";
import useAcademyLms from "../../hooks/useAcademyLms";
import useCustomerSession from "../../hooks/useCustomerSession";
import useImmersiveNextActions from "../../hooks/useImmersiveNextActions";
import { fetchAcademyProgram } from "../../api/academyClient";
import { completeImmersiveSession, startImmersiveSession } from "../../api/immersiveClient";
import { academyCtaSets, shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { pageShellStyle } from "../../publicShellStyles";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function AcademyModuleLesson({ routeParams = {} }) {
  const programId = routeParams.programId;
  const moduleNumber = Number(routeParams.moduleNumber);
  const { session } = useCustomerSession();
  const { academyState, completeModule } = useAcademyLms();
  const immersiveActions = useImmersiveNextActions();
  const [programDetail, setProgramDetail] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [quizBusy, setQuizBusy] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [immersiveSessionId, setImmersiveSessionId] = useState("");
  const [labComplete, setLabComplete] = useState(false);

  const isCtin410Module1 = programId === "deg-ctin-410" && moduleNumber === 1;

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
  const module = modules.find((item) => Number(item.moduleNumber) === moduleNumber);
  const completionRequirements = programDetail?.completionRequirements;

  const completedNumbers = enrollment?.completedModuleNumbers || [];
  const moduleScore = enrollment?.moduleScores?.[String(moduleNumber)];
  const isModuleComplete = completedNumbers.includes(moduleNumber);
  const priorComplete = moduleNumber <= 1 || completedNumbers.includes(moduleNumber - 1) || (enrollment?.completedModules || 0) >= moduleNumber - 1;
  const isLocked = enrollment && !priorComplete && !isModuleComplete;

  useEffect(() => {
    if (!isCtin410Module1 || immersiveSessionId) return;
    startImmersiveSession({
      experienceId: "fca-academy-ctin410-m1",
      userId: learnerId,
      deviceType: typeof navigator !== "undefined" && navigator.xr ? "webxr-capable" : "desktop",
      sourceRoute: `/academy/programs/${programId}/modules/${moduleNumber}`,
    })
      .then((payload) => setImmersiveSessionId(payload.session?.id || ""))
      .catch(() => {});
  }, [isCtin410Module1, immersiveSessionId, learnerId, programId, moduleNumber]);

  useEffect(() => {
    if (isModuleComplete || (moduleScore !== undefined && moduleScore >= 80)) {
      setQuizPassed(true);
    }
  }, [isModuleComplete, moduleScore]);

  useEffect(() => {
    if (isCtin410Module1 && isModuleComplete) {
      setLabComplete(true);
    }
  }, [isCtin410Module1, isModuleComplete]);

  async function handleLabComplete(result) {
    setLabComplete(true);
    try {
      await completeImmersiveSession({
        sessionId: result.sessionId || immersiveSessionId,
        findings: result.findings,
        score: result.score,
        sourceRoute: `/academy/programs/${programId}/modules/${moduleNumber}`,
      });
      setActionMessage(`FCA simulation lab complete. Score: ${result.score}%.`);
    } catch (error) {
      setActionMessage(error.message || "Lab completed locally; session save pending.");
    }
  }

  async function handleQuizSubmit(score) {
    if (!enrollment?.enrollmentId) {
      setActionMessage("Enroll in this program to save your knowledge check score.");
      return;
    }
    if (score < 80) {
      setActionMessage("Score below 80 percent. Review the lesson content and try again.");
      return;
    }
    setQuizBusy(true);
    setActionMessage("");
    try {
      await completeModule(enrollment.enrollmentId, {
        moduleNumber,
        moduleTitle: module?.title,
        nextLesson: modules.find((item) => item.moduleNumber === moduleNumber + 1)?.title,
        knowledgeCheckScore: score,
      });
      setQuizPassed(true);
      setActionMessage(`Module ${moduleNumber} complete. Score: ${score}%.`);
    } catch (error) {
      setActionMessage(error.message || "Unable to save module completion.");
    } finally {
      setQuizBusy(false);
    }
  }

  function renderLessonSections() {
    if (!module) return null;
    if (module.contentHtml) {
      return (
        <div
          style={{ color: "#334155", lineHeight: 1.75 }}
          dangerouslySetInnerHTML={{ __html: module.contentHtml }}
        />
      );
    }
    return (
      <div style={{ display: "grid", gap: 16 }}>
        {module.objective ? (
          <div style={{ padding: 14, borderRadius: 12, background: "#eff6ff", border: "1px solid #bfdbfe" }}>
            <strong style={{ color: "#1d4ed8" }}>Learning objective</strong>
            <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 0 }}>{module.objective}</p>
          </div>
        ) : null}
        {Array.isArray(module.lessons) && module.lessons.length > 0 ? (
          <div>
            <strong style={{ color: "#0f172a" }}>Lesson content</strong>
            <ol style={{ paddingLeft: 20, lineHeight: 1.85, color: "#334155", marginTop: 10 }}>
              {module.lessons.map((lesson) => (
                <li key={typeof lesson === "string" ? lesson : lesson.title}>
                  {typeof lesson === "string" ? lesson : lesson.title}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
        {module.practicalLab || module.lab ? (
          <div style={{ padding: 14, borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <strong style={{ color: "#15803d" }}>Practical lab</strong>
            <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 0 }}>{module.practicalLab || module.lab}</p>
          </div>
        ) : null}
        {module.deliverable ? (
          <div style={{ padding: 14, borderRadius: 12, background: "#fffbeb", border: "1px solid #fde68a" }}>
            <strong style={{ color: "#b45309" }}>Deliverable</strong>
            <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 0 }}>{module.deliverable}</p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        compact
        eyebrow="FCA Academy"
        title={module ? `Module ${moduleNumber}: ${module.title}` : "Module lesson"}
        subtitle={program?.title || "Structured module lesson with knowledge check."}
        primaryHref={shellHeaderCtaSets.academy.primaryHref}
        primaryLabel={shellHeaderCtaSets.academy.primaryLabel}
        secondaryHref={`/academy/programs/${programId}`}
        secondaryLabel="Back to program"
        journey={shellJourney}
        currentJourney="academy"
      />

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px 48px" }}>
        {loadError ? (
          <div style={{ ...cardStyle, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b" }}>{loadError}</div>
        ) : null}

        {completionRequirements ? (
          <div style={{ ...cardStyle, marginBottom: 16, background: "#f8fafc" }}>
            <strong>Completion requirements</strong>
            <ul style={{ paddingLeft: 20, lineHeight: 1.8, color: "#475569", marginBottom: 0 }}>
              {Object.entries(completionRequirements).map(([key, value]) => (
                <li key={key}>{value}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {!enrollment ? (
          <div style={{ ...cardStyle, marginBottom: 16, border: "1px solid #fde68a", background: "#fffbeb" }}>
            <a href={`/academy/programs/${programId}`} style={{ color: "#b45309", fontWeight: 700 }}>Enroll in this program</a>
            {" "}to track progress and submit your knowledge check.
          </div>
        ) : null}

        {isLocked ? (
          <div style={{ ...cardStyle, marginBottom: 16, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b" }}>
            Complete module {moduleNumber - 1} before starting this module.
          </div>
        ) : null}

        {isCtin410Module1 ? (
          <AuricruxImmersiveHint
            actions={immersiveActions.items.filter((item) => item.experienceId === "fca-academy-ctin410-m1" || item.category?.includes("immersive"))}
            title="Auricrux lab guidance"
          />
        ) : null}

        {module ? (
          <>
            <article style={{ ...cardStyle, marginBottom: 20 }}>
              <div style={{ color: "#1d4ed8", fontWeight: 700, marginBottom: 6 }}>
                Module {moduleNumber} of {modules.length}
              </div>
              <h2 style={{ marginTop: 0 }}>{module.title}</h2>
              {isModuleComplete ? (
                <div style={{ color: "#15803d", fontWeight: 700, marginBottom: 12 }}>
                  Completed {moduleScore !== undefined ? `(score: ${moduleScore}%)` : ""}
                </div>
              ) : null}
              {renderLessonSections()}
            </article>

            {isCtin410Module1 && !isLocked ? (
              <article style={{ ...cardStyle, marginBottom: 20, border: "1px solid #bfdbfe", background: "#f8fafc" }}>
                <FcaSafetySiteLab sessionId={immersiveSessionId} onSessionComplete={handleLabComplete} />
                {!labComplete ? (
                  <p style={{ color: "#64748b", marginBottom: 0 }}>
                    Complete the simulation lab, then pass the knowledge check below.
                  </p>
                ) : null}
              </article>
            ) : null}

            {!isLocked && !isModuleComplete ? (
              <KnowledgeCheckQuiz module={module} onSubmit={handleQuizSubmit} busy={quizBusy} />
            ) : null}

            {quizPassed && isModuleComplete && moduleNumber < modules.length ? (
              <div style={{ ...cardStyle, marginTop: 16 }}>
                <strong>Next module</strong>
                <p style={{ color: "#475569", lineHeight: 1.65 }}>
                  Continue to module {moduleNumber + 1}.
                </p>
                <a
                  href={`/academy/programs/${programId}/modules/${moduleNumber + 1}`}
                  style={{ border: "1px solid #2563eb", background: "#2563eb", color: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, textDecoration: "none", display: "inline-block" }}
                >
                  Open module {moduleNumber + 1}
                </a>
              </div>
            ) : null}
          </>
        ) : null}

        {actionMessage ? (
          <div style={{ marginTop: 16, color: actionMessage.includes("below") || actionMessage.includes("Unable") ? "#991b1b" : "#15803d" }}>
            {actionMessage}
          </div>
        ) : null}
      </main>

      <ShellFooter ctaSet={academyCtaSets.home} />
    </div>
  );
}
