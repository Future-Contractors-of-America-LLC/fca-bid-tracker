import { LegalEffective, LegalNotice, LegalH3, LegalH4, LegalP, LegalUl, LegalTable, LegalContact } from "../../legal/LegalProse";

export default function CookiesContent() {
  return (
    <>
      <LegalEffective />
      <LegalNotice />
      <LegalH3>1. Overview</LegalH3>
      <LegalP>
        This Cookie Policy explains how FCA uses cookies on futurecontractorsofamerica.com. It supplements our
        [Privacy Policy](/privacy).
      </LegalP>
      <LegalH3>2. Categories</LegalH3>
      <LegalTable
        headers={["Category", "Purpose", "Legal basis (EEA/UK)"]}
        rows={[
          ["Strictly necessary", "Authentication, session, security", "Essential / legitimate interest"],
          ["Functional", "Preferences and workspace settings", "Consent or legitimate interest"],
          ["Analytics", "Aggregated usage improvement", "Consent where required"],
        ]}
      />
      <LegalH3>3. Representative cookies</LegalH3>
      <LegalTable
        headers={["Name / Provider", "Purpose", "Retention"]}
        rows={[
          ["fca_session", "Authenticated session", "Session"],
          ["fca_csrf", "CSRF protection", "Session"],
          ["Microsoft Azure / SWA", "Hosting and routing", "Session"],
          ["Stripe", "Payment checkout", "Per Stripe policy"],
        ]}
      />
      <LegalH3>4. Managing cookies</LegalH3>
      <LegalP>
        Use browser controls to block or delete cookies. Blocking necessary cookies may prevent login. Where required, we
        display a consent banner before non-essential cookies.
      </LegalP>
      <LegalContact email="privacy@futurecontractorsofamerica.com" />
    </>
  );
}
