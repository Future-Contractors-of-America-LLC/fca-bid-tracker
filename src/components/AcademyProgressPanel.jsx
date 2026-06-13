import { academyCatalog, buildCourseHref, buildProgramHref } from "../academyCatalog";
import { getCourseProgress, getProgramProgress } from "../academyProgressStore";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function AcademyProgressPanel({ session, programKey = null }) {
  const programs = programKey ? academyCatalog.programs.filter((program) => program.key === programKey) : academyCatalog.programs;

  return (
    <div style={cardStyle}>
      <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Progress and credential posture</div>
      <h2 style={{ marginTop: 0, marginBottom: 10 }}>Real LMS progression now tracks lesson, course, and program completion</h2>
      <div style={{ display: "grid", gap: 16 }}>
        {programs.map((program) => {
          const programProgress = getProgramProgress(session, program.key);

          return (
            <div key={program.key} style={{ border: "1px solid #dbe3ef", borderRadius: 14, padding: 16, background: "#f8fbff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ color: "#2563eb", fontWeight: 700 }}>{program.credential}</div>
                  <h3 style={{ marginTop: 6, marginBottom: 8 }}>{program.title}</h3>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 26, fontWeight: 700 }}>{programProgress.percentComplete}%</div>
                  <div style={{ color: "#475569" }}>{programProgress.completedLessons}/{programProgress.totalLessons} lessons complete</div>
                </div>
              </div>
              <div style={{ height: 10, background: "#dbeafe", borderRadius: 999, overflow: "hidden", margin: "8px 0 14px" }}>
                <div style={{ width: `${programProgress.percentComplete}%`, height: "100%", background: "linear-gradient(90deg, #2563eb 0%, #38bdf8 100%)" }} />
              </div>
              <div style={{ color: "#334155", lineHeight: 1.7, marginBottom: 12 }}>
                <div><strong>Courses complete:</strong> {programProgress.completedCourses}/{programProgress.totalCourses}</div>
                <div><strong>Credential status:</strong> {programProgress.credentialReady ? "Ready for issuance review" : "In progress"}</div>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {program.courses.map((course) => {
                  const courseProgress = getCourseProgress(session, program.key, course.key);
                  return (
                    <div key={course.key} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#fff" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                        <a href={buildCourseHref(program.key, course.key)} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>{course.code} · {course.title}</a>
                        <div style={{ color: "#475569" }}>{courseProgress.completedLessons}/{courseProgress.totalLessons} lessons</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {!programKey ? <div style={{ marginTop: 12 }}><a href={buildProgramHref(program.key)} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>Open program detail</a></div> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
