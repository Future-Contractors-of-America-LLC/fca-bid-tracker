import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { stripePublishableKey } from "../config/stripe";

export default function EmbeddedStripeCheckout({ clientSecret, publishableKey, onBack }) {
  const key = publishableKey || stripePublishableKey();
  const stripePromise = key ? loadStripe(key) : null;

  if (!clientSecret || !stripePromise) {
    return (
      <div style={{ padding: 16, borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" }}>
        Embedded checkout is unavailable. Confirm Stripe publishable key configuration and try again.
      </div>
    );
  }

  return (
    <div>
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          style={{
            border: "1px solid #cbd5e1",
            background: "#fff",
            color: "#0f172a",
            borderRadius: 10,
            padding: "8px 12px",
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: 14,
            font: "inherit",
          }}
        >
          Back to review
        </button>
      ) : null}
      <div
        id="fca-embedded-checkout"
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 14,
          overflow: "hidden",
          background: "#fff",
          minHeight: 420,
        }}
      >
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </div>
  );
}
