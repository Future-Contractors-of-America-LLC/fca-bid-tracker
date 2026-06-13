import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import { buildCourseHref, getLessonByKey } from "../../academyCatalog";
import { buildApiBackedTranscript, getApiLessonStatus } from "../../academyApiViewModels";
import { pageShellStyle } from "../../publicShellStyles";
import useCustomerSession from "../../hooks/useCustomerSession";
import useAcademyLms from "../../hooks/useAcademyLms";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const buttonStyle = {
  border: "1px solid #2563eb",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
};

export default function AcademyLessonView({ routeParams = {} }) {
  const { updateSession } = useCustomerSession();
  const { academyState, meta, startLesson, completeLesson } = useAcademyLms();
  const lesson = getLessonByKey(routeParams.programKey, routeParams.courseKey, routeParams.lessonKey);

  if (!lesson) {
    return (
      <div style={{ ...pageShellStyle, minHeight: "100vh", background: "#f8fafc", paddingTop: 40 }}>
        <div style={cardStyle}>
          <h1 style={{ marginTop: 0 }}>Lesson not found</h1>
          <a href="/academy/catalog">Return to Academy catalog</a>
        </div>
      </div>
    );
  }

  const transcript = buildApiBackedTranscript(academyState);
  const transcriptEntry = transcript.find((entry) => entry.programKey === routeParams.programKey);
  const status = getApiLessonStatus(academyState, routeParams.programKey, routeParams.courseKey, routeParams.lessonKey);

  async function handleStart() {
    if (!transcriptEntry?.enrollmentId) return;
    await startLesson(transcriptEntry.enrollmentId, routeParams.programKey, routeParams.courseKey, routeParams.lessonKey);
    updateSession({ nextHref: buildCourseHref(routeParams.programKey, routeParams.courseKey) });
  }

  async function handleComplete() {
    if (!transcriptEntry?.enrollmentId) return;
    const derivedPercent = transcriptEntry?.totalLessons ? Math.min(100, Math.round(((transcriptEntry.completedLessons + 1) / transcriptEntry.totalLessons) * 100)) : 0;
    await completeLesson(transcriptEntry.enrollmentId, routeParams.programKey, routeParams.courseKey, routeParams.lessonKey, derivedPercent);
    updateSession({ nextHref: lesson.linkedSurface });
  }

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        eyebrow={`${lesson.courseTitle} · ${lesson.credential}`}
        title={lesson.title}
        subtitle={lesson.objective}
        primaryHref={lesson.linkedSurface}
        primaryLabel={lesson.linkedLabel}
        secondaryHref={buildCourseHref(routeParams.programKey, routeParams.courseKey)}
        secondaryLabel="Back to course"
      />

      <div style={{ ...cardStyle, marginBottom: 24, background: "#eff6ff", border: "1px solid #2563eb" }}>
        <div style={{ color: "#1d4ed8", fontWeight: 700, marginBottom: 8 }}>Lesson-progress spine</div>
        <div style={{ color: "#1e3a8a", lineHeight: 1.7 }}>
          Lesson progress is now converging on the shared Academy API-backed LMS spine. This route no longer presents lesson completion as browser-local truth; it reads from and writes to the same Academy state family as transcript, cohort, and credential posture.
        </div>
        <div style={{ color: "#475569", marginTop: 10 }}><strong>Source:</strong> {meta.backingSource} · {meta.persistenceState}</div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Lesson status</div>
            <div style={{ color: "#334155", lineHeight: 1.7 }}>
              <div><strong>Status:</strong> {status.status}</div>
              <div><strong>Started:</strong> {status.startedAt || "Not yet started"}</div>
              <div><strong>Completed:</strong> {status.completedAt || "Not yet completed"}</div>
              <div><strong>Enrollment:</strong> {transcriptEntry?.enrollmentId || "No active enrollment"}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={handleStart} disabled={!transcriptEntry?.enrollmentId} style={{ ...buttonStyle, background: "#eff6ff", color: "#1d4ed8", cursor: transcriptEntry?.enrollmentId ? "pointer" : "not-allowed" }}>Mark Started</button>
            <button type="button" onClick={handleComplete} disabled={!transcriptEntry?.enrollmentId} style={{ ...buttonStyle, background: "#2563eb", color: "#fff", cursor: transcriptEntry?.enrollmentId ? "pointer" : "not-allowed" }}>Mark Completed</button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={cardStyle}>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Instructional brief</div>
          <div style={{ color: "#334155", lineHeight: 1.8 }}>
            <div><strong>Type:</strong> {lesson.type}</div>
            <div><strong>Duration:</strong> {lesson.duration}</div>
            <div><strong>Assessment:</strong> {lesson.assessment}</div>
            <div><strong>Case study:</strong> {lesson.caseStudy}</div>
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Graduate-level prompts</div>
          <div style={{ color: "#334155", lineHeight: 1.8 }}>{lesson.prompt}</div>
          <div style={{ marginTop: 12 }}>
            <strong>Concepts</strong>
            <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#334155" }}>
              {lesson.concepts.map((concept) => (
                <li key={concept}>{concept}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Continue into live operating surface</div>
        <p style={{ color: "#334155", lineHeight: 1.8 }}>
          FCA Academy lessons now terminate in real operating surfaces rather than dead-end reading views. Complete the intellectual work here, then continue into the connected workspace route to practice the same discipline inside the product.
        </p>
        <a href={lesson.linkedSurface} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>{lesson.linkedLabel}</a>
      </div>

      <ShellFooter />
    </div>
  );
}
