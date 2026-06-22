import { useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import BidActionCenter from "../../components/BidActionCenter";
import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useBidWorkspace from "../../hooks/useBidWorkspace";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { qualificationEvidencePackets } from "../../qualificationEvidence";
import { routeStateOverlays } from "../../systemState";
import { portalCardStyle, portalEyebrowStyle, portalTokens } from "../../portalDesignTokens";

const actionButtonStyle = {
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 600,
  padding: "10px 12px",
  cursor: "pointer",
};

const BRAND_STORAGE_KEY = "fca_customer_brand_skin_v1";

function readBrandSkin() {
  if (typeof window === "undefined") return { companyName: "Customer Workspace", accent: "#1d4ed8", surface: "#eff6ff" };
  try {
    return JSON.parse(window.localStorage.getItem(BRAND_STORAGE_KEY) || "{}");
  } catch {
    return { companyName: "Customer Workspace", accent: "#1d4ed8", surface: "#eff6ff" };
  }
}

export default function PortalBids() {
  const { state } = useWorkspaceState();
  const {
    bids,
    meta,
    updateBidStatus,
    clearBidBlocker,
    updateBidQualification,
    routeBidToEstimate,
    markWonAndCreateProject,
  } = useBidWorkspace();
  const [activeBidId, setActiveBidId] = useState(() => bids[0]?.id || "");
  const activeBid = bids.find((entry) => entry.id === activeBidId) || bids[0] || null;
  const brandSkin = readBrandSkin();
  const companyName = state?.tenant?.name || brandSkin.companyName || "Customer Workspace";
  const activeEvidence = qualificationEvidencePackets.find((packet) => packet.bidId === activeBid?.id);

  const brandedNarrative = useMemo(
    () =>
      `${companyName} qualification board keeps every opportunity moving from intake to estimate readiness with Auricrux carrying scope, blockers, files, and customer promises forward.`,
    [companyName]
  );

  return (
    <PortalShell
      title={`${companyName} Opportunity Qualification Board`}
      subtitle="Qualify opportunities, build estimates, and route awards to live projects."
      activeHref="/portal/bids"
      currentJourney="bid"
      routeOverlay={routeStateOverlays.bids}
      primaryHref="/portal/estimates"
      primaryLabel="Open Estimate Workflow"
    >
      <div style={{ ...portalCardStyle, marginBottom: 18, background: brandSkin.surface || portalTokens.primarySoft, borderLeft: `4px solid ${brandSkin.accent || portalTokens.primary}` }}>
        <div style={{ ...portalEyebrowStyle, color: brandSkin.accent || portalTokens.primary }}>Qualification command surface</div>
        <h2 style={{ marginTop: 6, marginBottom: 10 }}>{companyName}</h2>
        <p style={{ color: portalTokens.body, lineHeight: 1.7, margin: 0 }}>{brandedNarrative}</p>
        <div style={{ color: portalTokens.body, lineHeight: 1.7, marginTop: 12, fontSize: 14 }}>
          <div><strong>Backing:</strong> {meta.persistenceState}</div>
          <div><strong>Source:</strong> {meta.backingSource}</div>
        </div>
      </div>

      {activeBid?.id ? (
        <div style={{ marginBottom: 18 }}>
          <AuricruxInsightPanel
            title="Auricrux Qualification Intelligence"
            targetObjectType="Bid"
            targetObjectId={activeBid.id}
            sourceRoute="/portal/bids"
            rationale={`Advance ${activeBid.package || activeBid.id} through qualification and estimate readiness.`}
            nextAction={activeBid.qualification?.nextGate || "Complete qualification scoring and route to estimate or award."}
            actionHref="/portal/pipeline"
            actionLabel="Open pipeline"
            tone="blue"
            liveRecommend
          />
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 18 }}>
        {bids.map((bid) => {
          const isActive = bid.id === activeBidId;
          return (
            <button
              key={bid.id}
              type="button"
              onClick={() => setActiveBidId(bid.id)}
              style={{
                ...portalCardStyle,
                textAlign: "left",
                cursor: "pointer",
                outline: isActive ? `2px solid ${brandSkin.accent || portalTokens.primary}` : "none",
                font: "inherit",
              }}
            >
              <div style={{ color: brandSkin.accent || portalTokens.primary, fontWeight: 700, marginBottom: 8 }}>{bid.status}</div>
              <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: "1.05rem" }}>{bid.package}</h3>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{bid.value}</div>
              <div style={{ color: portalTokens.body, lineHeight: 1.6, fontSize: 14 }}>
                <div><strong>Score:</strong> {bid.qualification.score}</div>
                <div><strong>Gate:</strong> {bid.qualification.nextGate}</div>
                <div><strong>Blocker:</strong> {bid.blocker}</div>
              </div>
            </button>
          );
        })}
      </div>

      {activeBid ? (
        <div style={{ display: "grid", gap: 16, marginBottom: 18 }}>
          <div style={portalCardStyle}>
            <div style={portalEyebrowStyle}>Qualification evidence packet</div>
            {activeEvidence ? (
              <div style={{ color: portalTokens.body, lineHeight: 1.7, marginTop: 8 }}>
                <div><strong>Readiness:</strong> {activeEvidence.readiness}</div>
                <div><strong>Summary:</strong> {activeEvidence.summary}</div>
                <div><strong>Next action:</strong> {activeEvidence.nextAction}</div>
              </div>
            ) : (
              <p style={{ color: portalTokens.body, marginTop: 8, marginBottom: 0 }}>
                Auricrux will assemble the evidence packet once scope, budget, and file posture are confirmed.
              </p>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
              <button
                type="button"
                style={actionButtonStyle}
                onClick={() =>
                  updateBidQualification(
                    activeBid.id,
                    {
                      score: "82/100",
                      status: "In review",
                      budgetFit: "Pending",
                      scopeFit: "Confirmed",
                      evidence: "Scope files staged; budget confirmation pending",
                      nextGate: "Confirm budget fit",
                    },
                    "Qualification command surface updated with budget-fit review."
                  )
                }
              >
                Advance Qualification
              </button>
              <button
                type="button"
                style={actionButtonStyle}
                onClick={() =>
                  updateBidQualification(
                    activeBid.id,
                    {
                      score: "88/100",
                      status: "Qualified",
                      budgetFit: "Confirmed",
                      scopeFit: "Confirmed",
                      evidence: "Customer scope, budget, and files confirmed",
                      nextGate: "Route to estimate",
                    },
                    "Mark Budget Fit confirmed and cleared the estimate gate."
                  )
                }
              >
                Mark Budget Fit
              </button>
              <button
                type="button"
                style={actionButtonStyle}
                onClick={() => routeBidToEstimate(activeBid.id, "Qualified opportunity routed into estimate production.")}
              >
                Route to Estimate
              </button>
            </div>
          </div>

          {(() => {
            const bid = activeBid;
            return <BidActionCenter bid={bid} updateBidStatus={updateBidStatus} clearBidBlocker={clearBidBlocker} markWonAndCreateProject={markWonAndCreateProject} />;
          })()}
        </div>
      ) : null}

      <CommercialContinuityFeed title="Bid revenue continuity feed" detail="Recent qualification, approval, and award moves across the bid workspace." />
    </PortalShell>
  );
}
