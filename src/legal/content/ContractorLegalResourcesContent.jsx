import {
  LegalEffective,
  LegalNotice,
  LegalH3,
  LegalH4,
  LegalP,
  LegalUl,
  LegalPostalAddress,
} from "../../legal/LegalProse";
import { documentTemplates } from "../../contractorLegal/contractorLegalCatalog";
import { legalLink } from "../../legal/legalStyles";

export default function ContractorLegalResourcesContent() {
  const byCategory = {};
  documentTemplates.forEach((t) => {
    if (!byCategory[t.category]) byCategory[t.category] = [];
    byCategory[t.category].push(t);
  });

  return (
    <>
      <LegalEffective />
      <LegalNotice />
      <LegalH3>Contractor legal operating package</LegalH3>
      <LegalP>
        FCA provides templates and a live workspace for <strong>your contracting business</strong> - entity formation,
        Virginia DPOR alignment, agreements, lien waivers, insurance, and OSHA documentation. This is separate from FCA
        vendor policies (Terms, Privacy, MSA).
      </LegalP>
      <LegalP>
        <strong>Portal workspace:</strong> [Open Contractor Legal Command](/portal/legal) (login required)
      </LegalP>
      <LegalH3>Academy tracks</LegalH3>
      <LegalUl
        items={[
          "[Business Formation and Legal Setup](/academy/programs/lic-contractor-business-formation/modules/1) - Virginia LLC, EIN, operating agreement",
          "[Construction Law Essentials](/academy/programs/lic-construction-law-essentials/modules/1) - contracts, liens, subs",
          "[Virginia DPOR Residential License Prep](/academy/programs/lic-dpor-residential-contractor-prep/modules/1)",
          "[OSHA 30 Certification Prep](/academy/programs/cert-osha-30-construction/modules/1)",
        ]}
      />
      <LegalH3>Document template library</LegalH3>
      <LegalP>
        Canonical templates: <code>docs/legal/contractor/</code> in the FCA repository. Register executed documents on
        [Files](/portal/files).
      </LegalP>
      {Object.entries(byCategory).map(([category, items]) => (
        <div key={category}>
          <LegalH4>{category}</LegalH4>
          <LegalUl items={items.map((t) => `${t.title} - ${t.summary}`)} />
        </div>
      ))}
      <LegalH3>FCA entity reference</LegalH3>
      <LegalPostalAddress />
      <LegalP>
        Template and compliance questions: [legal@futurecontractorsofamerica.com](mailto:legal@futurecontractorsofamerica.com)
      </LegalP>
    </>
  );
}
