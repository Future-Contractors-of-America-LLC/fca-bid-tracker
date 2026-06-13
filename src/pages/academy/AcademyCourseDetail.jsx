import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import { buildLessonHref, buildProgramHref, getCourseByKey } from "../../academyCatalog";
import { getCourseProgress } from "../../academyProgressStore";
import { pageShellStyle } from "../../publicShellStyles";
import useCustomerSession from "../../hooks/useCustomerSession";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function AcademyCourseDetail({ routeParams = {} }) {
  const { session } = useCustomerSession();
  const course = getCourseByKey(routeParams.programKey, routeParams.courseKey);

  if (!course) {
    return (
      <div style={{ ...pageShellStyle, minHeight: "100vh", background: "#f8fafc", paddingTop: 40 }}>
        <div style={cardStyle}>
          <h1 style={{ marginTop: 0 }}>Course not found</h1>
          <a href="/academy/catalog">Return to Academy catalog</a>
        </div>
      </div>
    );
  }

  const progress = getCourseProgress(session, routeParams.programKey, routeParams.courseKey);

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        eyebrow={`${course.code} · ${course.credential}`}
        title={course.title}
        subtitle={course.summary}
        primaryHref={course.linkedSurface}
        primaryLabel={course.linkedLabel}
        secondaryHref={buildProgramHref(routeParams.programKey)}
        secondaryLabel="Back to program"
      />

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Course progress</div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ color: "#334155", lineHeight: 1.7 }}>
            <div><strong>Program:</strong> {course.programTitle}</div>
            <div><strong>Lab:</strong> {course.lab}</div>
            <div><strong>Completion:</strong> {progress.completedLessons}/{progress.totalLessons} lessons</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 30, fontWeight: 700 }}>{progress.percentComplete}%</div>
            <div style={{ color: "#475569" }}>{progress.completed ? "Course complete" : "Course in progress"}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {course.lessonsData.map((lesson, index) => (
          <div key={lesson.key} style={cardStyle}>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>Lesson {index + 1}</div>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>{lesson.title}</h2>
            <div style={{ color: "#334155", lineHeight: 1.7, marginBottom: 10 }}>{lesson.objective}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
              <div><strong>Type:</strong> {lesson.type}</div>
              <div><strong>Duration:</strong> {lesson.duration}</div>
              <div><strong>Assessment:</strong> {lesson.assessment}</div>
              <div><strong>Case focus:</strong> {lesson.caseStudy}</div>
            </div>
            <a href={buildLessonHref(routeParams.programKey, routeParams.courseKey, lesson.key)} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>Open lesson view</a>
          </div>
        ))}
      </div>

      <ShellFooter />
    </div>
  );
}
