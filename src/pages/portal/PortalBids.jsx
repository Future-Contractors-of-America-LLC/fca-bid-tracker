import { useMemo, useState, useEffect } from "react";
import PortalShell from "../../components/PortalShell";
import BidActionCenter from "../../components/BidActionCenter";
import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useBidWorkspace from "../../hooks/useBidWorkspace";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import CreateBidForm from "../../components/portal/CreateBidForm";
import FounderOperatingGuide from "../../components/portal/FounderOperatingGuide";
import { readCustomerSession } from "../../customerSession";
import { publishPortalPageContext } from "../../portalPageContext";
import { qualificationEvidencePackets } from "../../qualificationEvidence";
import { routeStateOverlays } from "../../systemState";
import {
  PortalEntityTable,
  PortalPageIntro,
  PortalQuickStats,
  PortalStatusBadge,
} from "../../components/portal/PortalPrimitives";
import {
  portalButtonSecondary,
  portalCardStyle,
  portalEyebrowStyle,
  portalTokens,
} from "../../portalDesignTokens";

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
  const session = readCustomerSession();
  const { state } = useWorkspaceState();
  const {
    bids,
    meta,
    createBid,
    updateBidStatus,
    clearBidBlocker,
    updateBidQualification,
    routeBidToEstimate,
    markWonAndCreateProject,
  } = useBidWorkspace();
  const [activeBidId, setActiveBidId] = useState(() => bids[0]?.id || "");
  const [creatingBid, setCreatingBid] = useState(false);
  const activeBid = bids.find((entry) => entry.id === activeBidId) || bids[0] || null;
  const brandSkin = readBrandSkin();
  const companyName = state?.tenant?.name || brandSkin.companyName || "Customer Workspace";
  const activeEvidence = qualificationEvidencePackets.find((packet) => packet.bidId === activeBid?.id);

  const qualifiedCount = bids.filter((bid) => ["Qualified", "Ready for estimate", "Won"].includes(bid.status)).length;
  const blockedCount = bids.filter((bid) => bid.blocker && bid.blocker !== "None").length;

  const tableRows = useMemo(
    () =>
      bids.map((bid) => ({
        id: bid.id,
        active: bid.id === activeBidId,
        bid,
        package: bid.package,
        value: bid.value,
        status: bid.status,
        score: bid.qualification?.score || "—",
        gate: bid.qualification?.nextGate || "—",
        blocker: bid.blocker || "None",
      })),
    [activeBidId, bids],
  );

  useEffect(() => {
    if (!activeBid?.id) {
      publishPortalPageContext(null);
      return undefined;
    }
    publishPortalPageContext({
      surface: "portal-bids",
      bidId: activeBid.id,
      targetObjectId: activeBid.id,
      targetObjectType: "Bid",
    });
    return () => publishPortalPageContext(null);
  }, [activeBid?.id]);

  return (
    <PortalShell
      title="Opportunity qualification"
      subtitle="Review every bid, advance qualification, and route winners into estimates or projects."
      activeHref="/portal/bids"
      currentJourney="bid"
      routeOverlay={routeStateOverlays.bids}
      primaryHref="/portal/pipeline"
      primaryLabel="Open commercial pipeline"
    >
      <PortalPageIntro
        eyebrow="Qualification board"
        title={`${companyName} opportunities`}
        detail="Work top-down: select a bid, review evidence, advance qualification, then route to estimate or award."
      />

      <PortalQuickStats
        items={[
          { label: "Open bids", value: bids.length, hint: "Live on your spine" },
          { label: "Qualified", value: qualifiedCount, hint: "Ready for next gate" },
          { label: "Blockers", value: blockedCount, hint: "Need attention" },
        ]}
      />

      <CreateBidForm
        busy={creatingBid}
        onCreate={async (fields) => {
          setCreatingBid(true);
          try {
            const bid = await createBid(fields);
            setActiveBidId(bid.id);
          } finally {
            setCreatingBid(false);
          }
        }}
      />

      {!bids.length ? (
        <FounderOperatingGuide bidsCount={bids.length} companyName={companyName} session={session} />
      ) : null}

      {activeBid?.id ? (
        <div style={{ marginBottom: 16 }}>
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
            operateConfig={{
              variant: "bid-doteach",
              bidId: activeBid.id,
              packageLabel: activeBid.package || activeBid.id,
              sourceRoute: "/portal/bids",
            }}
          />
        </div>
      ) : null}

      <PortalEntityTable
        columns={[
          {
            key: "package",
            label: "Opportunity",
            render: (row) => (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button
                  type="button"
                  onClick={() => setActiveBidId(row.id)}
                  style={{ border: "none", background: "transparent", padding: 0, textAlign: "left", cursor: "pointer", font: "inherit", color: portalTokens.primaryInk, fontWeight: 700 }}
                >
                  {row.package}
                </button>
                <a href={`/portal/opportunities/${encodeURIComponent(row.id)}`} style={{ fontSize: 12, color: portalTokens.primary, fontWeight: 600, textDecoration: "none" }}>
                  Open detail
                </a>
              </div>
            ),
          },
          { key: "value", label: "Value" },
          {
            key: "status",
            label: "Status",
            render: (row) => <PortalStatusBadge status={row.status} active={row.active} />,
          },
          { key: "score", label: "Score" },
          { key: "gate", label: "Next gate" },
          { key: "blocker", label: "Blocker" },
        ]}
        rows={tableRows}
        emptyTitle="No bids in your qualification board"
        emptyDetail="Create your first opportunity from intake or the public job board, then return here to qualify and route work."
        emptyPrimaryHref="/portal/pipeline"
        emptyPrimaryLabel="Open pipeline"
      />

      {activeBid ? (
        <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
          <div style={portalCardStyle}>
            <div style={portalEyebrowStyle}>Qualification evidence</div>
            {activeEvidence ? (
              <div style={{ color: portalTokens.body, lineHeight: 1.7, marginTop: 8 }}>
                <div><strong>Readiness:</strong> {activeEvidence.readiness}</div>
                <div><strong>Summary:</strong> {activeEvidence.summary}</div>
                <div><strong>Next action:</strong> {activeEvidence.nextAction}</div>
              </div>
            ) : (
              <p style={{ color: portalTokens.body, marginTop: 8, marginBottom: 0 }}>
                Auricrux assembles the evidence packet once scope, budget, and file posture are confirmed.
              </p>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
              <button
                type="button"
                style={portalButtonSecondary}
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
                    "Qualification advanced to budget-fit review.",
                  )
                }
              >
                Advance qualification
              </button>
              <button
                type="button"
                style={portalButtonSecondary}
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
                    "Budget fit confirmed and estimate gate opened.",
                  )
                }
              >
                Mark budget fit confirmed
              </button>
              <button
                type="button"
                style={portalButtonSecondary}
                onClick={() => routeBidToEstimate(activeBid.id, "Qualified opportunity routed into estimate production.")}
              >
                Route to estimate
              </button>
            </div>
          </div>

          <BidActionCenter
            bid={activeBid}
            updateBidStatus={updateBidStatus}
            clearBidBlocker={clearBidBlocker}
            markWonAndCreateProject={markWonAndCreateProject}
          />
        </div>
      ) : null}

      <div style={{ marginTop: 16, color: portalTokens.muted, fontSize: 12 }}>
        Workspace sync: {meta.persistenceState}
      </div>

      <div style={{ marginTop: 16 }}>
        <CommercialContinuityFeed title="Bid activity" detail="Recent qualification, approval, and award moves." />
      </div>
    </PortalShell>
  );
}
