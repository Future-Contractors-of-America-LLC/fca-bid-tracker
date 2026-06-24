import AuricruxInsightPanel from "../auricrux/AuricruxInsightPanel";

export default function PortalSliceAuricrux({
  title = "Auricrux Intelligence",
  targetObjectType = "Project",
  targetObjectId,
  sourceRoute,
  rationale,
  nextAction,
  actionHref,
  actionLabel,
  tone = "blue",
  liveRecommend = true,
}) {
  if (!targetObjectId) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <AuricruxInsightPanel
        title={title}
        targetObjectType={targetObjectType}
        targetObjectId={targetObjectId}
        sourceRoute={sourceRoute}
        rationale={rationale}
        nextAction={nextAction}
        actionHref={actionHref}
        actionLabel={actionLabel}
        tone={tone}
        liveRecommend={liveRecommend}
      />
    </div>
  );
}
