const cardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 12,
  padding: 14,
  background: "#fff",
};

const buttonStyle = (tone = "primary") => ({
  border: tone === "primary" ? "1px solid #1d4ed8" : "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
  background: tone === "primary" ? "#1d4ed8" : "#fff",
  color: tone === "primary" ? "#fff" : "#0f172a",
  font: "inherit",
});

export default function BidActionCenter({ bid, updateBidStatus, clearBidBlocker, convertBidToProject }) {
  return (
    <div style={{ ...cardStyle, marginTop: 14, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" }}>
      <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Live bid actions</div>
      <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
        Move this package through real preconstruction states instead of leaving the bid route as static narrative only.
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => clearBidBlocker(bid.id, `Auricrux cleared the blocker on ${bid.package} and routed it for active approval follow-through.`)}
          style={buttonStyle("primary")}
        >
          Clear Blocker
        </button>
        <button
          type="button"
          onClick={() => updateBidStatus(bid.id, "Awaiting Approval", `Auricrux routed ${bid.package} into owner approval and preserved bid-to-revenue continuity.`)}
          style={buttonStyle()}
        >
          Route to Approval
        </button>
        <button
          type="button"
          onClick={() => updateBidStatus(bid.id, "Won", `Auricrux converted ${bid.package} into a won commercial state and cleared the path toward billing and job-start execution.`)}
          style={buttonStyle()}
        >
          Mark Won
        </button>
        <button
          type="button"
          onClick={() => convertBidToProject(bid.id, `Auricrux converted ${bid.package} into a project root and preserved bid, project, file, and audit continuity.`)}
          style={buttonStyle()}
        >
          Convert to Project
        </button>
      </div>
      {bid.lastActionAt ? (
        <div style={{ color: "#64748b", fontSize: 13, marginTop: 10 }}>
          Last action at {bid.lastActionAt}
        </div>
      ) : null}
    </div>
  );
}
