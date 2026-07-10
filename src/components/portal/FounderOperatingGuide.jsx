import { portalCardStyle, portalTokens } from "../../portalDesignTokens";
import { isFounderSession } from "../../customerSession";
import { FOUNDER_PROOF_PATH } from "../../config/productionMode";
import FounderProofPath from "./FounderProofPath";

export default function FounderOperatingGuide({ bidsCount = 0, companyName = "Your workspace", session = null }) {
  if (!isFounderSession(session)) return null;

  return (
    <>
      <FounderProofPath session={session} />
      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={{ color: portalTokens.primaryInk, fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
          Commercial entry (after proof spine)
        </div>
        <h2 style={{ margin: "0 0 8px", color: portalTokens.primaryInk, fontSize: "1.1rem" }}>{companyName}</h2>
        <p style={{ margin: "0 0 12px", color: portalTokens.body, lineHeight: 1.6 }}>
          Prove the live job spine first, then sell Academy and Workspace entry SKUs on the same tenant.
          {bidsCount ? ` ${bidsCount} opportunit${bidsCount === 1 ? "y" : "ies"} on your commercial board.` : ""}
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href={FOUNDER_PROOF_PATH} style={{ color: portalTokens.primaryInk, fontWeight: 700, textDecoration: "none" }}>
            Proof path
          </a>
          <a href="/academy/store" style={{ color: portalTokens.primaryInk, fontWeight: 700, textDecoration: "none" }}>
            Academy store
          </a>
          <a href="/pricing" style={{ color: portalTokens.primaryInk, fontWeight: 700, textDecoration: "none" }}>
            Pricing
          </a>
        </div>
      </div>
    </>
  );
}
