import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import PublicCtaRow from "../../components/PublicCtaRow";
import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import { academyCatalog } from "../../academyCatalog";
import { academyCtaSets, publicBodyCtaSets, shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { pageShellStyle } from "../../publicShellStyles";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const detailCardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 14,
  background: "#f8fafc",
};

export default function AcademyCatalog() {
  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        eyebrow="FCA Academy Catalog"
        title="Real classroom programs tied to contractor operations"
        subtitle="Each FCA Academy program is mapped to real SaaS workflows so curriculum, labs, and credentials support live project execution rather than detached training theory."
        primaryHref={shellHeaderCtaSets.academy.primaryHref}
        primaryLabel={shellHeaderCtaSets.academy.primaryLabel}
        secondaryHref={shellHeaderCtaSets.academy.secondaryHref}
        secondaryLabel={shellHeaderCtaSets.academy.secondaryLabel}
        journey={shellJourney}
        currentJourney="academy"
      />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 18, padding: "14px 16px", border: "1px solid #dbe3ef", borderRadius: 18, background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)" }}>
        <FcaBrandMark compact />
        <AuricruxBrandMark compact />
      </div>

      <div style={{ ...cardStyle, marginBottom: 24, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Academy catalog</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Five complete track-specific courses are now live in one place</h2>
        <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 0 }}>
          This catalog includes a specific apprenticeship course, certification course, degree course, licensure course, and FCA user-guide how-to course, each with lessons, assignments, quizzes, tests, labs, performance profiles, completion requirements, evaluation rubrics, and capstone projects.
        </p>
      </div>

      <div style={{ display: "grid", gap: 18 }}>
        {academyCatalog.programs.map((program) => (
          <section key={program.key} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
              <div>
                <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>{program.credential}</div>
                <h2 style={{ marginTop: 0, marginBottom: 8 }}>{program.title}</h2>
                <div style={{ color: "#475569", lineHeight: 1.7 }}>
                  <div><strong>Audience:</strong> {program.audience}</div>
                  <div><strong>Duration:</strong> {program.duration}</div>
                  <div><strong>Format:</strong> {program.format}</div>
                </div>
              </div>
              <div style={{ maxWidth: 420, color: "#334155", lineHeight: 1.7 }}>
                <strong>Program goal</strong>
                <div>{program.goal}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 16 }}>
              <div>
                <h3 style={{ marginTop: 0 }}>Outcomes</h3>
                <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#334155" }}>
                  {program.outcomes.map((outcome) => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 style={{ marginTop: 0 }}>Course sequence</h3>
                <div style={{ display: "grid", gap: 12 }}>
                  {program.courses.map((course) => (
                    <div key={course.code} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
                      <div style={{ color: "#2563eb", fontWeight: 700 }}>{course.code}</div>
                      <div style={{ fontWeight: 700, margin: "6px 0" }}>{course.title}</div>
                      <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 10 }}>
                        <div><strong>Lessons:</strong> {course.lessons}</div>
                        <div><strong>Lab:</strong> {course.lab}</div>
                      </div>
                      <div style={{ display: "grid", gap: 12 }}>
                        <div style={detailCardStyle}><div style={{ fontWeight: 700, marginBottom: 6 }}>Lessons</div><div style={{ color: "#334155", lineHeight: 1.8 }}>{course.lessonTitles.map((lesson) => <div key={lesson}>• {lesson}</div>)}</div></div>
                        <div style={detailCardStyle}><div style={{ fontWeight: 700, marginBottom: 6 }}>Assignments</div><div style={{ color: "#334155", lineHeight: 1.8 }}>{course.assignments.map((assignment) => <div key={assignment}>• {assignment}</div>)}</div></div>
                        <div style={detailCardStyle}><div style={{ fontWeight: 700, marginBottom: 6 }}>Quizzes</div><div style={{ color: "#334155", lineHeight: 1.8 }}>{course.quizzes.map((quiz) => <div key={quiz}>• {quiz}</div>)}</div></div>
                        <div style={detailCardStyle}><div style={{ fontWeight: 700, marginBottom: 6 }}>Tests</div><div style={{ color: "#334155", lineHeight: 1.8 }}>{course.tests.map((test) => <div key={test}>• {test}</div>)}</div></div>
                        <div style={detailCardStyle}><div style={{ fontWeight: 700, marginBottom: 6 }}>Labs</div><div style={{ color: "#334155", lineHeight: 1.8 }}>{course.labs.map((lab) => <div key={lab}>• {lab}</div>)}</div></div>
                        <div style={detailCardStyle}><div style={{ fontWeight: 700, marginBottom: 6 }}>Performance profile</div><div style={{ color: "#334155", lineHeight: 1.8 }}><div><strong>Role:</strong> {course.performanceProfile.role}</div><div><strong>Measures:</strong> {course.performanceProfile.measures.join(", ")}</div></div></div>
                        <div style={detailCardStyle}><div style={{ fontWeight: 700, marginBottom: 6 }}>Completion requirements</div><div style={{ color: "#334155", lineHeight: 1.8 }}>{course.completionRequirements.map((item) => <div key={item}>• {item}</div>)}</div></div>
                        <div style={detailCardStyle}><div style={{ fontWeight: 700, marginBottom: 6 }}>Evaluation rubric</div><div style={{ color: "#334155", lineHeight: 1.8 }}>{course.evaluationRubric.map((item) => <div key={item}>• {item}</div>)}</div></div>
                        <div style={detailCardStyle}><div style={{ fontWeight: 700, marginBottom: 6 }}>Capstone project</div><div style={{ color: "#334155", lineHeight: 1.8 }}>{course.capstoneProject.map((item) => <div key={item}>• {item}</div>)}</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <a href={program.linkedSurface} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>{program.linkedLabel}</a>
            </div>
          </section>
        ))}
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Continue through FCA</h2>
        <PublicCtaRow actions={academyCtaSets.connectedPortalRoutes} style={{ display: "grid", gap: 12 }} />
        <div style={{ marginTop: 14 }}>
          <PublicCtaRow actions={publicBodyCtaSets.academyEntry} />
        </div>
      </div>

      <ShellFooter />
    </div>
  );
}
