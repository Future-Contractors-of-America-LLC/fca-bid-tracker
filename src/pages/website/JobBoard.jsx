import { useEffect, useState } from "react";
import MarketingPageShell from "../../components/MarketingPageShell";
import { fetchJobBoardContractors, fetchJobBoardJobs } from "../../api/leadsBoardClient";
import { cardStyle, ctaPrimaryStyle, ctaSecondaryStyle, responsiveGrid } from "../../publicShellStyles";

const tabs = [
  { key: "jobs", label: "Open jobs" },
  { key: "contractors", label: "Contractor network" },
  { key: "post", label: "Post opportunity" },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function formatDate(value) {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "—";
  }
}

export default function JobBoard() {
  const [activeTab, setActiveTab] = useState("jobs");
  const [jobs, setJobs] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [jobRows, contractorRows] = await Promise.all([
        fetchJobBoardJobs(),
        fetchJobBoardContractors(),
      ]);
      if (cancelled) return;
      setJobs(jobRows);
      setContractors(contractorRows);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MarketingPageShell
      eyebrow="FCA Network"
      title="Job board and contractor marketplace"
      subtitle="Discover upcoming work, connect with qualified contractors, and move opportunities into your FCA pipeline — similar to PlanHub and Bluebook, built into your operating system."
      primaryHref="/intake"
      primaryLabel="Join the network"
      secondaryHref="/login"
      secondaryLabel="Sign in to bid"
      illustrationKey="job-board"
    >
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              border: "1px solid #cbd5e1",
              background: activeTab === tab.key ? "#1d4ed8" : "#fff",
              color: activeTab === tab.key ? "#fff" : "#0f172a",
              borderRadius: 999,
              padding: "8px 14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={cardStyle}>Loading board data…</div>
      ) : null}

      {!loading && activeTab === "jobs" ? (
        <section style={responsiveGrid(300)}>
          {jobs.map((job) => (
            <article key={job.id} style={cardStyle}>
              <div style={{ color: "#15803d", fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                {job.status}
              </div>
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>{job.title}</h3>
              <p style={{ color: "#475569", lineHeight: 1.6, marginTop: 0 }}>
                {job.trade} · {job.location} · {formatCurrency(job.value)}
              </p>
              <p style={{ color: "#64748b", fontSize: 13, marginBottom: 12 }}>
                Posted {formatDate(job.postedAt)} · {job.owner}
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a href="/login" style={ctaPrimaryStyle}>Sign in to respond</a>
                <a href="/intake" style={ctaSecondaryStyle}>Request intro</a>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {!loading && activeTab === "contractors" ? (
        <section style={responsiveGrid(280)}>
          {contractors.map((contractor) => (
            <article key={contractor.id} style={cardStyle}>
              <div style={{ color: "#1d4ed8", fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                {contractor.rating}
              </div>
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>{contractor.name}</h3>
              <p style={{ color: "#475569", lineHeight: 1.6, marginTop: 0 }}>
                {contractor.trades.join(" · ")} · {contractor.region}
              </p>
              <p style={{ color: "#64748b", fontSize: 13, marginBottom: 12 }}>{contractor.openTo}</p>
              <a href="/contact" style={ctaPrimaryStyle}>Request connection</a>
            </article>
          ))}
        </section>
      ) : null}

      {!loading && activeTab === "post" ? (
        <section style={{ ...cardStyle, maxWidth: 720 }}>
          <h2 style={{ marginTop: 0 }}>Post an opportunity</h2>
          <p style={{ color: "#475569", lineHeight: 1.7 }}>
            Owners and GCs can publish upcoming work to the FCA network. Contractors respond through authenticated workspace bids and pipeline lanes.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/intake" style={ctaPrimaryStyle}>Start owner intake</a>
            <a href="/login" style={ctaSecondaryStyle}>Sign in to publish</a>
          </div>
        </section>
      ) : null}
    </MarketingPageShell>
  );
}
