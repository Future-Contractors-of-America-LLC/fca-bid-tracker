import { useState } from "react";
import { createAcademyCheckout } from "../api/academyCommerceClient";

const buttonStyle = {
  border: "1px solid #15803d",
  background: "#15803d",
  color: "#fff",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
  font: "inherit",
};

const secondaryStyle = {
  ...buttonStyle,
  border: "1px solid #15803d",
  background: "#fff",
  color: "#15803d",
};

export default function AcademyBuyButton({
  programKey,
  pathwayKey,
  retailPrice,
  buyerEmail,
  label,
  variant = "primary",
  style = {},
  disabled = false,
  hiddenLanes = ["fca-how-to"],
  lane,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (lane && hiddenLanes.includes(lane)) {
    return null;
  }

  const priceLabel = retailPrice != null && retailPrice !== "" ? ` — $${retailPrice}` : "";
  const buttonLabel = label || `Buy now${priceLabel}`;

  async function buyNow(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    setBusy(true);
    setError("");
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const checkout = await createAcademyCheckout({
        programKey,
        pathwayKey,
        buyerEmail,
        successUrl: origin ? `${origin}/academy/store/success` : undefined,
        cancelUrl: origin ? `${origin}/academy/programs/${programKey || pathwayKey}` : undefined,
      });
      if (checkout.checkoutUrl) {
        window.location.href = checkout.checkoutUrl;
        return;
      }
      if (checkout.mode === "contact-sales") {
        window.location.href = "/contact";
        return;
      }
      setError("Checkout is unavailable right now.");
    } catch (checkoutError) {
      setError(checkoutError.message || "Unable to start checkout.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 6 }}>
      <button
        type="button"
        disabled={disabled || busy}
        onClick={buyNow}
        style={{ ...(variant === "secondary" ? secondaryStyle : buttonStyle), ...style }}
      >
        {busy ? "Opening checkout..." : buttonLabel}
      </button>
      {error ? <span style={{ color: "#b91c1c", fontSize: 13 }}>{error}</span> : null}
    </span>
  );
}
