import { LegalEffective, LegalNotice, LegalH3, LegalP, LegalTable, LegalContact } from "../../legal/LegalProse";

export default function SubprocessorsContent() {
  return (
    <>
      <LegalEffective />
      <LegalNotice />
      <LegalP>
        FCA uses subprocessors bound by data protection obligations. Enterprise customers receive thirty (30) days notice of
        material additions per our DPA.
      </LegalP>
      <LegalH3>Infrastructure and platform</LegalH3>
      <LegalTable
        headers={["Subprocessor", "Purpose", "Location"]}
        rows={[
          ["Microsoft Azure", "Hosting, databases, functions, Key Vault", "United States"],
          ["Microsoft Entra ID", "SSO (if enabled)", "United States"],
          ["Microsoft Azure OpenAI / AI Foundry", "AI inference (if enabled)", "United States"],
          ["GitHub (Microsoft)", "CI/CD — no production Customer Data", "United States"],
        ]}
      />
      <LegalH3>Payments</LegalH3>
      <LegalTable
        headers={["Subprocessor", "Purpose", "Location"]}
        rows={[["Stripe", "Payment processing", "United States"]]}
      />
      <LegalH3>Communications</LegalH3>
      <LegalTable
        headers={["Subprocessor", "Purpose", "Location"]}
        rows={[["Microsoft 365 / Exchange Online", "Transactional email", "United States"]]}
      />
      <LegalP>
        Subscribe to updates: legal@futurecontractorsofamerica.com with subject &quot;Subprocessor updates.&quot;
      </LegalP>
      <LegalContact email="privacy@futurecontractorsofamerica.com" />
    </>
  );
}
