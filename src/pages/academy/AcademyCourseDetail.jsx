import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import AcademyStateAuthorityBanner from "../../components/AcademyStateAuthorityBanner";
import AcademyProviderTelemetryPanel from "../../components/AcademyProviderTelemetryPanel";
import { buildLessonHref, buildProgramHref, getCourseByKey } from "../../academyCatalog";
import { getApiCourseProgress } from "../../academyApiViewModels";
import { AcademyLmsProvider, useAcademyLmsContext } from "../../context/AcademyLmsContext";
import { pageShellStyle } from "../../publicShellStyles";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

function AcademyCourseDetailInner({ routeParams = {} }) {
  const academyLms = useAcademyLmsContext();
  const { academyState, meta, loading, mutationState } = academyLms;
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

  const progress = getApiCourseProgress(academyState, routeParams.programKey, routeParams.courseKey);
  const degraded = loading || !meta.authoritativeState || Boolean(meta.warning || mutationState.error);

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

      <AcademyStateAuthorityBanner meta={meta} mutationState={mutationState} loading={loading} />

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Course progress</div>
            <div style={{ color: "#334155", lineHeight: 1.7 }}>
              <div><strong>Program:</strong> {course.programTitle}</div>
              <div><strong>Lab:</strong> {course.lab}</div>
              <div><strong>Completion:</strong> {progress.completedLessons}/{progress.totalLessons} lessons</div>
            </div>
          </div>
          <div style={{ display: "grid", gap: 12, justifyItems: "end" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 30, fontWeight: 700 }}>{progress.percentComplete}%</div>
              <div style={{ color: "#475569" }}>{progress.completed ? "Course complete" : "Course in progress"}</div>
            </div>
            <AcademyProviderTelemetryPanel
              meta={meta}
              loading={loading}
              mutationState={mutationState}
              title="Course detail telemetry"
              style={{ minWidth: 320 }}
            />
          </div>
        </div>

        {degraded ? (
          <div style={{ border: "1px solid #f59e0b", background: "#fffbeb", color: "#78350f", borderRadius: 12, padding: 14, lineHeight: 1.7 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Course truth caution</div>
            <div>
              Lesson completion percentages on this course page now come from the shared Academy provider. Keep them informational only until the provider is authoritative and free of warnings or mutation errors.
            </div>
          </div>
        ) : null}
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

export default function AcademyCourseDetail(props) {
  return (
    <AcademyLmsProvider>
      <AcademyCourseDetailInner {...props} />
    </AcademyLmsProvider>
  );
}
