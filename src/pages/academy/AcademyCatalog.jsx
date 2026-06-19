import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import PublicCtaRow from "../../components/PublicCtaRow";
import { getProgramsByLane, OFFERING_LANES } from "../../academyOfferings";
import { academyCatalog } from "../../academyCatalog";
import { academyCtaSets, shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { pageShellStyle } from "../../publicShellStyles";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const laneHeaderStyle = {
  borderBottom: "2px solid #1d4ed8",
  paddingBottom: 12,
  marginBottom: 20,
};

export default function AcademyCatalog() {
  const lanes = getProgramsByLane();
  const programCount = academyCatalog.programs.length;
  const laneCount = OFFERING_LANES.length;

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        compact
        eyebrow="FCA Academy"
        title="Programs by lane, degree, certification, and licensure"
        subtitle={`${programCount} complete programs organized across ${laneCount} lanes—apprenticeship pathways, degree tracks, professional certifications, licensure prep, and operator courses, each linked to live SaaS workflows.`}
        primaryHref={shellHeaderCtaSets.academy.primaryHref}
        primaryLabel={shellHeaderCtaSets.academy.primaryLabel}
        secondaryHref={shellHeaderCtaSets.academy.secondaryHref}
        secondaryLabel={shellHeaderCtaSets.academy.secondaryLabel}
        journey={shellJourney}
        currentJourney="academy"
      />

      {lanes.map((lane) => (
        <section key={lane.key} style={{ marginBottom: 40 }}>
          <div style={laneHeaderStyle}>
            <h2 style={{ margin: "0 0 6px", fontSize: "1.35rem" }}>{lane.label}</h2>
            <p style={{ margin: 0, color: "#475569", lineHeight: 1.65 }}>{lane.description}</p>
          </div>

          <div style={{ display: "grid", gap: 18 }}>
            {lane.programs.map((program) => (
              <article key={program.key} style={cardStyle}>
                <div style={{ color: "#1d4ed8", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                  {program.credential || lane.credentialType}
                </div>
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>{program.title}</h3>
                {program.audience ? (
                  <p style={{ color: "#475569", lineHeight: 1.65, marginTop: 0 }}>
                    <strong>Audience:</strong> {program.audience} · <strong>Duration:</strong> {program.duration}
                  </p>
                ) : null}
                {program.goal ? <p style={{ color: "#334155", lineHeight: 1.65 }}>{program.goal}</p> : null}

                {program.levels ? (
                  <div style={{ marginTop: 14 }}>
                    <strong>L1–L10 electrical apprenticeship levels</strong>
                    <ul style={{ paddingLeft: 20, lineHeight: 1.8, color: "#334155" }}>
                      {program.levels.map((level) => (
                        <li key={level.key}>{level.title} — {level.modules} modules</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {(program.courses || []).map((course) => (
                  <div key={course.code} style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #e2e8f0" }}>
                    <strong>{course.title || course.code}</strong>
                    <div style={{ color: "#64748b", fontSize: 14, marginBottom: 8 }}>{course.lessons} lessons · Lab: {course.lab}</div>
                    <ol style={{ paddingLeft: 20, lineHeight: 1.75, color: "#334155", margin: 0 }}>
                      {(course.lessonTitles || []).map((title) => (
                        <li key={title}>{title}</li>
                      ))}
                    </ol>
                  </div>
                ))}

                {program.linkedSurface ? (
                  <a href={program.linkedSurface} style={{ display: "inline-block", marginTop: 14, color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>
                    {program.linkedLabel || "Open in workspace"} →
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ))}

      <PublicCtaRow actions={academyCtaSets.productionClose} />
      <ShellFooter />
    </div>
  );
}
