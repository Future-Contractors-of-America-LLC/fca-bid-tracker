import { useMemo } from "react";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import PublicCtaRow from "../../components/PublicCtaRow";
import AcademyBuyButton from "../../components/AcademyBuyButton";
import useAcademyLms from "../../hooks/useAcademyLms";
import { ELECTRICAL_APPRENTICESHIP_LEVELS, OSHA_CERT_UNITS, PROJECT_CONTROLS_CERT_UNITS, organizeApiCatalogByLane } from "../../academyOfferings";
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

function ProgramCard({ program }) {
  const isPreview = program.source === "catalog-preview";
  const moduleCount = program.modules?.length || program.duration || 0;

  return (
    <article key={program.key} style={cardStyle}>
      <div style={{ color: "#1d4ed8", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
        {program.credential || program.credentialTitle}
        {isPreview ? <span style={{ color: "#64748b", fontWeight: 400, marginLeft: 8 }}>(Preview)</span> : null}
      </div>
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>{program.title}</h3>
      <p style={{ color: "#475569", lineHeight: 1.65, marginTop: 0 }}>
        {program.pathway ? <><strong>Pathway:</strong> {program.pathway} | </> : null}
        {program.track ? <><strong>Track:</strong> {program.track} | </> : null}
        {program.level ? <><strong>Level:</strong> {program.level} | </> : null}
        <strong>Duration:</strong> {moduleCount} modules
      </p>
      {program.completionRule ? (
        <p style={{ color: "#334155", lineHeight: 1.65 }}>{program.completionRule}</p>
      ) : program.goal ? (
        <p style={{ color: "#334155", lineHeight: 1.65 }}>{program.goal}</p>
      ) : null}
      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        {isPreview ? (
          program.linkedSurface ? (
            <a href={program.linkedSurface} style={{ border: "1px solid #64748b", background: "#64748b", color: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, textDecoration: "none" }}>
              {program.linkedLabel || "Open preview"}
            </a>
          ) : null
        ) : (
          <>
            <a href={`/academy/programs/${program.key}`} style={{ border: "1px solid #2563eb", background: "#2563eb", color: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, textDecoration: "none" }}>
              Open program
            </a>
            <AcademyBuyButton
              programKey={program.key}
              retailPrice={program.retailPrice}
              lane={program.lane}
              variant="secondary"
            />
          </>
        )}
      </div>
      {Array.isArray(program.modules) && program.modules.length > 0 ? (
        <details style={{ marginTop: 14 }}>
          <summary style={{ cursor: "pointer", fontWeight: 700, color: "#334155" }}>
            {program.modules.length} modules
          </summary>
          <ol style={{ paddingLeft: 20, lineHeight: 1.8, color: "#334155", marginTop: 10 }}>
            {program.modules.map((module) => (
              <li key={module.moduleNumber}>
                {module.title}
                {module.lessons ? ` - ${typeof module.lessons === "number" ? module.lessons : module.lessons.length} lessons` : ""}
                {module.lab ? ` | Lab: ${module.lab}` : ""}
              </li>
            ))}
          </ol>
        </details>
      ) : null}
    </article>
  );
}

export default function AcademyCatalog() {
  const { academyState, meta } = useAcademyLms();
  const apiPrograms = academyState?.catalog?.programs || [];
  const catalogLanes = apiPrograms.length > 0
    ? (academyState?.catalog?.lanes || []).length > 0
      ? academyState.catalog.lanes
      : undefined
    : undefined;

  const lanes = useMemo(
    () => organizeApiCatalogByLane(apiPrograms, catalogLanes),
    [apiPrograms, catalogLanes],
  );

  const programCount = apiPrograms.length || lanes.reduce((sum, lane) => sum + lane.programs.length, 0);
  const apprenticeshipLane = lanes.find((lane) => lane.key === "apprenticeship");

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        compact
        eyebrow="FCA Academy"
        title="Programs by lane"
        subtitle={`${programCount} programs organized across apprenticeship, certification, degree, licensure, and professional development lanes.`}
        primaryHref="/academy/dashboard"
        primaryLabel="Learner dashboard"
        secondaryHref={shellHeaderCtaSets.academy.secondaryHref}
        secondaryLabel={shellHeaderCtaSets.academy.secondaryLabel}
        journey={shellJourney}
        currentJourney="academy"
      />

      {apiPrograms.length > 0 ? (
        <div style={{ ...cardStyle, marginBottom: 24, border: "1px solid #bfdbfe", background: "#eff6ff" }}>
          <strong style={{ color: "#1d4ed8" }}>Live catalog</strong>
          <span style={{ color: "#475569", marginLeft: 8 }}>
            {apiPrograms.length} programs from {meta.backingSource || "Auricrux-Central"}
          </span>
        </div>
      ) : (
        <div style={{ ...cardStyle, marginBottom: 24, border: "1px solid #fde68a", background: "#fffbeb", color: "#92400e" }}>
          Backend catalog unavailable. Showing preview programs for degree and licensure lanes.
        </div>
      )}

      {apprenticeshipLane && apprenticeshipLane.programs.some((p) => p.key?.startsWith("electrical-core")) ? (
        <section style={{ ...cardStyle, marginBottom: 32 }}>
          <h2 style={{ marginTop: 0 }}>Electrical apprenticeship pathway (L1-L10)</h2>
          <p style={{ color: "#475569", lineHeight: 1.65 }}>
            NCCER-style level progression from core apprenticeship through commercial power systems specialization.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {ELECTRICAL_APPRENTICESHIP_LEVELS.map((level) => {
              const program = apiPrograms.find((item) => item.key === level.key);
              return (
                <a
                  key={level.key}
                  href={program ? `/academy/programs/${level.key}` : "/academy/catalog"}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    border: "1px solid #dbeafe",
                    borderRadius: 12,
                    padding: 14,
                    background: program ? "#fff" : "#f8fafc",
                  }}
                >
                  <div style={{ color: "#1d4ed8", fontWeight: 700, fontSize: 13 }}>Level {level.level}</div>
                  <strong>{level.title}</strong>
                  <div style={{ color: "#64748b", fontSize: 14, marginTop: 6 }}>{level.modules} modules</div>
                </a>
              );
            })}
          </div>
        </section>
      ) : null}

      {lanes.find((lane) => lane.key === "certification")?.programs.some((p) => p.key === "project-controls") ? (
        <section style={{ ...cardStyle, marginBottom: 32 }}>
          <h2 style={{ marginTop: 0 }}>Project controls certification pathway</h2>
          <p style={{ color: "#475569", lineHeight: 1.65 }}>
            Pearson-style certification progression from document governance through portfolio controls and executive reporting.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {PROJECT_CONTROLS_CERT_UNITS.map((unit) => {
              const program = apiPrograms.find((item) => item.key === unit.key);
              return (
                <a
                  key={unit.key}
                  href={program ? `/academy/programs/${unit.key}` : "/academy/catalog"}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    border: "1px solid #bbf7d0",
                    borderRadius: 12,
                    padding: 14,
                    background: program ? "#fff" : "#f8fafc",
                  }}
                >
                  <div style={{ color: "#15803d", fontWeight: 700, fontSize: 13 }}>Unit {unit.unit}</div>
                  <strong>{unit.title}</strong>
                  <div style={{ color: "#64748b", fontSize: 14, marginTop: 6 }}>{unit.modules} modules</div>
                </a>
              );
            })}
          </div>
        </section>
      ) : null}

      {lanes.find((lane) => lane.key === "certification")?.programs.some((p) => p.key === "cert-osha-30-construction") ? (
        <section style={{ ...cardStyle, marginBottom: 32 }}>
          <h2 style={{ marginTop: 0 }}>Safety and OSHA certification pathway</h2>
          <p style={{ color: "#475569", lineHeight: 1.65 }}>
            Field readiness through OSHA 10/30, fall protection competent person, and environmental safety credentials.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {OSHA_CERT_UNITS.map((unit) => {
              const program = apiPrograms.find((item) => item.key === unit.key);
              return (
                <a
                  key={unit.key}
                  href={program ? `/academy/programs/${unit.key}` : "/academy/catalog"}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    border: "1px solid #bbf7d0",
                    borderRadius: 12,
                    padding: 14,
                    background: program ? "#fff" : "#f8fafc",
                  }}
                >
                  <div style={{ color: "#15803d", fontWeight: 700, fontSize: 13 }}>Unit {unit.unit}</div>
                  <strong>{unit.title}</strong>
                  <div style={{ color: "#64748b", fontSize: 14, marginTop: 6 }}>{unit.modules} modules</div>
                </a>
              );
            })}
          </div>
        </section>
      ) : null}

      {lanes.map((lane) => (
        lane.programs.length > 0 ? (
          <section key={lane.key} style={{ marginBottom: 40 }}>
            <div style={laneHeaderStyle}>
              <h2 style={{ margin: "0 0 6px", fontSize: "1.35rem" }}>{lane.label}</h2>
              <p style={{ margin: 0, color: "#475569", lineHeight: 1.65 }}>{lane.description}</p>
            </div>
            <div style={{ display: "grid", gap: 18 }}>
              {lane.programs.map((program) => (
                <ProgramCard key={program.key} program={program} />
              ))}
            </div>
          </section>
        ) : null
      ))}

      <PublicCtaRow actions={academyCtaSets.productionClose} />
      <ShellFooter />
    </div>
  );
}
