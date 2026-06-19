import { LegalEffective, LegalNotice, LegalH3, LegalP, LegalUl, LegalContact } from "../../legal/LegalProse";

export default function AiPolicyContent() {
  return (
    <>
      <LegalEffective />
      <LegalNotice />
      <LegalH3>1. Principles</LegalH3>
      <LegalUl
        items={[
          "Customer control: data serves your workspace, not public models for others unless you opt in",
          "Transparency: AI-assisted outputs identified where practicable",
          "Human responsibility: review AI outputs before bids, safety, and compliance commitments",
          "Security: prompts and outputs protected per our [Security overview](/security)",
        ]}
      />
      <LegalH3>2. What we do</LegalH3>
      <LegalUl
        items={[
          "Inference for suggestions, summaries, and Auricrux workflows",
          "Logging for debugging, abuse prevention, and quality",
          "Aggregated de-identified metrics to improve features",
          "Opt-in training on anonymized patterns — default off for enterprise",
        ]}
      />
      <LegalH3>3. What we do not do</LegalH3>
      <LegalUl
        items={[
          "Sell Customer Data to AI vendors for their model training",
          "Use Customer Data to train foundation models for other customers without opt-in",
          "Represent AI outputs as licensed professional certifications",
        ]}
      />
      <LegalH3>4. Subprocessors</LegalH3>
      <LegalP>
        AI may use Microsoft Azure OpenAI per our [Subprocessor List](/subprocessors).
      </LegalP>
      <LegalContact email="legal@futurecontractorsofamerica.com" label="Enterprise AI options" />
    </>
  );
}
