import LegalPageShell from "../../components/LegalPageShell";

export default function Refunds() {
  return (
    <LegalPageShell title="Refunds & Billing Policy" eyebrow="Legal" currentHref="/refunds">
      <p><strong>Effective date:</strong> June 19, 2026</p>
      <h3 style={{ color: "#0f172a" }}>Subscriptions ($99/mo and recurring plans)</h3>
      <p>
        Monthly subscriptions may be cancelled at any time. Cancellation stops future billing cycles. We do not provide prorated
        refunds for partial months unless required by law or explicitly agreed in writing.
      </p>
      <h3 style={{ color: "#0f172a" }}>Pilot program ($2,500 one-time)</h3>
      <p>
        The FCA Pilot includes guided workspace setup and rollout support. Refund requests within 7 days of purchase are reviewed
        if onboarding has not substantially begun. After onboarding delivery has started, pilot fees are non-refundable.
      </p>
      <h3 style={{ color: "#0f172a" }}>Digital products</h3>
      <p>
        Downloadable contractor kits and templates are generally non-refundable once delivered, except in cases of defective files
        or failed delivery.
      </p>
      <h3 style={{ color: "#0f172a" }}>Billing disputes</h3>
      <p>
        Contact <a href="mailto:info@futurecontractorsofamerica.com">info@futurecontractorsofamerica.com</a> before initiating
        a chargeback. We will work to resolve billing issues promptly.
      </p>
    </LegalPageShell>
  );
}
