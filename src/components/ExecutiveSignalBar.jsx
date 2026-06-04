import { isCurrentRouteHref } from "../ctaBehavior";
import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";
import AuricruxExecutiveCommandInsight from "./AuricruxExecutiveCommandInsight";

const stripStyle = {
  border: "1px solid #e5d3a1",
  background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)",
  borderRadius: 16,
  padding: 16,
  marginTop: 18,
  marginBottom: 24,
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function ExecutiveSignalBar({
  mode = "portal",
  nextHref,
  nextLabel,
}) {
  const resolvedHref =
    nextHref ||
    (mode === "academy"
      ? "/portal/messages"
      : mode === "public"
        ? "/portal/platform"
        : "/portal/bids");

  const resolvedLabel =
    nextLabel ||
    (mode === "academy"
      ? "Preserve follow-through"
      : mode === "public"
        ? "Open live workspace state"
        : "Advance approval path");

  const trainingSignal =
    mode === "academy"
      ? "Two learners are ready for assignment inside the academy flow."
      : mode === "public"
        ? "Two learners remain visible in the shared academy continuity story."
        : "Two learners remain ready for academy assignment from the shared shell.";

  const intro =
    mode === "public"
      ? "Auricrux is exposing the same canonical operating state on public routes that users later see inside the portal and academy shells."
      : "Auricrux is preserving one operating story across approval, revenue, communication follow-through, and workforce readiness.";

  const currentPath = typeof window === "undefined" ? "/" : window.location.pathname;
  const showAction = !isCurrentRouteHref(resolvedHref, currentPath);

  return (
    <div style={stripStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ color: "#8a6a14", fontWeight: 700, marginBottom: 6 }}>Executive signal bar</div>
          <div style={{ color: "#334155", lineHeight: 1.6, maxWidth: 860 }}>
            {intro}
          </div>
        </div>
        {showAction ? (
          <a
            href={resolvedHref}
            style={{
              textDecoration: "none",
              background: "#111827",
              color: "#fff",
              padding: "10px 14px",
              borderRadius: 10,
              fontWeight: 700,
            }}
          >
            {resolvedLabel}
          </a>
        ) : null}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginTop: 14,
        }}
      >
        <SignalCell label="Next action" value={workspaceContext.currentNextAction} />
        <SignalCell label="Approval state" value={auricruxRail.currentBlocker} />
        <SignalCell label="Revenue impact" value={auricruxRail.blockerImpact} />
        <SignalCell label="Training continuity" value={trainingSignal} />
        <SignalCell label="Project spine" value={`${currentProject.id} · ${currentProject.stage}`} />
      </div>

      <AuricruxExecutiveCommandInsight mode="signal" nextHref={resolvedHref} nextLabel={resolvedLabel} />
    </div>
  );
}

function SignalCell({ label, value }) {
  return (
    <div
      style={{
        border: "1px solid #f0e2bb",
        borderRadius: 12,
        background: "#fffdf7",
        padding: 12,
      }}
    >
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#8a6a14", fontWeight: 700, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ color: "#111827", lineHeight: 1.5, fontSize: 14 }}>{value}</div>
    </div>
  );
}
