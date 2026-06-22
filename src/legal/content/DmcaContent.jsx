import { LegalEffective, LegalNotice, LegalH3, LegalP, LegalUl, LegalContact, LegalPostalAddress } from "../../legal/LegalProse";

export default function DmcaContent() {
  return (
    <>
      <LegalEffective />
      <LegalNotice />
      <LegalH3>1. Policy</LegalH3>
      <LegalP>
        FCA responds to copyright infringement notices under the Digital Millennium Copyright Act (17 U.S.C. Sec. 512).
      </LegalP>
      <LegalH3>2. Designated agent</LegalH3>
      <LegalP>
        <strong>DMCA Agent:</strong> Future Contractors of America LLC
      </LegalP>
      <LegalContact email="dmca@futurecontractorsofamerica.com" label="DMCA agent email" />
      <LegalPostalAddress label="DMCA agent mailing address" />
      <LegalH3>3. Notice requirements</LegalH3>
      <LegalUl
        items={[
          "Signature of copyright owner or authorized agent",
          "Identification of copyrighted work and infringing material (URL)",
          "Your contact information",
          "Good-faith statement and perjury statement per 17 U.S.C. Sec. 512",
        ]}
      />
      <LegalH3>4. Counter-notification</LegalH3>
      <LegalP>Counter-notifications must comply with 17 U.S.C. Sec. 512(g).</LegalP>
      <LegalH3>5. Repeat infringers</LegalH3>
      <LegalP>Accounts of repeat infringers may be terminated.</LegalP>
      <LegalP>
        See also our [Intellectual Property Notice](/ip).
      </LegalP>
    </>
  );
}
