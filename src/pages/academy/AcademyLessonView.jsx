import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import { buildCourseHref, getLessonByKey } from "../../academyCatalog";
import { getLessonStatus, markLessonCompleted, markLessonStarted } from "../../academyProgressStore";
import { pageShellStyle } from "../../publicShellStyles";
import useCustomerSession from "../../hooks/useCustomerSession";

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
  const { session, updateSession } = useCustomerSession();
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

  const status = getLessonStatus(session, routeParams.programKey, routeParams.courseKey, routeParams.lessonKey);

  function handleStart() {
    markLessonStarted(session, routeParams.programKey, routeParams.courseKey, routeParams.lessonKey);
    updateSession({ nextHref: buildCourseHref(routeParams.programKey, routeParams.courseKey) });
    window.location.reload();
  }

  function handleComplete() {
    markLessonCompleted(session, routeParams.programKey, routeParams.courseKey, routeParams.lessonKey);
    updateSession({ nextHref: lesson.linkedSurface });
    window.location.reload();
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

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Lesson status</div>
            <div style={{ color: "#334155", lineHeight: 1.7 }}>
              <div><strong>Status:</strong> {status.status}</div>
              <div><strong>Started:</strong> {status.startedAt || "Not yet started"}</div>
              <div><strong>Completed:</strong> {status.completedAt || "Not yet completed"}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={handleStart} style={{ ...buttonStyle, background: "#eff6ff", color: "#1d4ed8" }}>Mark Started</button>
            <button type="button" onClick={handleComplete} style={{ ...buttonStyle, background: "#2563eb", color: "#fff" }}>Mark Completed</button>
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
