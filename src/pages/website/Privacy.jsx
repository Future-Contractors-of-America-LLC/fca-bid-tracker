import LegalPageShell from "../../components/LegalPageShell";

export default function Privacy() {
  return (
    <LegalPageShell title="Privacy Policy" eyebrow="Legal">
      <p><strong>Effective date:</strong> June 18, 2026</p>
      <p>
        Future Contractors of America (FCA) respects your privacy. This policy describes what we collect, how we use it,
        and the choices available to customers.
      </p>
      <h3 style={{ color: "#0f172a" }}>Information we collect</h3>
      <p>
        We collect account information (name, email, company), billing data processed by Stripe, workspace activity needed to
        operate projects and bids, and support communications you send to us.
      </p>
      <h3 style={{ color: "#0f172a" }}>How we use information</h3>
      <p>
        Data is used to provide and improve FCA services, authenticate users, process payments, deliver academy content,
        and respond to support requests. We do not sell personal information.
      </p>
      <h3 style={{ color: "#0f172a" }}>Storage and security</h3>
      <p>
        Customer workspace data is stored in secured cloud infrastructure (Microsoft Azure). Access is limited to authorized
        personnel and automated systems required to operate the product.
      </p>
      <h3 style={{ color: "#0f172a" }}>Your rights</h3>
      <p>
        You may request access, correction, or deletion of personal data by contacting us. Some records may be retained where
        required for billing, security, or legal compliance.
      </p>
      <p>Contact: <a href="mailto:info@futurecontractorsofamerica.com">info@futurecontractorsofamerica.com</a></p>
    </LegalPageShell>
  );
}
