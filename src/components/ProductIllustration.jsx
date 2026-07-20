/**
 * Product UI mock illustrations — show how Contractor Command actually looks
 * (takeoff, plan room, financials), not abstract wireframe bars.
 */

const chrome = {
  shell: {
    border: "1px solid #dbe3ef",
    borderRadius: 16,
    overflow: "hidden",
    background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
    boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)",
  },
  titlebar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderBottom: "1px solid #e2e8f0",
    background: "#0c2340",
  },
  dot: (color) => ({ width: 10, height: 10, borderRadius: "50%", background: color }),
  title: { marginLeft: 8, color: "#cbd5e1", fontSize: 12, fontWeight: 600 },
  body: { padding: 16 },
  caption: { margin: "12px 0 0", color: "#64748b", fontSize: 13, lineHeight: 1.55 },
};

function TitleBar({ label }) {
  return (
    <div style={chrome.titlebar}>
      <span style={chrome.dot("#ef4444")} />
      <span style={chrome.dot("#f59e0b")} />
      <span style={chrome.dot("#22c55e")} />
      <span style={chrome.title}>FCA — {label}</span>
    </div>
  );
}

function TakeoffMock({ compact }) {
  const rows = [
    { code: "03 30 00", desc: "Cast-in-place concrete", qty: "842 CY", unit: "$186", total: "$156,612" },
    { code: "05 12 00", desc: "Structural steel", qty: "64 TON", unit: "$4,280", total: "$273,920" },
    { code: "09 29 00", desc: "Gypsum board", qty: "18,400 SF", unit: "$2.14", total: "$39,376" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "140px 1fr", gap: 12, minHeight: compact ? 150 : 200 }}>
      {!compact ? (
        <div style={{ display: "grid", gap: 6 }}>
          {["Sheets", "Takeoff", "Assemblies", "Pricing"].map((item, i) => (
            <div
              key={item}
              style={{
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 11,
                fontWeight: 700,
                color: i === 1 ? "#fff" : "#334155",
                background: i === 1 ? "#0f766e" : "#eef2f7",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      ) : null}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f0fdfa", borderBottom: "1px solid #ccfbf1" }}>
          <strong style={{ fontSize: 12, color: "#0f766e" }}>Estimate · Bid #4821</strong>
          <span style={{ fontSize: 11, color: "#64748b" }}>Takeoff live</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ background: "#f8fafc", color: "#64748b", textAlign: "left" }}>
              <th style={{ padding: "6px 8px", fontWeight: 600 }}>CSI</th>
              <th style={{ padding: "6px 8px", fontWeight: 600 }}>Scope</th>
              <th style={{ padding: "6px 8px", fontWeight: 600 }}>Qty</th>
              {!compact ? <th style={{ padding: "6px 8px", fontWeight: 600 }}>Ext.</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.code} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={{ padding: "7px 8px", color: "#0f766e", fontWeight: 700 }}>{row.code}</td>
                <td style={{ padding: "7px 8px", color: "#334155" }}>{row.desc}</td>
                <td style={{ padding: "7px 8px", color: "#0f172a", fontWeight: 600 }}>{row.qty}</td>
                {!compact ? <td style={{ padding: "7px 8px", color: "#0f172a", fontWeight: 700 }}>{row.total}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlansMock({ compact }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "1fr 1fr", gap: 12, minHeight: compact ? 150 : 200 }}>
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#0f172a", padding: 12, position: "relative", minHeight: 140 }}>
        <div style={{ position: "absolute", inset: 16, border: "1px dashed rgba(148,163,184,0.35)", borderRadius: 6 }} />
        <div style={{ position: "absolute", top: 28, left: 28, right: 40, height: 1, background: "rgba(96,165,250,0.55)" }} />
        <div style={{ position: "absolute", top: 28, left: 28, bottom: 36, width: 1, background: "rgba(96,165,250,0.55)" }} />
        <div style={{ position: "absolute", top: 52, left: 48, width: 72, height: 48, border: "2px solid #fbbf24", borderRadius: 4, background: "rgba(251,191,36,0.12)" }} />
        <div style={{ position: "absolute", bottom: 20, left: 16, color: "#93c5fd", fontSize: 10, fontWeight: 700 }}>A-201 · Level 2 Floor Plan</div>
        <div style={{ position: "absolute", top: 48, left: 128, background: "#dc2626", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 4 }}>RFI-14</div>
      </div>
      {!compact ? (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#1d4ed8", marginBottom: 6 }}>Plan creation panel</div>
            <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.5 }}>Sheets linked · markups synced · takeoff regions tagged to CSI.</div>
          </div>
          <div style={{ border: "1px solid #fde68a", borderRadius: 10, padding: 10, background: "#fffbeb" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#b45309" }}>Open conflict</div>
            <div style={{ fontSize: 11, color: "#78350f", marginTop: 4 }}>Shaft wall at Grid C-4 missing on demo sheet.</div>
          </div>
          <div style={{ border: "1px solid #bbf7d0", borderRadius: 10, padding: 10, background: "#f0fdf4" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#15803d" }}>Next action</div>
            <div style={{ fontSize: 11, color: "#166534", marginTop: 4 }}>Issue RFI-14 to architect · due Fri.</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FinanceMock({ compact }) {
  const cards = [
    { label: "AR current", value: "$184.2k", tone: "#15803d" },
    { label: "Job cost variance", value: "-2.4%", tone: "#b45309" },
    { label: "Pay apps due", value: "3", tone: "#1d4ed8" },
  ];
  return (
    <div style={{ display: "grid", gap: 10, minHeight: compact ? 140 : 180 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {cards.map((card) => (
          <div key={card.label} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 8px", background: "#fff", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>{card.label}</div>
            <div style={{ fontSize: compact ? 14 : 16, fontWeight: 800, color: card.tone, marginTop: 4 }}>{card.value}</div>
          </div>
        ))}
      </div>
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
        <div style={{ padding: "8px 12px", background: "#fff7ed", borderBottom: "1px solid #fed7aa", fontSize: 12, fontWeight: 700, color: "#9a3412" }}>
          Financials · Job cost &amp; billing
        </div>
        {[
          ["Pay App #7 — Riverside School", "Ready to issue", "#15803d"],
          ["CO #12 — Structural steel", "Needs SOV update", "#b45309"],
          ["Bank import · 14 txs", "Match to jobs", "#1d4ed8"],
        ].map(([title, status, color]) => (
          <div key={title} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "8px 12px", borderTop: "1px solid #f1f5f9", fontSize: 11 }}>
            <span style={{ color: "#334155", fontWeight: 600 }}>{title}</span>
            <span style={{ color, fontWeight: 700 }}>{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineMock({ compact }) {
  const stages = [
    { name: "Qualify", count: 6, active: false },
    { name: "Estimate", count: 3, active: true },
    { name: "Propose", count: 2, active: false },
    { name: "Award", count: 1, active: false },
  ];
  return (
    <div style={{ display: "grid", gap: 10, minHeight: compact ? 130 : 170 }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${stages.length}, 1fr)`, gap: 8 }}>
        {stages.map((stage) => (
          <div
            key={stage.name}
            style={{
              borderRadius: 10,
              padding: 10,
              border: stage.active ? "1px solid #2563eb" : "1px solid #e2e8f0",
              background: stage.active ? "#eff6ff" : "#fff",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: stage.active ? "#1d4ed8" : "#64748b" }}>{stage.name}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{stage.count}</div>
          </div>
        ))}
      </div>
      <div style={{ border: "1px solid #dbeafe", borderRadius: 10, padding: 12, background: "#f8fbff", fontSize: 12, color: "#1e40af", lineHeight: 1.5 }}>
        Active: Memorial Clinic · GMP package due Thursday · margin check before submit.
      </div>
    </div>
  );
}

function AuricruxMock() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      <img
        src="/brand/auricrux/auricrux-avatar-portrait.png"
        alt=""
        width={56}
        height={56}
        style={{ borderRadius: "50%", objectFit: "cover", border: "2px solid #d49a22", flexShrink: 0 }}
      />
      <div>
        <div style={{ fontWeight: 800, color: "#7c5313" }}>Auricrux</div>
        <div style={{ color: "#334155", fontSize: 13, lineHeight: 1.55, marginTop: 6 }}>
          Pay App #7 is ready, but CO #12 still needs an SOV line. Fix that first, then issue — keeps the owner conversation clean.
        </div>
      </div>
    </div>
  );
}

function AcademyMock({ compact }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {[
        { title: "OSHA 30 certification prep", meta: "12 modules · in progress", pct: 62 },
        { title: "Electrical apprenticeship · Year 1", meta: "Core Level 3", pct: 34 },
        { title: "Virginia DPOR Class A prep", meta: "Exam readiness", pct: 18 },
      ].slice(0, compact ? 2 : 3).map((row) => (
        <div key={row.title} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{row.title}</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{row.meta}</div>
          <div style={{ marginTop: 8, height: 6, borderRadius: 999, background: "#e2e8f0" }}>
            <div style={{ width: `${row.pct}%`, height: "100%", borderRadius: 999, background: "#0369a1" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const presets = {
  home: {
    title: "Contractor Command",
    caption: "Pipeline, takeoff, plans, financials, and Academy in one workspace.",
    Mock: PipelineMock,
  },
  takeoff: {
    title: "Estimating & takeoff",
    caption: "Quantity takeoff tied to CSI, pricing, and the live bid package.",
    Mock: TakeoffMock,
  },
  estimates: {
    title: "Estimating & takeoff",
    caption: "Quantity takeoff tied to CSI, pricing, and the live bid package.",
    Mock: TakeoffMock,
  },
  plans: {
    title: "Plan creation panel",
    caption: "Sheets, markups, RFIs, and takeoff regions on one plan spine.",
    Mock: PlansMock,
  },
  finance: {
    title: "Financials",
    caption: "Job cost, pay apps, AR, and bank import — FCA Books, not a bolted-on ledger.",
    Mock: FinanceMock,
  },
  platform: {
    title: "Lifecycle operating board",
    caption: "From first opportunity through delivery, billing, and closeout.",
    Mock: PipelineMock,
  },
  pricing: {
    title: "Rollout planner",
    caption: "Match tier depth to team size, products, and Academy needs.",
    Mock: PipelineMock,
  },
  features: {
    title: "Connected modules",
    caption: "Every workflow shares the same project spine and customer record.",
    Mock: TakeoffMock,
  },
  solutions: {
    title: "Trade-ready pathways",
    caption: "Electrical, GC, and specialty teams get purpose-built starting points.",
    Mock: PipelineMock,
  },
  auricrux: {
    title: "Auricrux guidance",
    caption: "Plainspoken next actions tied to the job you are already on.",
    Mock: AuricruxMock,
  },
  academy: {
    title: "Workforce academy",
    caption: "Credentials and field readiness tied to live project work.",
    Mock: AcademyMock,
  },
  contact: {
    title: "Rollout conversation",
    caption: "Walkthroughs connect website proof to live workspace setup.",
    Mock: PipelineMock,
  },
  intake: {
    title: "Guided intake",
    caption: "Structured onboarding creates your workspace and first pipeline lane.",
    Mock: PipelineMock,
  },
  "job-board": {
    title: "FCA job & contractor board",
    caption: "Visibility for upcoming work and qualified contractors.",
    Mock: PipelineMock,
  },
  login: {
    title: "Secure workspace entry",
    caption: "Sign in once — Academy, portal, and Auricrux share the same session.",
    Mock: PipelineMock,
  },
  pipeline: {
    title: "Commercial pipeline",
    caption: "Qualify opportunities and move them into estimates and projects.",
    Mock: PipelineMock,
  },
  projects: {
    title: "Project command",
    caption: "RFIs, change orders, files, and field tasks on one spine.",
    Mock: PlansMock,
  },
};

export default function ProductIllustration({ variant = "home", compact = false }) {
  const preset = presets[variant] || presets.home;
  const Mock = preset.Mock;

  return (
    <div style={chrome.shell} aria-hidden="true">
      <TitleBar label={preset.title} />
      <div style={chrome.body}>
        <Mock compact={compact} />
        <p style={chrome.caption}>{preset.caption}</p>
      </div>
    </div>
  );
}
