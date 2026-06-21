import { useMemo } from "react";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import PublicCtaRow from "../../components/PublicCtaRow";
import useAcademyLms from "../../hooks/useAcademyLms";
import { findCatalogPlacement, organizeCatalogHierarchy } from "../../academyOfferings";
import { getCatalogIntegrity } from "../../academyCatalogIntegrity";
import { getPathwayLmsConfig } from "../../academyPathwayLms";
import { getCertificationAgencyAlignment, getApprenticeshipCompliance, getDegreeAccreditationFootnote } from "../../academyCatalogTaxonomy";
import { academyCtaSets, shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { pageShellStyle } from "../../publicShellStyles";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const sectionCardStyle = {
  ...cardStyle,
  cursor: "pointer",
  textDecoration: "none",
  color: "inherit",
  display: "block",
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
};

function readCatalogParams() {
  if (typeof window === "undefined") return { pathwayKey: "", topicKey: "" };
  const params = new URLSearchParams(window.location.search);
  return {
    pathwayKey: params.get("pathway") || params.get("lane") || "",
    topicKey: params.get("topic") || "",
  };
}

function catalogHref(pathwayKey, topicKey) {
  const params = new URLSearchParams();
  if (pathwayKey) params.set("pathway", pathwayKey);
  if (topicKey) params.set("topic", topicKey);
  const query = params.toString();
  return query ? `/academy/catalog?${query}` : "/academy/catalog";
}

function moduleCount(program) {
  return program.modules?.length || program.courses?.[0]?.lessons || program.courses?.[0]?.lessonTitles?.length || 0;
}

function CourseCard({ program, topicKey, pathwayKey }) {
  const enrollment = program.enrollment || {};
  const syllabusLines = program.moduleTitles
    || program.courses?.[0]?.lessonTitles
    || program.modules?.map((module) => module.title)
    || [];
  const agency = program.issuingAgency || (pathwayKey === "certification" ? getCertificationAgencyAlignment(topicKey)?.primary : null);
  const apprenticeship = pathwayKey === "apprenticeship" ? getApprenticeshipCompliance(topicKey) : null;
  const degreeAcc = pathwayKey === "degree" ? (program.accreditationBody || getDegreeAccreditationFootnote(program.degreeLevel)?.accreditationBody) : null;
  const stateChip = program.stateCode || (program.licensureScope === "multi-state" ? "Multi-state" : null);

  return (
    <article style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "#1d4ed8", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
            {program.credential || program.credentialTitle}
            {program.licensureScope === "multi-state" ? <span style={{ color: "#7c3aed", fontWeight: 600, marginLeft: 8 }}>Multi-state</span> : null}
            {stateChip && program.licensureScope !== "multi-state" ? (
              <span style={{ color: "#b45309", fontWeight: 600, marginLeft: 8, fontSize: 12, border: "1px solid #fcd34d", borderRadius: 6, padding: "2px 6px", background: "#fffbeb" }}>
                {stateChip}
              </span>
            ) : null}
            {program.source === "catalog-preview" ? <span style={{ color: "#64748b", fontWeight: 400, marginLeft: 8 }}>(Catalog)</span> : null}
          </div>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>{program.title}</h3>
          {agency ? (
            <div style={{ color: "#047857", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Aligned with {agency}{program.governingBodies?.length ? ` · ${program.governingBodies.slice(0, 3).join(", ")}` : ""}
            </div>
          ) : null}
          {apprenticeship ? (
            <div style={{ color: "#0369a1", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              {apprenticeship.sponsor} · {apprenticeship.hours.toLocaleString()} OJT hours target
              {apprenticeship.unions?.length ? ` · ${apprenticeship.unions.join(", ")}` : ""}
            </div>
          ) : null}
          {degreeAcc ? (
            <div style={{ color: "#6d28d9", fontSize: 12, lineHeight: 1.5, marginBottom: 8 }}>
              {degreeAcc}
              {program.regionalAccreditation ? (
                <div style={{ color: "#64748b", fontWeight: 500, marginTop: 4 }}>{program.regionalAccreditation}</div>
              ) : null}
            </div>
          ) : null}
          {program.licensureBoard ? (
            <div style={{ color: "#92400e", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              {program.licensureBoard}
              {program.examPrerequisites ? <span style={{ fontWeight: 500, color: "#78350f" }}> · {program.examPrerequisites}</span> : null}
            </div>
          ) : null}
          <p style={{ color: "#475569", lineHeight: 1.65, marginTop: 0 }}>
            <strong>Duration:</strong> {program.duration || `${moduleCount(program)} modules`}
            {program.format ? <> · <strong>Format:</strong> {program.format}</> : null}
          </p>
        </div>
        <a
          href={`/academy/programs/${program.key}`}
          style={{ border: "1px solid #2563eb", background: "#2563eb", color: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}
        >
          View syllabus
        </a>
      </div>

      {program.goal ? <p style={{ color: "#334155", lineHeight: 1.65 }}>{program.goal}</p> : null}

      {Array.isArray(program.outcomes) && program.outcomes.length > 0 ? (
        <div style={{ marginTop: 12 }}>
          <strong style={{ color: "#0f172a" }}>Learning outcomes</strong>
          <ul style={{ paddingLeft: 20, lineHeight: 1.8, color: "#475569", marginBottom: 0 }}>
            {program.outcomes.slice(0, 4).map((outcome) => (
              <li key={outcome}>{outcome}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {syllabusLines.length > 0 ? (
        <details style={{ marginTop: 14 }}>
          <summary style={{ cursor: "pointer", fontWeight: 700, color: "#334155" }}>
            Curriculum preview ({syllabusLines.length} modules)
          </summary>
          <ol style={{ paddingLeft: 20, lineHeight: 1.8, color: "#334155", marginTop: 10, marginBottom: 0 }}>
            {syllabusLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </details>
      ) : null}

      <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>
          Enrollment
        </div>
        <div style={{ color: "#334155", lineHeight: 1.7, fontSize: 14 }}>
          Syllabus and curriculum are visible to everyone.
          {enrollment.requiresAuth === false ? " Open enrollment — sign in optional for progress tracking." : " Sign-in, plan, and prerequisites apply to start the course."}
          {enrollment.addonKey ? ` Add-on: ${enrollment.addonKey.replace(/-/g, " ")}.` : ""}
        </div>
      </div>
    </article>
  );
}

function topicMetaLine(topic, pathwayKey) {
  if (pathwayKey === "degree" && topic.degreeLevel) {
    const credits = topic.totalCredits ? `${topic.totalCredits} credits` : "";
    const courses = topic.typicalCourseCount ? `${topic.typicalCourseCount} courses × 3 cr` : "";
    const matrix = topic.fcaMatrix ? topic.fcaMatrix : "";
    return [topic.degreeLevel, credits, courses, matrix].filter(Boolean).join(" · ");
  }
  if (pathwayKey === "licensure" && topic.stateCode) {
    return `${topic.stateCode} contractor board`;
  }
  if (pathwayKey === "licensure" && topic.key === "universal-licensure") {
    return "Multi-state · NASCLA · universal exam prep";
  }
  return null;
}

function TopicCard({ topic, pathwayKey, href }) {
  const metaLine = topicMetaLine(topic, pathwayKey);
  const isEmpty = topic.courses.length === 0;

  return (
    <a href={href} style={{ ...sectionCardStyle, opacity: isEmpty ? 0.72 : 1 }}>
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>{topic.label}</h3>
      {metaLine ? (
        <div style={{ color: "#1d4ed8", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{metaLine}</div>
      ) : null}
      <p style={{ color: "#475569", lineHeight: 1.65, marginTop: 0 }}>{topic.description}</p>
      <div style={{ color: "#64748b", fontSize: 14, marginTop: 12 }}>
        {isEmpty ? "Programs publishing — check back soon" : `${topic.courses.length} courses · Auricrux-led`}
      </div>
    </a>
  );
}

function Breadcrumb({ pathway, topic }) {
  return (
    <nav style={{ marginBottom: 20, fontSize: 14, color: "#64748b" }} aria-label="Catalog navigation">
      <a href="/academy/catalog" style={{ color: "#2563eb", textDecoration: "none" }}>Catalog</a>
      {pathway ? (
        <>
          {" / "}
          <a href={catalogHref(pathway.key)} style={{ color: "#2563eb", textDecoration: "none" }}>{pathway.label}</a>
        </>
      ) : null}
      {topic ? (
        <>
          {" / "}
          <span style={{ color: "#0f172a", fontWeight: 600 }}>{topic.label}</span>
        </>
      ) : null}
    </nav>
  );
}

export default function AcademyCatalog() {
  const { academyState, meta } = useAcademyLms();
  const apiPrograms = academyState?.catalog?.programs || [];
  const { pathwayKey, topicKey } = readCatalogParams();

  const hierarchy = useMemo(() => organizeCatalogHierarchy(apiPrograms), [apiPrograms]);
  const catalogIntegrity = useMemo(() => getCatalogIntegrity(academyState), [academyState]);
  const totalCourses = catalogIntegrity.actualTotal || hierarchy.reduce((sum, pathway) => sum + pathway.courseCount, 0);
  const selectedPathway = hierarchy.find((pathway) => pathway.key === pathwayKey) || null;
  const selectedTopic = selectedPathway?.topics.find((topic) => topic.key === topicKey) || null;
  const placement = findCatalogPlacement(pathwayKey, topicKey);
  const pathwayLms = getPathwayLmsConfig(pathwayKey);

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        compact
        eyebrow={pathwayLms ? `${pathwayLms.heroTitle} · Auricrux` : "FCA Academy"}
        title={selectedTopic ? selectedTopic.label : selectedPathway ? selectedPathway.label : "Course catalog"}
        subtitle={
          selectedTopic
            ? `${selectedTopic.courses.length} courses · ${selectedTopic.description}`
            : selectedPathway
              ? `${selectedPathway.courseCount} courses across ${selectedPathway.topics.length} topics`
              : `${totalCourses} courses organized by pathway, topic, and syllabus.`
        }
        primaryHref="/academy/dashboard"
        primaryLabel="Learner dashboard"
        secondaryHref={shellHeaderCtaSets.academy.secondaryHref}
        secondaryLabel={shellHeaderCtaSets.academy.secondaryLabel}
        journey={shellJourney}
        currentJourney="academy"
      />

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 48px" }}>
        <Breadcrumb pathway={placement?.pathway || selectedPathway} topic={placement?.topic || selectedTopic} />

        <div style={{ ...cardStyle, marginBottom: 24, border: "1px solid #ddd6fe", background: "#f5f3ff" }}>
          <strong style={{ color: "#6d28d9" }}>Academy Store</strong>
          <span style={{ color: "#475569", marginLeft: 8 }}>
            Purchase individual courses or pathway bundles without a Contractor Command subscription.
          </span>
          <a href="/academy/store" style={{ display: "inline-block", marginLeft: 12, color: "#7c3aed", fontWeight: 700, textDecoration: "none" }}>
            Open store
          </a>
        </div>

        {pathwayLms && selectedPathway && !selectedTopic ? (
          <div style={{ ...cardStyle, marginBottom: 24, border: `1px solid ${pathwayLms.border}`, background: pathwayLms.accentSoft }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <strong style={{ color: pathwayLms.accent }}>Auricrux-operated mini-LMS</strong>
                <p style={{ color: "#475569", lineHeight: 1.65, marginBottom: 0, marginTop: 8 }}>{pathwayLms.heroSubtitle}</p>
              </div>
              <a href={`/academy/pathway?pathway=${pathwayKey}`} style={{ color: pathwayLms.accent, fontWeight: 700, textDecoration: "none", alignSelf: "center" }}>
                Open pathway home
              </a>
            </div>
          </div>
        ) : null}

        {apiPrograms.length > 0 ? (
          <div style={{ ...cardStyle, marginBottom: 24, border: catalogIntegrity.aligned ? "1px solid #bbf7d0" : "1px solid #fde68a", background: catalogIntegrity.aligned ? "#f0fdf4" : "#fffbeb" }}>
            <strong style={{ color: catalogIntegrity.aligned ? "#15803d" : "#b45309" }}>
              {catalogIntegrity.aligned ? "Live catalog aligned" : "Catalog sync in progress"}
            </strong>
            <span style={{ color: "#475569", marginLeft: 8 }}>
              {catalogIntegrity.actualTotal} of {catalogIntegrity.expectedTotal} programs from {meta.backingSource || "Auricrux-Central"}
              {catalogIntegrity.aligned ? "" : " — deploy may still be propagating; refresh shortly."}
            </span>
          </div>
        ) : (
          <div style={{ ...cardStyle, marginBottom: 24, border: "1px solid #fde68a", background: "#fffbeb", color: "#92400e" }}>
            Backend catalog unavailable. Showing FCA syllabus catalog — enrollment gates still apply when you sign in.
          </div>
        )}

        <div style={{ ...cardStyle, marginBottom: 24, background: "#f8fafc" }}>
          <strong>How the catalog works</strong>
          <ol style={{ paddingLeft: 20, lineHeight: 1.85, color: "#475569", marginBottom: 0, marginTop: 10 }}>
            <li><strong>Pick a pathway</strong> — apprenticeship, degree, certification, licensure, professional development, or FCA operator guides.</li>
            <li><strong>Pick a topic</strong> — OSHA, electrical, architectural engineering, Virginia DPOR, and more.</li>
            <li><strong>View any course syllabus</strong> — curriculum is public for every course.</li>
            <li><strong>Enroll when eligible</strong> — subscriptions, add-ons, and prerequisites gate course signup and progress tracking.</li>
          </ol>
        </div>

        {!selectedPathway ? (
          <section>
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>1. Choose a pathway</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {hierarchy.map((pathway) => {
                const lms = getPathwayLmsConfig(pathway.key);
                return (
                <a key={pathway.key} href={`/academy/pathway?pathway=${pathway.key}`} style={{ ...sectionCardStyle, borderLeft: lms ? `4px solid ${lms.accent}` : undefined }}>
                  <div style={{ color: lms?.accent || "#1d4ed8", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{pathway.credentialType}</div>
                  <h3 style={{ marginTop: 0, marginBottom: 8 }}>{pathway.label}</h3>
                  <p style={{ color: "#475569", lineHeight: 1.65, marginTop: 0 }}>{pathway.description}</p>
                  <div style={{ color: "#64748b", fontSize: 14, marginTop: 12 }}>
                    {pathway.topics.length} topics · {pathway.courseCount} courses · <span style={{ color: lms?.accent || "#64748b" }}>Auricrux-led mini-LMS</span>
                  </div>
                </a>
              );})}
            </div>
          </section>
        ) : null}

        {selectedPathway && !selectedTopic ? (
          <section>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>2. Choose a topic</h2>
            <p style={{ color: "#475569", lineHeight: 1.65, marginTop: 0, marginBottom: 20 }}>{selectedPathway.description}</p>
            {selectedPathway.key === "degree" ? (
              ["Shared", "AAS", "BS", "BAS"].map((level) => {
                const levelTopics = selectedPathway.topics.filter((topic) => topic.degreeLevel === level);
                if (levelTopics.length === 0) return null;
                const levelLabel = level === "Shared" ? "General Education" : level === "AAS" ? "Associate (60 credits)" : level === "BS" ? "Bachelor (120 credits)" : "Applied Bachelor (120 credits)";
                return (
                  <div key={level} style={{ marginBottom: 28 }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12, color: "#0f172a" }}>{levelLabel}</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                      {levelTopics.map((topic) => (
                        <TopicCard key={topic.key} topic={topic} pathwayKey={selectedPathway.key} href={catalogHref(selectedPathway.key, topic.key)} />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : selectedPathway.key === "licensure" ? (
              <>
                <h3 style={{ marginTop: 0, marginBottom: 12, color: "#0f172a" }}>Universal & trade prep</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 28 }}>
                  {selectedPathway.topics.filter((topic) => !topic.stateCode).map((topic) => (
                    <TopicCard key={topic.key} topic={topic} pathwayKey={selectedPathway.key} href={catalogHref(selectedPathway.key, topic.key)} />
                  ))}
                </div>
                <h3 style={{ marginTop: 0, marginBottom: 12, color: "#0f172a" }}>State contractor boards</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                  {selectedPathway.topics.filter((topic) => topic.stateCode).map((topic) => (
                    <TopicCard key={topic.key} topic={topic} pathwayKey={selectedPathway.key} href={catalogHref(selectedPathway.key, topic.key)} />
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                {selectedPathway.topics.map((topic) => (
                  <TopicCard key={topic.key} topic={topic} pathwayKey={selectedPathway.key} href={catalogHref(selectedPathway.key, topic.key)} />
                ))}
              </div>
            )}
          </section>
        ) : null}

        {selectedPathway && selectedTopic ? (
          <section>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>3. Courses in {selectedTopic.label}</h2>
            {topicMetaLine(selectedTopic, selectedPathway.key) ? (
              <p style={{ color: "#1d4ed8", fontWeight: 700, marginTop: 0, marginBottom: 8 }}>{topicMetaLine(selectedTopic, selectedPathway.key)}</p>
            ) : null}
            <p style={{ color: "#475569", lineHeight: 1.65, marginTop: 0, marginBottom: 20 }}>
              {selectedTopic.courses.length === 0
                ? "State-specific prep for this jurisdiction is launching soon. Universal and trade prep courses are available in other licensure topics."
                : "All syllabi and curriculum outlines are visible. Enrollment requires an eligible subscription, add-on, and any listed prerequisites."}
            </p>
            <div style={{ display: "grid", gap: 18 }}>
              {selectedTopic.courses.map((program) => (
                <CourseCard key={program.key} program={program} pathwayKey={selectedPathway.key} topicKey={selectedTopic.key} />
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <PublicCtaRow actions={academyCtaSets.productionClose} />
      <ShellFooter />
    </div>
  );
}
