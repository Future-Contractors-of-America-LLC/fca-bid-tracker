import { useMemo, useState } from "react";

import PortalShell from "../../components/PortalShell";

import useWorkspaceState from "../../hooks/useWorkspaceState";

import useBidWorkspace from "../../hooks/useBidWorkspace";

import useBidsNextActions from "../../hooks/useBidsNextActions";

import BidActionCenter from "../../components/BidActionCenter";

import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";

import AutomationRecoveryFeed from "../../components/AutomationRecoveryFeed";

import BidQualificationChecklist from "../../components/bids/BidQualificationChecklist";

import BidsEcosystemHub from "../../components/bids/BidsEcosystemHub";

import { qualificationEvidencePackets } from "../../qualificationEvidence";

import { routeStateOverlays } from "../../systemState";

import {

  buildQualifyPayload,

  defaultBidChecklist,

  getBidChecklist,

  isQualificationReady,

  resolveEvidencePacket,

} from "../../utils/bidsModel";



const cardStyle = {

  border: "1px solid #e5e7eb",

  borderRadius: 16,

  padding: 18,

  background: "#fff",

  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",

};



const actionButtonStyle = (disabled = false) => ({

  borderRadius: 10,

  border: "1px solid #cbd5e1",

  background: disabled ? "#f8fafc" : "#ffffff",

  color: disabled ? "#94a3b8" : "#0f172a",

  fontWeight: 600,

  padding: "10px 12px",

  cursor: disabled ? "not-allowed" : "pointer",

});



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

  const bidsActions = useBidsNextActions();

  const brandSkin = readBrandSkin();

  const companyName = state?.tenant?.name || brandSkin.companyName || "Customer Workspace";

  const [selectedBidId, setSelectedBidId] = useState(() => bids[0]?.id || "");

  const [checklists, setChecklists] = useState(() =>

    Object.fromEntries(bids.map((bid) => [bid.id, getBidChecklist(bid)])),

  );



  const selectedBid = bids.find((bid) => bid.id === selectedBidId) || bids[0] || null;

  const selectedChecklist = selectedBid ? checklists[selectedBid.id] || getBidChecklist(selectedBid) : defaultBidChecklist();

  const qualificationReady = selectedBid ? isQualificationReady(selectedBid, selectedChecklist) : false;



  const brandedNarrative = useMemo(

    () =>

      `${companyName} qualification board keeps every opportunity moving from intake to estimate readiness with Auricrux carrying scope, blockers, files, and customer promises forward.`,

    [companyName],

  );



  function updateChecklist(bidId, nextChecklist) {

    setChecklists((current) => ({ ...current, [bidId]: nextChecklist }));

  }



  async function qualifySelectedBid(bid) {

    const checklist = checklists[bid.id] || getBidChecklist(bid);

    if (!isQualificationReady(bid, checklist)) return;

    const payload = buildQualifyPayload(bid, checklist);

    await updateBidQualification(

      bid.id,

      payload,

      payload.detail || "Governed qualification checklist complete.",

    );

  }



  return (

    <PortalShell

      title={`${companyName} Opportunity Qualification Board`}

      subtitle="A branded preconstruction workspace where customers advance qualification, estimate readiness, and award routing with governed checklists — not auto-filled scores."

      activeHref="/portal/bids"

      currentJourney="bid"

      routeOverlay={routeStateOverlays.bids}

      primaryHref="/portal/pipeline"

      primaryLabel="Open Commercial Pipeline"

      auricruxSurfaceKey="saas"

    >

      <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 340px) 1fr", gap: 18, marginBottom: 18 }}>

        <BidsEcosystemHub bidsActions={bidsActions.items} selectedBid={selectedBid} />

        <div style={{ ...cardStyle, background: "#f0fdf4", borderColor: "#86efac" }}>

          <div style={{ color: "#166534", fontWeight: 700, marginBottom: 8 }}>Lead-to-bid continuity</div>

          <p style={{ color: "#334155", lineHeight: 1.7, margin: 0 }}>

            Inbound demand is captured and qualified in Lead Intelligence before opportunities enter this board.

          </p>

          <a href="/portal/leads" style={{ display: "inline-block", marginTop: 10, color: "#2563eb", fontWeight: 700 }}>

            Open Lead Intelligence

          </a>

          <div style={{ color: "#475569", marginTop: 12, fontSize: 13 }}>

            <strong>Backing source:</strong> {meta.backingSource || "local"} — {meta.persistenceState}

          </div>

        </div>

      </div>



      <div style={{ ...cardStyle, marginBottom: 18, background: brandSkin.surface || "#eff6ff", borderColor: brandSkin.accent || "#1d4ed8" }}>

        <div style={{ color: brandSkin.accent || "#1d4ed8", fontWeight: 700, marginBottom: 8 }}>Qualification command surface</div>

        <h2 style={{ marginTop: 0, marginBottom: 10 }}>{companyName}</h2>

        <p style={{ color: "#334155", lineHeight: 1.7, margin: 0 }}>{brandedNarrative}</p>

      </div>



      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>

        {bids.map((bid) => {

          const evidencePacket = resolveEvidencePacket(bid.id, qualificationEvidencePackets);

          const active = bid.id === selectedBid?.id;

          const bidChecklist = checklists[bid.id] || getBidChecklist(bid);

          const ready = isQualificationReady(bid, bidChecklist);

          return (

            <div key={bid.id} style={{ ...cardStyle, borderColor: active ? "#93c5fd" : cardStyle.border }}>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>

                <div style={{ color: brandSkin.accent || "#1d4ed8", fontWeight: 700, marginBottom: 8 }}>{bid.status}</div>

                <button type="button" style={actionButtonStyle()} onClick={() => setSelectedBidId(bid.id)}>

                  {active ? "Selected" : "Review"}

                </button>

              </div>

              <h3 style={{ marginTop: 0, marginBottom: 10 }}>{bid.package}</h3>

              <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>{bid.value}</div>

              <div style={{ color: "#334155", lineHeight: 1.7, marginBottom: 12 }}>

                <div><strong>Qualification score:</strong> {bid.qualification.score}</div>

                <div><strong>Status:</strong> {bid.qualification.status}</div>

                <div><strong>Next gate:</strong> {bid.qualification.nextGate}</div>

                <div><strong>Blocker:</strong> {bid.blocker}</div>

              </div>



              {active ? (

                <div style={{ marginBottom: 12 }}>

                  <BidQualificationChecklist

                    bid={bid}

                    checklist={bidChecklist}

                    onChange={(next) => updateChecklist(bid.id, next)}

                  />

                </div>

              ) : null}



              {evidencePacket ? (

                <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#f8fafc", marginBottom: 12 }}>

                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Qualification evidence packet</div>

                  <div style={{ color: "#475569", lineHeight: 1.7 }}>

                    <div><strong>Readiness:</strong> {evidencePacket.readiness}</div>

                    <div><strong>Summary:</strong> {evidencePacket.summary}</div>

                    <div><strong>Next action:</strong> {evidencePacket.nextAction}</div>

                  </div>

                </div>

              ) : null}



              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>

                <button

                  type="button"

                  style={actionButtonStyle(!ready)}

                  disabled={!ready}

                  onClick={() => qualifySelectedBid(bid)}

                >

                  Advance Qualification

                </button>

                <button

                  type="button"

                  style={actionButtonStyle(!ready)}

                  disabled={!ready}

                  onClick={() => routeBidToEstimate(bid.id, "Opportunity routed into estimate workflow and proposal staging.")}

                >

                  Route to Estimate

                </button>

                <button

                  type="button"

                  style={actionButtonStyle()}

                  onClick={() => markWonAndCreateProject(bid.id, "Opportunity awarded and converted into a live project workspace.")}

                >

                  Award and Create Project

                </button>

              </div>



              <BidActionCenter

                bid={bid}

                updateBidStatus={updateBidStatus}

                clearBidBlocker={clearBidBlocker}

                markWonAndCreateProject={markWonAndCreateProject}

              />

            </div>

          );

        })}

      </div>



      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 24 }}>

        <CommercialContinuityFeed title="Bid revenue continuity feed" />

        <AutomationRecoveryFeed title="Bid automation feed" />

      </div>



      <div style={{ ...cardStyle, marginTop: 24 }}>

        <h2 style={{ marginTop: 0 }}>Governed preconstruction posture</h2>

        <ul style={{ paddingLeft: 20, lineHeight: 1.9, color: "#334155", marginBottom: 0 }}>

          <li>Checklist must pass before qualification or estimate routing executes</li>

          <li>Evidence packets stay tied to bid IDs BID-1 through BID-3 on the demo spine</li>

          <li>Auricrux next actions surface blockers, checklist gaps, and estimate handoffs</li>

        </ul>

        {!qualificationReady && selectedBid ? (

          <div style={{ marginTop: 12, color: "#b45309", fontWeight: 700 }}>

            Complete the checklist for {selectedBid.package} before advancing qualification.

          </div>

        ) : null}

      </div>

    </PortalShell>

  );

}


