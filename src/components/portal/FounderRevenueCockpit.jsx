import { useEffect, useState } from "react";
import { portalCardStyle, portalEyebrowStyle, portalTokens } from "../../portalDesignTokens";

const API_BASE = typeof window !== "undefined"
  ? (window.__FCA_BACKEND_CONFIG__?.apiBase || "https://api.futurecontractorsofamerica.com/api")
  : "https://api.futurecontractorsofamerica.com/api";

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${path}`, { headers: { Accept: "application/json" } });
  const payload = await response.json().catch(() => ({}));
  return { ok: response.ok, payload };
}

export default function FounderRevenueCockpit({ session }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const isFounder = session?.role === "Founder / Owner" || session?.email === "michael@futurecontractorsofamerica.com";

  useEffect(() => {
    if (!isFounder) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const [lms, health] = await Promise.all([
          fetchJson("/academy-lms?view=summary"),
          fetchJson("/health"),
        ]);
        if (cancelled) return;
        const enrollments = lms.payload?.enrollments?.length ?? lms.payload?.summary?.enrollmentCount ?? 0;
        const programs = lms.payload?.catalog?.totalPrograms ?? 0;
        setStats({
          apiHealthy: health.ok,
          enrollments,
          programs,
          ecosystem: "FCA Contractor Command",
        });
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load revenue cockpit.");
      }
    })();
    return () => { cancelled = true; };
  }, [isFounder]);

  if (!isFounder) return null;

  return (
    <section style={{ ...portalCardStyle, marginBottom: 16, borderLeft: "4px solid #047857", background: "linear-gradient(135deg, #ecfdf5 0%, #fff 100%)" }}>
      <div style={{ ...portalEyebrowStyle, color: "#047857" }}>Founder revenue cockpit</div>
      <h2 style={{ margin: "6px 0 8px", fontSize: "1.15rem" }}>FCA Contractor Command — one ecosystem</h2>
      <p style={{ color: portalTokens.body, lineHeight: 1.65, marginTop: 0, marginBottom: 14, fontSize: 14 }}>
        Academy and workspace are capabilities on one tenant. Sell entry SKUs; Auricrux operates delivery.
      </p>
      {error ? <p style={{ color: "#b45309" }}>{error}</p> : null}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <article style={{ border: `1px solid ${portalTokens.border}`, borderRadius: 12, padding: 14, background: "#fff" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: portalTokens.muted, textTransform: "uppercase" }}>API</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: stats?.apiHealthy ? "#047857" : "#b45309" }}>
            {stats ? (stats.apiHealthy ? "Live" : "Degraded") : "…"}
          </div>
        </article>
        <article style={{ border: `1px solid ${portalTokens.border}`, borderRadius: 12, padding: 14, background: "#fff" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: portalTokens.muted, textTransform: "uppercase" }}>Enrollments</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{stats?.enrollments ?? "…"}</div>
        </article>
        <article style={{ border: `1px solid ${portalTokens.border}`, borderRadius: 12, padding: 14, background: "#fff" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: portalTokens.muted, textTransform: "uppercase" }}>Academy programs</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{stats?.programs ?? "…"}</div>
        </article>
        <article style={{ border: `1px solid ${portalTokens.border}`, borderRadius: 12, padding: 14, background: "#fff" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: portalTokens.muted, textTransform: "uppercase" }}>Quick actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
            <a href="/academy/store" style={{ color: "#1d4ed8", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Sell Academy</a>
            <a href="/pricing" style={{ color: "#1d4ed8", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Sell workspace</a>
            <a href="/portal/messages" style={{ color: "#1d4ed8", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Open comms</a>
          </div>
        </article>
      </div>
    </section>
  );
}
