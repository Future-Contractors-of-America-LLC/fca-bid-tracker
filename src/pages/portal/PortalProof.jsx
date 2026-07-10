import PortalShell from "../../components/PortalShell";
import FounderProofPath from "../../components/portal/FounderProofPath";
import useCustomerSession from "../../hooks/useCustomerSession";
import { isFounderSession } from "../../customerSession";
import { FOUNDER_PROOF_PROJECT_ID, FOUNDER_PROOF_PROJECT_LABEL } from "../../config/productionMode";
import { portalCardStyle, portalEyebrowStyle, portalTokens } from "../../portalDesignTokens";

export default function PortalProof() {
  const { session } = useCustomerSession();
  const founder = isFounderSession(session);

  return (
    <PortalShell
      title="Founder Proof Path"
      subtitle={`${FOUNDER_PROOF_PROJECT_ID} · ${FOUNDER_PROOF_PROJECT_LABEL} — one live spine across project, files, takeoff, RFI, invoice, and Auricrux.`}
      activeHref="/portal/proof"
      currentJourney="job"
      primaryHref="/portal/projects"
      primaryLabel="Projects"
      navDensity="compact"
      showRouteOverlay={false}
    >
      {founder ? (
        <FounderProofPath session={session} compact />
      ) : (
        <div style={portalCardStyle}>
          <div style={portalEyebrowStyle}>Access</div>
          <p style={{ margin: "8px 0 0", color: portalTokens.body, lineHeight: 1.6 }}>
            Sign in with a founder workspace account to run the live proof path. Seeded autologin is disabled on production.
          </p>
          <p style={{ margin: "12px 0 0" }}>
            <a href="/login?next=/portal/proof" style={{ color: portalTokens.primaryInk, fontWeight: 700 }}>
              Sign in ?
            </a>
          </p>
        </div>
      )}

      <div style={{ ...portalCardStyle, marginTop: 16 }}>
        <div style={portalEyebrowStyle}>How to verify</div>
        <ol style={{ margin: "10px 0 0", paddingLeft: 18, color: portalTokens.body, lineHeight: 1.7 }}>
          <li>Sign in with managed credentials (no <code>?seeded=1</code>).</li>
          <li>Bind {FOUNDER_PROOF_PROJECT_ID} so every lane shares that id.</li>
          <li>Walk files ? design/takeoff ? RFIs ? billing ? Auricrux using the step links.</li>
          <li>Empty counts are honest — create or mutate via the live APIs, not localStorage theater.</li>
        </ol>
      </div>
    </PortalShell>
  );
}
