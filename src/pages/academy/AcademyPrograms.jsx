import { useMemo } from "react";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import PublicCtaRow from "../../components/PublicCtaRow";
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

export default function AcademyPrograms() {
  const programs = useMemo(() => academyCatalog.programs || [], []);

  return (
    <div style={pageShellStyle}>
      <ShellHeader ctaSet={shellHeaderCtaSets.academy} journey={shellJourney.academy} />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px 64px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: "#2563eb", fontWeight: 700 }}>FCA Academy</div>
          <h1 style={{ margin: "8px 0 12px" }}>Program lessons</h1>
          <p style={{ color: "#475569", lineHeight: 1.7, maxWidth: 720 }}>
            Structured training tracks with live portal labs. Each program links to governed workspace routes and
            credential continuity on the FCA spine.
          </p>
        </div>
        <div style={{ display: "grid", gap: 16 }}>
          {programs.map((program) => (
            <article key={program.key} style={cardStyle}>
              <div style={{ color: "#1d4ed8", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{program.credential}</div>
              <h2 style={{ marginTop: 0, marginBottom: 8 }}>{program.title}</h2>
              <p style={{ color: "#475569", lineHeight: 1.65, marginTop: 0 }}>{program.goal || program.audience}</p>
              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a
                  href={`/academy/programs/${program.key}`}
                  style={{
                    border: "1px solid #2563eb",
                    background: "#2563eb",
                    color: "#fff",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Open program
                </a>
                {program.linkedSurface ? (
                  <a
                    href={program.linkedSurface}
                    style={{
                      border: "1px solid #cbd5e1",
                      background: "#fff",
                      color: "#334155",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    {program.linkedLabel || "Open workspace lab"}
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
        <div style={{ marginTop: 32 }}>
          <PublicCtaRow ctaSet={academyCtaSets.programs || academyCtaSets.catalog} />
        </div>
      </main>
      <ShellFooter />
    </div>
  );
}
