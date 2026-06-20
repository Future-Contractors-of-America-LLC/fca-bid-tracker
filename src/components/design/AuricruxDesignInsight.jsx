import AuricruxInsightPanel from "./AuricruxInsightPanel";

export default function AuricruxDesignInsight({ intelligence, onAskAuricrux, projectId = "", fileId = "" }) {
  if (!intelligence) return null;
  const targetId = projectId || fileId || "";
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <AuricruxInsightPanel
        title="Auricrux Design Intelligence"
        targetObjectType={fileId ? "File" : "Project"}
        targetObjectId={targetId}
        sourceRoute="/portal/design"
        rationale={intelligence.nextAction || "Review design workspace posture and advance governed precon continuity."}
        nextAction={intelligence.nextAction}
        counts={intelligence.counts}
        tone="amber"
        liveRecommend={Boolean(targetId)}
      />
      <button
        type="button"
        onClick={onAskAuricrux}
        style={{ border: "1px solid #d97706", background: "#fef3c7", color: "#92400e", borderRadius: 10, padding: "8px 12px", fontWeight: 700, cursor: "pointer", justifySelf: "start" }}
      >
        Ask Auricrux about this sheet
      </button>
    </div>
  );
}
