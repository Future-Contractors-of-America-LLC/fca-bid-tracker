import { BID_CHECKLIST_FIELDS, defaultBidChecklist, isQualificationReady, qualificationBlockingReasons } from "../../utils/bidsModel";

const rowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "8px 0",
  borderBottom: "1px solid #f1f5f9",
};

export default function BidQualificationChecklist({ checklist, onChange, bid = null, disabled = false }) {
  const blocking = bid ? qualificationBlockingReasons(bid, checklist) : [];
  const ready = bid ? isQualificationReady(bid, checklist) : false;

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, background: "#fff" }}>
      <strong style={{ color: "#0f172a" }}>Qualification checklist</strong>
      <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6, margin: "8px 0 12px" }}>
        All items must be complete before Auricrux can qualify this opportunity or route to estimate.
      </p>
      <div>
        {BID_CHECKLIST_FIELDS.map(({ key, label }) => (
          <label key={key} style={rowStyle}>
            <input
              type="checkbox"
              checked={Boolean(checklist?.[key])}
              disabled={disabled}
              onChange={(event) => onChange({ ...defaultBidChecklist(checklist), [key]: event.target.checked })}
            />
            <span style={{ color: "#334155", fontWeight: 600 }}>{label}</span>
          </label>
        ))}
      </div>
      {blocking.length ? (
        <ul style={{ margin: "12px 0 0", paddingLeft: 18, color: "#b45309", fontSize: 13, lineHeight: 1.6 }}>
          {blocking.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      ) : (
        <div style={{ marginTop: 12, color: ready ? "#166534" : "#64748b", fontSize: 13, fontWeight: 700 }}>
          {ready ? "Ready for governed qualification." : "Complete checklist items to qualify."}
        </div>
      )}
    </div>
  );
}
