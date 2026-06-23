import { useMemo, useState } from "react";
import {
  APPRENTICESHIP_TRADE_OPTIONS,
  getPathwayRecommendedSequence,
  resolveSequenceStepStatus,
} from "../../academyPathwaySequences";

const cardStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 16,
  background: "#fff",
};

const statusColors = {
  complete: { border: "#86efac", bg: "#f0fdf4", label: "Complete", color: "#15803d" },
  "in-progress": { border: "#93c5fd", bg: "#eff6ff", label: "In progress", color: "#2563eb" },
  enrolled: { border: "#c4b5fd", bg: "#f5f3ff", label: "Enrolled", color: "#7c3aed" },
  advisory: { border: "#e2e8f0", bg: "#f8fafc", label: "Advisory", color: "#64748b" },
  "not-started": { border: "#e2e8f0", bg: "#fff", label: "Not started", color: "#94a3b8" },
};

function SequenceStep({ step, enrollments, accent = "#2563eb" }) {
  const status = resolveSequenceStepStatus(step, enrollments);
  const colors = statusColors[status.status] || statusColors["not-started"];
  const primaryKey = step.programKeys?.[0];

  return (
    <li style={{ ...cardStyle, border: `1px solid ${colors.border}`, background: colors.bg, listStyle: "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: accent, marginBottom: 4 }}>Step {step.order}</div>
          <strong style={{ color: "#0f172a" }}>{step.title}</strong>
          <p style={{ color: "#475569", lineHeight: 1.65, margin: "8px 0 0", fontSize: 14 }}>{step.description}</p>
          {step.bridgeFrom ? (
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
              Continues from {step.bridgeFrom} pathway
            </div>
          ) : null}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700, color: colors.color, fontSize: 13 }}>{colors.label}</div>
          {status.progressPercent > 0 && status.status !== "complete" ? (
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{status.progressPercent}%</div>
          ) : null}
        </div>
      </div>
      {primaryKey && status.status !== "complete" ? (
        <a
          href={`/academy/programs/${primaryKey}`}
          style={{ display: "inline-block", marginTop: 12, color: accent, fontWeight: 700, textDecoration: "none", fontSize: 14 }}
        >
          {status.status === "not-started" ? "View course" : "Continue course"}
        </a>
      ) : null}
      {status.status === "complete" && primaryKey ? (
        <a href={`/academy/programs/${primaryKey}`} style={{ display: "inline-block", marginTop: 12, color: "#15803d", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
          Review completed course
        </a>
      ) : null}
    </li>
  );
}

export default function AcademyPathwaySequenceWizard({
  pathwayKey,
  topicKey,
  tradeKey: initialTradeKey,
  enrollments = [],
  accent = "#2563eb",
  title = "Recommended sequence",
  subtitle = "Follow this Auricrux-guided path from foundations through credential and licensure readiness.",
}) {
  const [tradeKey, setTradeKey] = useState(initialTradeKey || "electrical");

  const sequence = useMemo(() => {
    if (pathwayKey === "apprenticeship" && !topicKey) {
      return getPathwayRecommendedSequence("apprenticeship", { tradeKey });
    }
    return getPathwayRecommendedSequence(pathwayKey, { topicKey, tradeKey });
  }, [pathwayKey, topicKey, tradeKey]);

  if (!sequence?.steps?.length) return null;

  const completedCount = sequence.steps.filter((step) => resolveSequenceStepStatus(step, enrollments).status === "complete").length;

  return (
    <section style={{ ...cardStyle, marginBottom: 24, border: `1px solid ${accent}33`, background: "#fafafa" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: "0 0 6px", fontSize: 20, color: "#0f172a" }}>{sequence.title || title}</h2>
          <p style={{ color: "#475569", lineHeight: 1.65, margin: 0, fontSize: 14 }}>{subtitle}</p>
        </div>
        <div style={{ fontSize: 14, color: "#64748b", alignSelf: "center" }}>
          <strong style={{ color: accent }}>{completedCount}</strong> / {sequence.steps.length} steps complete
        </div>
      </div>

      {pathwayKey === "apprenticeship" && !topicKey ? (
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", marginRight: 8 }}>Trade</label>
          <select
            value={tradeKey}
            onChange={(event) => setTradeKey(event.target.value)}
            style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", font: "inherit" }}
          >
            {APPRENTICESHIP_TRADE_OPTIONS.map((trade) => (
              <option key={trade.key} value={trade.key}>{trade.label}</option>
            ))}
          </select>
        </div>
      ) : null}

      <ol style={{ margin: 0, padding: 0, display: "grid", gap: 12 }}>
        {sequence.steps.map((step) => (
          <SequenceStep key={`${step.order}-${step.title}`} step={step} enrollments={enrollments} accent={accent} />
        ))}
      </ol>

      <p style={{ color: "#64748b", fontSize: 12, lineHeight: 1.6, marginTop: 16, marginBottom: 0 }}>
        Sequences reflect curriculum alignment and exam preparation. Agency registration, board acceptance, and credential issuance are determined by the governing authority.
      </p>
    </section>
  );
}
