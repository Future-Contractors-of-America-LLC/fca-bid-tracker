import PortalShell from "../../components/PortalShell";
import FounderProofPath from "../../components/portal/FounderProofPath";
import useCustomerSession from "../../hooks/useCustomerSession";
import { isFounderSession } from "../../customerSession";
import { FOUNDER_PROOF_PROJECT_ID } from "../../config/productionMode";
import { portalCardStyle, portalEyebrowStyle, portalTokens } from "../../portalDesignTokens";

export default function PortalProof() {
  const { session } = useCustomerSession();
  const founder = isFounderSession(session);

  return (
    <PortalShell
      title="Founder Proof Path"
      subtitle={`Honest check for ${FOUNDER_PROOF_PROJECT_ID}: APIs up, theater rejected, empty allowed.`}
      activeHref="/portal/proof"
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
              Sign in
            </a>
          </p>
        </div>
      )}

      <div style={{ ...portalCardStyle, marginTop: 16 }}>
        <div style={portalEyebrowStyle}>How to use this today</div>
        <ol style={{ margin: "10px 0 0", paddingLeft: 18, color: portalTokens.body, lineHeight: 1.7 }}>
          <li>Sign in with managed credentials.</li>
          <li>Click <strong>Bind PRJ-BID-1</strong>.</li>
          <li>Click <strong>Create demo records</strong> — that writes live file, takeoff, RFI, invoice, and Auricrux action.</li>
          <li>Walk Files → Design → RFIs → Billing → Auricrux. If a lane is red, stop and fix that API before demos.</li>
        </ol>
      </div>
    </PortalShell>
  );
}
