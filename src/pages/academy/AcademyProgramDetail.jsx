import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import AcademyProgressPanel from "../../components/AcademyProgressPanel";
import { buildCourseHref, getProgramByKey } from "../../academyCatalog";
import { AcademyLmsProvider, useAcademyLmsContext } from "../../context/AcademyLmsContext";
import { pageShellStyle } from "../../publicShellStyles";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

function AcademyProgramDetailInner({ routeParams = {} }) {
  const academyLms = useAcademyLmsContext();
  const program = getProgramByKey(routeParams.programKey);

  if (!program) {
    return (
      <div style={{ ...pageShellStyle, minHeight: "100vh", background: "#f8fafc", paddingTop: 40 }}>
        <div style={cardStyle}>
          <h1 style={{ marginTop: 0 }}>Program not found</h1>
          <a href="/academy/catalog">Return to Academy catalog</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        eyebrow={program.credential}
        title={program.title}
        subtitle={program.goal}
        primaryHref={program.linkedSurface}
        primaryLabel={program.linkedLabel}
        secondaryHref="/academy/catalog"
        secondaryLabel="Back to catalog"
      />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 18, padding: "14px 16px", border: "1px solid #dbe3ef", borderRadius: 18, background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)" }}>
        <FcaBrandMark compact />
        <AuricruxBrandMark compact />
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Program architecture</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div style={{ color: "#334155", lineHeight: 1.7 }}>
            <div><strong>Audience:</strong> {program.audience}</div>
            <div><strong>Duration:</strong> {program.duration}</div>
            <div><strong>Format:</strong> {program.format}</div>
            <div><strong>Outcome:</strong> {program.outcome}</div>
          </div>
          <div>
            <strong>Program outcomes</strong>
            <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#334155" }}>
              {program.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <AcademyProgressPanel academyLms={academyLms} programKey={program.key} />
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {program.courses.map((course) => (
          <div key={course.key} style={cardStyle}>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>{course.code}</div>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>{course.title}</h2>
            <div style={{ color: "#334155", lineHeight: 1.7, marginBottom: 10 }}>{course.summary}</div>
            <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
              <div><strong>Lab:</strong> {course.lab}</div>
              <div><strong>Lessons:</strong> {course.lessons}</div>
            </div>
            <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
              {course.lessonsData.map((lesson) => (
                <div key={lesson.key} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#f8fafc" }}>
                  <div style={{ fontWeight: 700 }}>{lesson.title}</div>
                  <div style={{ color: "#475569", lineHeight: 1.7 }}>{lesson.objective}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <a href={buildCourseHref(program.key, course.key)} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>Open course detail</a>
              <a href={course.linkedSurface} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>{course.linkedLabel}</a>
            </div>
          </div>
        ))}
      </div>

      <ShellFooter />
    </div>
  );
}

export default function AcademyProgramDetail(props) {
  return (
    <AcademyLmsProvider>
      <AcademyProgramDetailInner {...props} />
    </AcademyLmsProvider>
  );
}
