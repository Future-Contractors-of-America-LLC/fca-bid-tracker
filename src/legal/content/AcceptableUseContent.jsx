import { LegalEffective, LegalNotice, LegalH3, LegalH4, LegalP, LegalUl, LegalContact } from "../../legal/LegalProse";

export default function AcceptableUseContent() {
  return (
    <>
      <LegalEffective />
      <LegalNotice />
      <LegalP>Violations may result in suspension under our [Terms of Service](/terms).</LegalP>
      <LegalH3>1. Permitted use</LegalH3>
      <LegalP>Lawful internal business purposes related to construction and contracting operations.</LegalP>
      <LegalH3>2. Prohibited conduct</LegalH3>
      <LegalH4>Security</LegalH4>
      <LegalUl
        items={[
          "Unauthorized vulnerability testing or access",
          "Malware, DDoS, or bypassing rate limits",
          "Accessing another customer's workspace",
        ]}
      />
      <LegalH4>Content and conduct</LegalH4>
      <LegalUl
        items={[
          "Unlawful, infringing, or harassing content",
          "Fraudulent bids or false licensing claims",
          "Spam or unauthorized resale of the Services",
        ]}
      />
      <LegalH4>AI misuse</LegalH4>
      <LegalUl
        items={[
          "False safety or compliance certifications without qualified review",
          "Extracting proprietary Auricrux logic at scale",
          "Violations of our [AI Data Use Policy](/ai-policy)",
        ]}
      />
      <LegalH3>3. Reporting</LegalH3>
      <LegalContact email="security@futurecontractorsofamerica.com" label="Report abuse" />
    </>
  );
}
