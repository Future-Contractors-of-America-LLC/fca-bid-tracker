import { LegalEffective, LegalNotice, LegalH3, LegalP, LegalUl, LegalContact } from "../../legal/LegalProse";

export default function AccessibilityContent() {
  return (
    <>
      <LegalEffective />
      <LegalNotice />
      <LegalH3>1. Commitment</LegalH3>
      <LegalP>
        FCA aims to conform to WCAG 2.1 Level AA for web surfaces over time.
      </LegalP>
      <LegalH3>2. Measures</LegalH3>
      <LegalUl
        items={[
          "Semantic HTML and ARIA where appropriate",
          "Keyboard navigability for core workflows",
          "Color contrast in default themes",
          "Accessibility review in design system updates",
        ]}
      />
      <LegalH3>3. VPAT</LegalH3>
      <LegalP>
        A Voluntary Product Accessibility Template is available to enterprise customers at legal@futurecontractorsofamerica.com.
      </LegalP>
      <LegalH3>4. Feedback</LegalH3>
      <LegalContact email="info@futurecontractorsofamerica.com" label="Accessibility feedback" />
    </>
  );
}
