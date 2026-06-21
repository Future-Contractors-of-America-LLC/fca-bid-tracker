import { useEffect, useMemo, useState } from "react";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import KnowledgeCheckQuiz from "../../components/academy/KnowledgeCheckQuiz";
import useAcademyLms from "../../hooks/useAcademyLms";
import useCustomerSession from "../../hooks/useCustomerSession";
import { fetchAcademyProgram } from "../../api/academyClient";
import { publishAcademyContext } from "../../academyContext";
import { academyCtaSets, shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { pageShellStyle } from "../../publicShellStyles";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const tabStyle = (active) => ({
  border: "none",
  borderBottom: active ? "3px solid #2563eb" : "3px solid transparent",
  background: "transparent",
  color: active ? "#1d4ed8" : "#64748b",
  fontWeight: 700,
  padding: "10px 14px",
  cursor: "pointer",
  font: "inherit",
});

const iframeStyle = {
  width: "100%",
  minHeight: 420,
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  background: "#fff",
};

export default function AcademyModuleLesson({ routeParams = {} }) {
  const programId = routeParams.programId;
  const moduleNumber = Number(routeParams.moduleNumber);
  const { session } = useCustomerSession();
  const { academyState, completeModule } = useAcademyLms();
  const [programDetail, setProgramDetail] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loadingProgram, setLoadingProgram] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [quizBusy, setQuizBusy] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [activeTab, setActiveTab] = useState("lecture");
  const [overrideBusy, setOverrideBusy] = useState(false);

  const learnerId = session?.email || session?.customerId;
  const canInstructorOverride = Boolean(session?.authenticated && /admin|owner|instructor/i.test(session?.role || ""));

  const enrollment = useMemo(
    () => (academyState.enrollments || []).find((item) => item.programKey === programId && (!learnerId || item.learnerId === learnerId)),
    [academyState.enrollments, programId, learnerId],
  );

  useEffect(() => {
    if (!programId) return;
    setLoadError("");
    setLoadingProgram(true);
    fetchAcademyProgram(programId)
      .then((payload) => setProgramDetail(payload))
      .catch((error) => setLoadError(error.message || "Unable to load program."))
      .finally(() => setLoadingProgram(false));
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
    if (isModuleComplete || (moduleScore !== undefined && moduleScore >= 80)) {
      setQuizPassed(true);
    }
  }, [isModuleComplete, moduleScore]);

  useEffect(() => {
    if (!program || !module) {
      publishAcademyContext(null);
      return undefined;
    }
    publishAcademyContext({
      programKey: programId,
      programTitle: program.title,
      moduleNumber,
      moduleTitle: module.title,
      lane: program.lane || program.pathwayKey || "",
      objective: module.objective || "",
    });
    return () => publishAcademyContext(null);
  }, [program, module, programId, moduleNumber]);

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

  async function handleInstructorOverride() {
    if (!enrollment?.enrollmentId || !canInstructorOverride) return;
    setOverrideBusy(true);
    setActionMessage("");
    try {
      await completeModule(enrollment.enrollmentId, {
        moduleNumber,
        moduleTitle: module?.title,
        nextLesson: modules.find((item) => item.moduleNumber === moduleNumber + 1)?.title,
        instructorOverride: true,
      });
      setQuizPassed(true);
      setActionMessage(`Instructor override applied for module ${moduleNumber}.`);
    } catch (error) {
      setActionMessage(error.message || "Unable to apply instructor override.");
    } finally {
      setOverrideBusy(false);
    }
  }

  function renderOverview() {
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
        {module.deliverable ? (
          <div style={{ padding: 14, borderRadius: 12, background: "#fffbeb", border: "1px solid #fde68a" }}>
            <strong style={{ color: "#b45309" }}>Deliverable</strong>
            <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 0 }}>{module.deliverable}</p>
          </div>
        ) : null}
      </div>
    );
  }

  function renderLecturePanel() {
    const lectureSrc = module?.auricruxLectureUrl || module?.lectureUrl || module?.mediaUrl;
    if (lectureSrc) {
      return (
        <iframe
          title={`Module ${moduleNumber} Auricrux lecture`}
          src={lectureSrc}
          style={iframeStyle}
          loading="lazy"
        />
      );
    }
    return renderOverview();
  }

  function renderSkillsDemoPanel() {
    if (module?.auricruxSkillsDemoUrl) {
      return (
        <iframe
          title={`Module ${moduleNumber} Auricrux skills demonstration`}
          src={module.auricruxSkillsDemoUrl}
          style={iframeStyle}
          loading="lazy"
        />
      );
    }
    if (Array.isArray(module?.lessonMedia) && module.lessonMedia.length > 0) {
      const first = module.lessonMedia.find((item) => item.skillsDemoUrl || item.labDemoUrl);
      const demoSrc = first?.skillsDemoUrl || first?.labDemoUrl;
      if (demoSrc) {
        return (
          <iframe
            title={`Module ${moduleNumber} skills demonstration`}
            src={demoSrc}
            style={iframeStyle}
            loading="lazy"
          />
        );
      }
    }
    return <p style={{ color: "#64748b", lineHeight: 1.65 }}>No Auricrux skills demonstration is linked for this module yet.</p>;
  }

  function renderLabPanel() {
    if (module?.labUrl) {
      return (
        <iframe
          title={`Module ${moduleNumber} lab`}
          src={module.labUrl}
          style={iframeStyle}
          loading="lazy"
        />
      );
    }
    if (module?.practicalLab || module?.lab) {
      return (
        <div style={{ padding: 14, borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <strong style={{ color: "#15803d" }}>Practical lab</strong>
          <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 0 }}>{module.practicalLab || module.lab}</p>
        </div>
      );
    }
    return <p style={{ color: "#64748b", lineHeight: 1.65 }}>No lab workbook is linked for this module yet.</p>;
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
        {loadingProgram ? (
          <div style={{ ...cardStyle, color: "#475569" }}>Loading module content...</div>
        ) : null}

        {loadError ? (
          <div style={{ ...cardStyle, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b" }}>{loadError}</div>
        ) : null}

        {programDetail?.accreditationStandards ? (
          <div style={{ ...cardStyle, marginBottom: 16, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <strong style={{ color: "#15803d" }}>Accreditation & governing bodies</strong>
            <ul style={{ paddingLeft: 20, lineHeight: 1.8, color: "#475569", marginBottom: 0 }}>
              {(programDetail.accreditationStandards.governingBodies || []).map((body) => (
                <li key={body}>{body}</li>
              ))}
            </ul>
          </div>
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

              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", borderBottom: "1px solid #e2e8f0", marginBottom: 16 }}>
                <button type="button" style={tabStyle(activeTab === "lecture")} onClick={() => setActiveTab("lecture")}>Auricrux lecture</button>
                <button type="button" style={tabStyle(activeTab === "skills")} onClick={() => setActiveTab("skills")}>Skills demo</button>
                <button type="button" style={tabStyle(activeTab === "lab")} onClick={() => setActiveTab("lab")}>Lab workbook</button>
                {!isLocked && !isModuleComplete ? (
                  <button type="button" style={tabStyle(activeTab === "quiz")} onClick={() => setActiveTab("quiz")}>Knowledge check</button>
                ) : null}
              </div>

              {activeTab === "lecture" ? renderLecturePanel() : null}
              {activeTab === "skills" ? renderSkillsDemoPanel() : null}
              {activeTab === "lab" ? renderLabPanel() : null}
              {activeTab === "quiz" && !isLocked && !isModuleComplete ? (
                <KnowledgeCheckQuiz module={module} onSubmit={handleQuizSubmit} busy={quizBusy} />
              ) : null}
            </article>

            <div style={{ ...cardStyle, marginBottom: 16, border: "1px solid #e8c46a", background: "#fffdf7" }}>
              <strong style={{ color: "#8a6a14" }}>Ask Auricrux about this module</strong>
              <p style={{ color: "#475569", lineHeight: 1.65, marginBottom: 0 }}>
                Open the Auricrux dock and ask about module objectives, lab steps, or exam prep for {module.title}.
                Auricrux receives your current program and module context automatically.
              </p>
            </div>

            {canInstructorOverride && enrollment && !isModuleComplete && !isLocked ? (
              <div style={{ ...cardStyle, marginBottom: 16, border: "1px solid #cbd5e1", background: "#f8fafc" }}>
                <strong>Instructor override</strong>
                <p style={{ color: "#475569", lineHeight: 1.65 }}>
                  Mark this module complete without a knowledge check score when verified in the field.
                </p>
                <button
                  type="button"
                  onClick={handleInstructorOverride}
                  disabled={overrideBusy}
                  style={{ border: "1px solid #64748b", background: "#fff", color: "#0f172a", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}
                >
                  {overrideBusy ? "Applying..." : "Apply instructor override"}
                </button>
              </div>
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
