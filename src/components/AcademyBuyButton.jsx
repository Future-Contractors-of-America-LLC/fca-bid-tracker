import { useState } from "react";
import { navigateTo } from "../navigation";
import { academyCheckoutHref } from "../commerceCheckout";

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

  if (lane && hiddenLanes.includes(lane)) {
    return null;
  }

  const priceLabel = retailPrice != null && retailPrice !== "" ? ` — $${retailPrice}` : "";
  const buttonLabel = label || `Continue checkout${priceLabel}`;

  function buyNow(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    setBusy(true);
    navigateTo(academyCheckoutHref({ programKey, pathwayKey, email: buyerEmail }));
    setBusy(false);
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
    </span>
  );
}
