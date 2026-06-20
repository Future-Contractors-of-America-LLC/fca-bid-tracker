import LegalPageShell from "../../components/LegalPageShell";
import ContractorLegalResourcesContent from "../../legal/content/ContractorLegalResourcesContent";

export default function ContractorLegalResources() {
  return (
    <LegalPageShell title="Contractor Legal Resources" eyebrow="For Contractors" currentHref="/legal/contractor-resources">
      <ContractorLegalResourcesContent />
    </LegalPageShell>
  );
}
