import { useMemo } from "react";
import PortalShell from "../../components/PortalShell";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useBidWorkspace from "../../hooks/useBidWorkspace";
import { qualificationEvidencePackets } from "../../qualificationEvidence";
import { routeStateOverlays } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

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
  const { bids, meta, updateBidQualification, routeBidToEstimate, markWonAndCreateProject } = useBidWorkspace();
  const brandSkin = readBrandSkin();
  const companyName = state?.tenant?.name || brandSkin.companyName || "Customer Workspace";

  const brandedNarrative = useMemo(() => `${companyName} qualification board keeps every opportunity moving from intake to estimate readiness with Auricrux carrying scope, blockers, files, and customer promises forward.`, [companyName]);

  return (
    <PortalShell
      title={`${companyName} Opportunity Qualification Board`}
      subtitle="A branded preconstruction workspace where customers can actually advance qualification, estimate readiness, and award routing instead of reading commentary only."
      activeHref="/portal/bids"
      currentJourney="bid"
      routeOverlay={routeStateOverlays.bids}
      primaryHref="/portal/estimates"
      primaryLabel="Open Estimate Workflow"
    >
      <div style={{ ...cardStyle, marginBottom: 18, background: brandSkin.surface || "#eff6ff", borderColor: brandSkin.accent || "#1d4ed8" }}>
        <div style={{ color: brandSkin.accent || "#1d4ed8", fontWeight: 700, marginBottom: 8 }}>Customer-branded qualification experience</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>{companyName}</h2>
        <p style={{ color: "#334155", lineHeight: 1.7, margin: 0 }}>{brandedNarrative}</p>
        <div style={{ color: "#475569", lineHeight: 1.7, marginTop: 12 }}>
          <div><strong>Qualification tools:</strong> score opportunities, route to estimate, and mark awards</div>
          <div><strong>Auricrux:</strong> guided next actions on every opportunity</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        {bids.map((bid) => {
          const evidencePacket = qualificationEvidencePackets.find((packet) => packet.bidId === bid.id);
          return (
            <div key={bid.id} style={cardStyle}>
              <div style={{ color: brandSkin.accent || "#1d4ed8", fontWeight: 700, marginBottom: 8 }}>{bid.status}</div>
              <h3 style={{ marginTop: 0, marginBottom: 10 }}>{bid.package}</h3>
              <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>{bid.value}</div>
              <div style={{ color: "#334155", lineHeight: 1.7, marginBottom: 12 }}>
                <div><strong>Qualification score:</strong> {bid.qualification.score}</div>
                <div><strong>Status:</strong> {bid.qualification.status}</div>
                <div><strong>Next gate:</strong> {bid.qualification.nextGate}</div>
                <div><strong>Blocker:</strong> {bid.blocker}</div>
              </div>
              {evidencePacket ? (
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#f8fafc", marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Evidence packet</div>
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
                  style={actionButtonStyle}
                  onClick={() => updateBidQualification(bid.id, {
                    score: "88/100",
                    status: "Qualified",
                    budgetFit: "Confirmed",
                    scopeFit: "Confirmed",
                    evidence: "Customer scope, budget, and files confirmed",
                    nextGate: "Route to estimate",
                  }, "Auricrux qualified the opportunity and cleared the estimate gate.")}
                >
                  Qualify Opportunity
                </button>
                <button
                  type="button"
                  style={actionButtonStyle}
                  onClick={() => routeBidToEstimate(bid.id, "Opportunity routed into estimate workflow and proposal staging.")}
                >
                  Route to Estimate
                </button>
                <button
                  type="button"
                  style={actionButtonStyle}
                  onClick={() => markWonAndCreateProject(bid.id, "Opportunity awarded and converted into a live project workspace.")}
                >
                  Award and Create Project
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Auricrux confirmed in SaaS</h2>
        <ul style={{ paddingLeft: 20, lineHeight: 1.9, color: "#334155", marginBottom: 0 }}>
          <li>Explains qualification posture, blockers, and readiness</li>
          <li>Recommends the next estimate or award action</li>
          <li>Executes qualification updates, estimate routing, and project conversion</li>
        </ul>
      </div>
    </PortalShell>
  );
}
