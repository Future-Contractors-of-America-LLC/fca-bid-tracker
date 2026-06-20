import { useMemo, useState } from "react";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import useAcademyLms from "../../hooks/useAcademyLms";
import useCustomerSession from "../../hooks/useCustomerSession";
import { AAS_CONSTRUCTION_MANAGEMENT_TERMS, BS_CONSTRUCTION_MANAGEMENT_YEARS, DEGREE_PATHWAYS, DPOR_LICENSURE_UNITS, ELECTRICAL_APPRENTICESHIP_LEVELS, ELECTRICAL_LICENSURE_UNITS, LICENSURE_PATHWAYS, organizeApiCatalogByLane } from "../../academyOfferings";
import { academyCtaSets, shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { pageShellStyle } from "../../publicShellStyles";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

function ProgressBar({ percent }) {
  return (
    <div style={{ height: 10, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, percent || 0)}%`, height: "100%", background: "#2563eb", borderRadius: 999 }} />
    </div>
  );
}

export default function AcademyDashboard() {
  const { session } = useCustomerSession();
  const { academyState, exportTranscript } = useAcademyLms();
  const [transcriptBusy, setTranscriptBusy] = useState(false);
  const [transcriptMessage, setTranscriptMessage] = useState("");
  const learnerId = session?.email || session?.customerId;

  const enrollments = useMemo(
    () => (academyState.enrollments || []).filter((item) => !learnerId || item.learnerId === learnerId),
    [academyState.enrollments, learnerId],
  );

  const certificates = useMemo(
    () => (academyState.certificates || []).filter((item) => !learnerId || item.learnerId === learnerId),
    [academyState.certificates, learnerId],
  );

  const apiPrograms = academyState?.catalog?.programs || [];
  const lanes = organizeApiCatalogByLane(apiPrograms);

  const electricalPathway = ELECTRICAL_APPRENTICESHIP_LEVELS.map((level) => {
    const enrollment = enrollments.find((item) => item.programKey === level.key);
    return { ...level, enrollment };
  });

  const electricalLicensurePathway = ELECTRICAL_LICENSURE_UNITS.map((unit) => {
    const enrollment = enrollments.find((item) => item.programKey === unit.key);
    return { ...unit, enrollment };
  });

  const dporLicensurePathway = DPOR_LICENSURE_UNITS.map((unit) => {
    const enrollment = enrollments.find((item) => item.programKey === unit.key);
    return { ...unit, enrollment };
  });

  const degreePrograms = lanes.find((lane) => lane.key === "degree")?.programs || [];
  const programByKey = Object.fromEntries(degreePrograms.map((p) => [p.key, p]));

  const aasCmTerms = AAS_CONSTRUCTION_MANAGEMENT_TERMS.map((termBlock) => ({
    ...termBlock,
    courses: termBlock.courses.map((key) => ({
      key,
      title: programByKey[key]?.title || key,
      enrollment: enrollments.find((item) => item.programKey === key),
    })),
  }));

  const nextEnrollment = useMemo(() => {
    const active = enrollments.filter((item) => (item.progressPercent || 0) < 100);
    if (!active.length) return null;
    return active.sort((a, b) => (b.progressPercent || 0) - (a.progressPercent || 0))[0];
  }, [enrollments]);

  const degreeGpa = useMemo(() => {
    const degreeEnrollments = enrollments.filter((item) => {
      const program = apiPrograms.find((entry) => entry.key === item.programKey);
      return program?.lane === "degree";
    });
    const gradePoints = [];
    degreeEnrollments.forEach((enrollment) => {
      const scores = Object.values(enrollment.moduleScores || {});
      if (!scores.length) return;
      const avg = scores.reduce((sum, value) => sum + Number(value), 0) / scores.length;
      if (avg >= 93) gradePoints.push(4.0);
      else if (avg >= 90) gradePoints.push(3.7);
      else if (avg >= 87) gradePoints.push(3.3);
      else if (avg >= 83) gradePoints.push(3.0);
      else if (avg >= 80) gradePoints.push(2.7);
      else gradePoints.push(2.0);
    });
    if (!gradePoints.length) return null;
    return (gradePoints.reduce((sum, value) => sum + value, 0) / gradePoints.length).toFixed(2);
  }, [enrollments, apiPrograms]);

  const ceuEarned = useMemo(() => {
    return enrollments
      .filter((item) => (item.progressPercent || 0) >= 100)
      .reduce((sum, item) => {
        const program = apiPrograms.find((entry) => entry.key === item.programKey);
        if (!program || !["certification", "licensure"].includes(program.lane)) return sum;
        return sum + Number(program.ceuHours || 0);
      }, 0);
  }, [enrollments, apiPrograms]);

  async function handleExportTranscript() {
    if (!learnerId) {
      setTranscriptMessage("Sign in to export your transcript.");
      return;
    }
    setTranscriptBusy(true);
    setTranscriptMessage("");
    try {
      const payload = await exportTranscript(learnerId);
      const blob = new Blob([JSON.stringify(payload.transcript || payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `fca-academy-transcript-${learnerId.replace(/[^a-z0-9.-]+/gi, "-")}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setTranscriptMessage("Transcript exported.");
    } catch (error) {
      setTranscriptMessage(error.message || "Unable to export transcript.");
    } finally {
      setTranscriptBusy(false);
    }
  }

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        compact
        eyebrow="FCA Academy"
        title="Learner dashboard"
        subtitle="Track enrollments, pathway progression, credentials, and your next module."
        primaryHref="/academy/catalog"
        primaryLabel="Browse catalog"
        secondaryHref="/academy/credentials"
        secondaryLabel="View credentials"
        journey={shellJourney}
        currentJourney="academy"
      />

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 48px" }}>
        {nextEnrollment ? (
          <section style={{ ...cardStyle, marginBottom: 24, border: "1px solid #bfdbfe", background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" }}>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>Next action</div>
            <strong>{nextEnrollment.programTitle}</strong>
            <p style={{ color: "#475569", lineHeight: 1.65 }}>
              Continue module {(nextEnrollment.completedModules || 0) + 1}: {nextEnrollment.nextLesson}
            </p>
            <a
              href={`/academy/programs/${nextEnrollment.programKey}/modules/${(nextEnrollment.completedModules || 0) + 1}`}
              style={{ display: "inline-block", border: "1px solid #2563eb", background: "#2563eb", color: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, textDecoration: "none" }}
            >
              Resume learning
            </a>
          </section>
        ) : null}

        <section style={{ ...cardStyle, marginBottom: 24 }}>
          <h2 style={{ marginTop: 0 }}>Active enrollments</h2>
          {enrollments.length === 0 ? (
            <p style={{ color: "#64748b", lineHeight: 1.65 }}>
              No active enrollments yet. <a href="/academy/catalog" style={{ color: "#1d4ed8", fontWeight: 700 }}>Browse the catalog</a> to get started.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {enrollments.map((enrollment) => {
                const nextModule = (enrollment.completedModules || 0) + 1;
                return (
                  <div key={enrollment.enrollmentId} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                      <strong>{enrollment.programTitle}</strong>
                      <span style={{ color: "#64748b" }}>{enrollment.status}</span>
                    </div>
                    <ProgressBar percent={enrollment.progressPercent} />
                    <div style={{ color: "#475569", marginTop: 8, marginBottom: 12 }}>
                      {enrollment.completedModules}/{enrollment.totalModules} modules - {enrollment.progressPercent}% complete
                    </div>
                    {enrollment.progressPercent < 100 ? (
                      <a
                        href={`/academy/programs/${enrollment.programKey}/modules/${nextModule}`}
                        style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}
                      >
                        Continue: Module {nextModule} - {enrollment.nextLesson}
                      </a>
                    ) : (
                      <a href="/academy/credentials" style={{ color: "#15803d", fontWeight: 700, textDecoration: "none" }}>
                        Program complete - view credential
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section style={{ ...cardStyle, marginBottom: 24 }}>
          <h2 style={{ marginTop: 0 }}>Degree pathways (AAS and BS/BAS)</h2>
          <p style={{ color: "#475569", lineHeight: 1.65, marginTop: 0 }}>
            Ivy League-standard academic degree tracks with full semester curricula, general education core, major courses, practicum, and capstone requirements.
          </p>
          <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
            {DEGREE_PATHWAYS.filter((p) => p.key !== "degree-general-education-core").map((pathway) => (
              <div key={pathway.key} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc" }}>
                <strong>{pathway.label}</strong>
                <span style={{ color: "#64748b", marginLeft: 8 }}>
                  {pathway.level} - {pathway.credits} credits - {pathway.courses} courses
                </span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ ...cardStyle, marginBottom: 24 }}>
          <h2 style={{ marginTop: 0 }}>AAS Construction Management - term-by-term map</h2>
          <p style={{ color: "#475569", lineHeight: 1.65, marginTop: 0 }}>
            60-credit associate degree with 8 general education courses, 10 major courses, practicum, and capstone.
          </p>
          <div style={{ display: "grid", gap: 12 }}>
            {aasCmTerms.map((termBlock) => (
              <div key={termBlock.term} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 14 }}>
                <strong>Term {termBlock.term}</strong>
                <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
                  {termBlock.courses.map((course) => {
                    const complete = course.enrollment?.progressPercent >= 100;
                    const active = course.enrollment && !complete;
                    return (
                      <div
                        key={course.key}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                          flexWrap: "wrap",
                          padding: "8px 10px",
                          borderRadius: 8,
                          border: `1px solid ${complete ? "#86efac" : active ? "#93c5fd" : "#e2e8f0"}`,
                          background: complete ? "#f0fdf4" : active ? "#eff6ff" : "#fff",
                        }}
                      >
                        <span style={{ color: "#334155", fontSize: 14 }}>{course.title}</span>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {course.enrollment ? (
                            <span style={{ color: complete ? "#15803d" : "#2563eb", fontWeight: 700, fontSize: 13 }}>
                              {course.enrollment.progressPercent}%
                            </span>
                          ) : null}
                          <a href={`/academy/programs/${course.key}`} style={{ color: "#1d4ed8", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                            {course.enrollment ? "Open" : "View"}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ ...cardStyle, marginBottom: 24 }}>
          <h2 style={{ marginTop: 0 }}>BS Construction Management - year progression</h2>
          <p style={{ color: "#475569", lineHeight: 1.65, marginTop: 0 }}>
            120-credit bachelor program with general education, 22 major courses, 4 electives, internship, and capstone sequence.
          </p>
          <div style={{ display: "grid", gap: 8 }}>
            {BS_CONSTRUCTION_MANAGEMENT_YEARS.map((yearBlock) => (
              <div
                key={yearBlock.year}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                }}
              >
                <div>
                  <strong>Year {yearBlock.year}</strong>
                  <span style={{ color: "#64748b", marginLeft: 8 }}>{yearBlock.label}</span>
                </div>
                <span style={{ color: "#475569", fontSize: 14 }}>{yearBlock.courseCount} courses</span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ ...cardStyle, marginBottom: 24 }}>
          <h2 style={{ marginTop: 0 }}>Licensure exam prep pathways</h2>
          <p style={{ color: "#475569", lineHeight: 1.65, marginTop: 0 }}>
            Trade and contractor licensure exam preparation across nine trades, Virginia DPOR, NASCLA business and law, and exam readiness fundamentals.
          </p>
          <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
            {LICENSURE_PATHWAYS.map((pathway) => (
              <div key={pathway.key} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #fde68a", background: "#fffbeb" }}>
                <strong>{pathway.label}</strong>
                <span style={{ color: "#64748b", marginLeft: 8 }}>
                  {pathway.units} programs
                </span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ ...cardStyle, marginBottom: 24 }}>
          <h2 style={{ marginTop: 0 }}>Electrical licensure exam prep (journeyman to contractor)</h2>
          <p style={{ color: "#475569", lineHeight: 1.65, marginTop: 0 }}>
            NEC-aligned exam preparation with diagnostic assessment, domain modules, and timed practice exams.
          </p>
          <div style={{ display: "grid", gap: 8 }}>
            {electricalLicensurePathway.map((unit) => {
              const complete = unit.enrollment?.progressPercent >= 100;
              const active = unit.enrollment && !complete;
              const enrolled = Boolean(unit.enrollment);
              return (
                <div
                  key={unit.key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: `1px solid ${complete ? "#86efac" : active ? "#fde68a" : "#e2e8f0"}`,
                    background: complete ? "#f0fdf4" : active ? "#fffbeb" : "#fff",
                  }}
                >
                  <div>
                    <strong>Unit {unit.unit}</strong>
                    <span style={{ color: "#64748b", marginLeft: 8 }}>{unit.title}</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {enrolled ? (
                      <span style={{ color: complete ? "#15803d" : "#b45309", fontWeight: 700, fontSize: 14 }}>
                        {unit.enrollment.progressPercent}%
                      </span>
                    ) : null}
                    <a href={`/academy/programs/${unit.key}`} style={{ color: "#1d4ed8", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                      {enrolled ? "Open" : "View"}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section style={{ ...cardStyle, marginBottom: 24 }}>
          <h2 style={{ marginTop: 0 }}>Virginia DPOR contractor licensing</h2>
          <p style={{ color: "#475569", lineHeight: 1.65, marginTop: 0 }}>
            Residential and Class A/B/C contractor exam preparation with application checklists and CE renewal guidance.
          </p>
          <div style={{ display: "grid", gap: 8 }}>
            {dporLicensurePathway.map((unit) => {
              const complete = unit.enrollment?.progressPercent >= 100;
              const active = unit.enrollment && !complete;
              const enrolled = Boolean(unit.enrollment);
              return (
                <div
                  key={unit.key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: `1px solid ${complete ? "#86efac" : active ? "#fde68a" : "#e2e8f0"}`,
                    background: complete ? "#f0fdf4" : active ? "#fffbeb" : "#fff",
                  }}
                >
                  <div>
                    <strong>Unit {unit.unit}</strong>
                    <span style={{ color: "#64748b", marginLeft: 8 }}>{unit.title}</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {enrolled ? (
                      <span style={{ color: complete ? "#15803d" : "#b45309", fontWeight: 700, fontSize: 14 }}>
                        {unit.enrollment.progressPercent}%
                      </span>
                    ) : null}
                    <a href={`/academy/programs/${unit.key}`} style={{ color: "#1d4ed8", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                      {enrolled ? "Open" : "View"}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section style={{ ...cardStyle, marginBottom: 24 }}>
          <h2 style={{ marginTop: 0 }}>Electrical apprenticeship pathway (L1-L10)</h2>
          <p style={{ color: "#475569", lineHeight: 1.65, marginTop: 0 }}>
            NCCER-style level progression from core apprenticeship through specialization tracks.
          </p>
          <div style={{ display: "grid", gap: 8 }}>
            {electricalPathway.map((level) => {
              const complete = level.enrollment?.progressPercent >= 100;
              const active = level.enrollment && !complete;
              const enrolled = Boolean(level.enrollment);
              return (
                <div
                  key={level.key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: `1px solid ${complete ? "#86efac" : active ? "#93c5fd" : "#e2e8f0"}`,
                    background: complete ? "#f0fdf4" : active ? "#eff6ff" : "#fff",
                  }}
                >
                  <div>
                    <strong>L{level.level}</strong>
                    <span style={{ color: "#64748b", marginLeft: 8 }}>{level.title}</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {enrolled ? (
                      <span style={{ color: complete ? "#15803d" : "#2563eb", fontWeight: 700, fontSize: 14 }}>
                        {level.enrollment.progressPercent}%
                      </span>
                    ) : null}
                    <a href={`/academy/programs/${level.key}`} style={{ color: "#1d4ed8", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                      {enrolled ? "Open" : "View"}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section style={{ ...cardStyle, marginBottom: 24 }}>
          <h2 style={{ marginTop: 0 }}>Credentials earned</h2>
          {certificates.length === 0 ? (
            <p style={{ color: "#64748b" }}>Complete a program to earn your first credential.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {certificates.map((cert) => (
                <div key={cert.certificateId} style={{ border: "1px solid #bfdbfe", borderRadius: 12, padding: 14, background: "#eff6ff" }}>
                  <strong>{cert.title}</strong>
                  <div style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
                    Status: {cert.status} | Issued: {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : "Pending"}
                  </div>
                </div>
              ))}
            </div>
          )}
          <a href="/academy/credentials" style={{ display: "inline-block", marginTop: 14, color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>
            View all credentials
          </a>
        </section>

        <section style={{ ...cardStyle }}>
          <h2 style={{ marginTop: 0 }}>Transcript summary</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <div style={{ padding: 14, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ color: "#64748b", fontSize: 13 }}>Programs enrolled</div>
              <strong style={{ fontSize: 24 }}>{enrollments.length}</strong>
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ color: "#64748b", fontSize: 13 }}>Programs completed</div>
              <strong style={{ fontSize: 24 }}>{enrollments.filter((item) => item.progressPercent >= 100).length}</strong>
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ color: "#64748b", fontSize: 13 }}>Credentials issued</div>
              <strong style={{ fontSize: 24 }}>{certificates.filter((item) => item.status === "Issued").length}</strong>
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ color: "#64748b", fontSize: 13 }}>Catalog lanes</div>
              <strong style={{ fontSize: 24 }}>{lanes.filter((lane) => lane.programs.length > 0).length}</strong>
            </div>
            {degreeGpa ? (
              <div style={{ padding: 14, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div style={{ color: "#64748b", fontSize: 13 }}>Degree GPA (est.)</div>
                <strong style={{ fontSize: 24 }}>{degreeGpa}</strong>
              </div>
            ) : null}
            {ceuEarned > 0 ? (
              <div style={{ padding: 14, borderRadius: 12, background: "#fffbeb", border: "1px solid #fde68a" }}>
                <div style={{ color: "#64748b", fontSize: 13 }}>CEU hours earned</div>
                <strong style={{ fontSize: 24 }}>{ceuEarned}</strong>
              </div>
            ) : null}
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              onClick={handleExportTranscript}
              disabled={transcriptBusy || !learnerId}
              style={{ border: "1px solid #2563eb", background: "#fff", color: "#1d4ed8", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}
            >
              {transcriptBusy ? "Exporting..." : "Download transcript (JSON)"}
            </button>
            {transcriptMessage ? <span style={{ color: "#475569" }}>{transcriptMessage}</span> : null}
          </div>

          {enrollments.length > 0 ? (
            <table style={{ width: "100%", marginTop: 20, borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "8px 6px" }}>Program</th>
                  <th style={{ padding: "8px 6px" }}>Progress</th>
                  <th style={{ padding: "8px 6px" }}>Score avg</th>
                  <th style={{ padding: "8px 6px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => {
                  const scores = Object.values(enrollment.moduleScores || {});
                  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
                  return (
                    <tr key={enrollment.enrollmentId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 6px" }}>{enrollment.programTitle}</td>
                      <td style={{ padding: "10px 6px" }}>{enrollment.progressPercent}%</td>
                      <td style={{ padding: "10px 6px" }}>{avgScore !== null ? `${avgScore}%` : "-"}</td>
                      <td style={{ padding: "10px 6px" }}>{enrollment.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : null}
        </section>
      </main>

      <ShellFooter ctaSet={academyCtaSets.home} />
    </div>
  );
}
