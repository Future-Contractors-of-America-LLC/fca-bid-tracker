import AuricruxBrandMark from "./AuricruxBrandMark";

const presets = {
  home: {
    title: "Contractor command center",
    caption: "Leads, bids, jobs, billing, and training in one workspace.",
    panels: ["Pipeline", "Projects", "Finance", "Academy"],
    accent: "#2563eb",
  },
  platform: {
    title: "Lifecycle operating board",
    caption: "From first opportunity through delivery, billing, and closeout.",
    panels: ["Qualify", "Estimate", "Deliver", "Bill"],
    accent: "#1d4ed8",
  },
  pricing: {
    title: "Rollout planner",
    caption: "Match tier depth to team size, products, and Academy needs.",
    panels: ["Startup", "Operations", "Growth", "Enterprise"],
    accent: "#7c5313",
  },
  features: {
    title: "Connected modules",
    caption: "Every workflow shares the same project spine and customer record.",
    panels: ["Onboarding", "Field", "Files", "Support"],
    accent: "#0f766e",
  },
  solutions: {
    title: "Trade-ready pathways",
    caption: "Electrical, GC, and specialty teams get purpose-built starting points.",
    panels: ["Electrical", "GC", "Specialty", "Service"],
    accent: "#6d28d9",
  },
  auricrux: {
    title: "Auricrux guidance layer",
    caption: "Next actions, blockers, and continuity across the workspace.",
    panels: ["Read", "Recommend", "Act", "Review"],
    accent: "#b45309",
  },
  academy: {
    title: "Workforce academy",
    caption: "Credentials and field readiness tied to live project work.",
    panels: ["Courses", "Labs", "Credentials", "Pathways"],
    accent: "#0369a1",
  },
  contact: {
    title: "Rollout conversation",
    caption: "Walkthroughs connect website proof to live workspace setup.",
    panels: ["Discovery", "Demo", "Pilot", "Deploy"],
    accent: "#334155",
  },
  intake: {
    title: "Guided intake",
    caption: "Structured onboarding creates your workspace and first pipeline lane.",
    panels: ["Company", "Scope", "Plan", "Launch"],
    accent: "#2563eb",
  },
  "job-board": {
    title: "FCA job & contractor board",
    caption: "PlanHub-style visibility for upcoming work and qualified contractors.",
    panels: ["Open jobs", "Contractors", "Invites", "Awards"],
    accent: "#15803d",
  },
  login: {
    title: "Secure workspace entry",
    caption: "Fresh sign-in with verification for sensitive financial data.",
    panels: ["Email", "Password", "Verify", "Workspace"],
    accent: "#1e40af",
  },
  pipeline: {
    title: "Commercial pipeline",
    caption: "Qualify opportunities and move them into estimates and projects.",
    panels: ["New", "Qualified", "Proposal", "Awarded"],
    accent: "#0f766e",
  },
  finance: {
    title: "FCA Books",
    caption: "Native payments, job costing, pay apps, and banking import.",
    panels: ["AR", "AP", "Job cost", "Reports"],
    accent: "#b45309",
  },
  projects: {
    title: "Project command",
    caption: "RFIs, change orders, files, and field tasks on one spine.",
    panels: ["Schedule", "RFIs", "COs", "Closeout"],
    accent: "#1d4ed8",
  },
};

export default function ProductIllustration({ variant = "home", compact = false }) {
  const preset = presets[variant] || presets.home;

  return (
    <div
      style={{
        border: "1px solid #dbe3ef",
        borderRadius: 16,
        overflow: "hidden",
        background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
        boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)",
      }}
      aria-hidden="true"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          borderBottom: "1px solid #e2e8f0",
          background: "#0f172a",
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
        <span style={{ marginLeft: 8, color: "#cbd5e1", fontSize: 12, fontWeight: 600 }}>FCA — {preset.title}</span>
      </div>

      <div style={{ padding: compact ? 14 : 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 14, minHeight: compact ? 140 : 180 }}>
          <div style={{ display: "grid", gap: 8 }}>
            {preset.panels.map((panel, index) => (
              <div
                key={panel}
                style={{
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: index === 0 ? "#fff" : "#334155",
                  background: index === 0 ? preset.accent : "#eef2f7",
                  border: index === 0 ? "none" : "1px solid #dbe3ef",
                }}
              >
                {panel}
              </div>
            ))}
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "#fff" }}>
            {variant === "auricrux" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <AuricruxBrandMark compact showLabel={false} />
                <div>
                  <div style={{ fontWeight: 800, color: "#7c5313" }}>Auricrux</div>
                  <div style={{ color: "#64748b", fontSize: 13 }}>Ask questions. Get next steps. Stay on the job.</div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ height: 10, width: "42%", borderRadius: 999, background: preset.accent, marginBottom: 12, opacity: 0.85 }} />
                <div style={{ height: 8, width: "88%", borderRadius: 999, background: "#e2e8f0", marginBottom: 8 }} />
                <div style={{ height: 8, width: "72%", borderRadius: 999, background: "#e2e8f0", marginBottom: 8 }} />
                <div style={{ height: 8, width: "64%", borderRadius: 999, background: "#e2e8f0", marginBottom: 16 }} />
              </>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[1, 2, 3].map((item) => (
                <div key={item} style={{ height: 52, borderRadius: 10, background: "#f8fafc", border: "1px dashed #cbd5e1" }} />
              ))}
            </div>
          </div>
        </div>
        <p style={{ margin: "12px 0 0", color: "#64748b", fontSize: 13, lineHeight: 1.55 }}>{preset.caption}</p>
      </div>
    </div>
  );
}
