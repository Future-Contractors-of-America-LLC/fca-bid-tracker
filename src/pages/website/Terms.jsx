import LegalPageShell from "../../components/LegalPageShell";

export default function Terms() {
  return (
    <LegalPageShell title="Terms of Service" eyebrow="Legal">
      <p><strong>Effective date:</strong> June 18, 2026</p>
      <p>
        By accessing Future Contractors of America (FCA) products, website, portal, or academy surfaces you agree to these terms.
        FCA provides contractor software, training, and related digital services on a subscription or pilot basis.
      </p>
      <h3 style={{ color: "#0f172a" }}>Service scope</h3>
      <p>
        FCA delivers workspace software, customer portal access, academy content, and Auricrux-guided workflows as described at purchase.
        Features vary by plan tier. We may improve or modify the service while preserving core continuity for paying customers.
      </p>
      <h3 style={{ color: "#0f172a" }}>Accounts and acceptable use</h3>
      <p>
        You are responsible for credentials issued to your organization. Do not misuse the platform, attempt unauthorized access,
        or upload unlawful content. We may suspend accounts that threaten system integrity or violate law.
      </p>
      <h3 style={{ color: "#0f172a" }}>Payment and renewal</h3>
      <p>
        Paid plans are billed through Stripe according to the price shown at checkout. Subscriptions renew until cancelled in accordance
        with your plan terms. Pilot purchases are one-time unless otherwise stated in your order confirmation.
      </p>
      <h3 style={{ color: "#0f172a" }}>Limitation of liability</h3>
      <p>
        FCA is provided as operational software for contractors. We do not guarantee specific business outcomes. To the maximum extent
        permitted by law, liability is limited to fees paid in the twelve months preceding a claim.
      </p>
      <p>Questions: <a href="mailto:info@futurecontractorsofamerica.com">info@futurecontractorsofamerica.com</a></p>
    </LegalPageShell>
  );
}
