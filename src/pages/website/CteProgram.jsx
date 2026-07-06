import { useEffect, useState } from "react";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import { pageShellStyle } from "../../publicShellStyles";

const cardStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  background: "#ffffff",
  padding: 18,
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
};

export default function CteProgram() {
  const [state, setState] = useState({ loading: true, error: "", data: null });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cte-program")
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok || json?.ok !== true) {
          throw new Error(json?.error || "CTE program data is unavailable.");
        }
        if (!cancelled) setState({ loading: false, error: "", data: json });
      })
      .catch((error) => {
        if (!cancelled) setState({ loading: false, error: error.message || "Unable to load CTE program data.", data: null });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const programs = state.data?.programs || [];

  return (
    <div style={{ ...pageShellStyle, minHeight: "100vh", background: "#f8fafc" }}>
      <ShellHeader
        compact
        eyebrow="FCA Academy"
        title="Virginia CTE Program Evidence"
        subtitle="Public evidence surface for FCA CTE program coverage, VDOE alignment signals, and student pathway access."
        primaryHref="/academy/catalog?pathway=cte"
        primaryLabel="Open CTE catalog"
        secondaryHref="/cte/login?next=/cte"
        secondaryLabel="CTE student login"
      />

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 48px" }}>
        <section style={{ ...cardStyle, marginBottom: 16 }}>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Live backend evidence</h2>
          {state.loading ? <p style={{ margin: 0, color: "#475569" }}>Loading /api/cte-program...</p> : null}
          {state.error ? <p style={{ margin: 0, color: "#b91c1c" }}>{state.error}</p> : null}
          {!state.loading && !state.error ? (
            <p style={{ margin: 0, color: "#334155", lineHeight: 1.7 }}>
              <strong>{state.data.programCount}</strong> CTE programs currently exposed by <code>/api/cte-program</code>.
              Source: <strong>{state.data.source}</strong> · Generated: {new Date(state.data.generatedAt).toLocaleString()}.
            </p>
          ) : null}
        </section>

        <section style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: 10 }}>Program preview</h3>
          {programs.length === 0 ? (
            <p style={{ margin: 0, color: "#64748b" }}>No program records returned.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {programs.map((program) => (
                <article key={program.key} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{program.title}</div>
                  <div style={{ color: "#475569", fontSize: 14 }}>
                    {program.credential || "Credential pending"} · {program.duration || "Duration pending"}
                    {program.courseCode ? ` · Course ${program.courseCode}` : ""}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <ShellFooter />
    </div>
  );
}
