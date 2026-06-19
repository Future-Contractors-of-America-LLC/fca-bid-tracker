import { useEffect, useState } from "react";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import { PILOT_CHECKOUT_URL } from "../../commercialOffers";
import { shellJourney } from "../../websiteShell";
import { cardStyle, ctaPrimaryStyle, ctaSecondaryStyle, pageShellStyle } from "../../publicShellStyles";

export default function Products() {
  const [catalog, setCatalog] = useState({ products: [] });

  useEffect(() => {
    fetch("/products/catalog.json")
      .then((res) => res.json())
      .then((data) => setCatalog(data))
      .catch(() => setCatalog({ products: [] }));
  }, []);

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        eyebrow="Digital products"
        title="Contractor toolkits and templates"
        subtitle="Downloadable kits that pair with FCA Contractor Command. Payment links activate when Stripe live keys are configured."
        primaryHref="/intake"
        primaryLabel="Start workspace"
        secondaryHref="/pricing"
        secondaryLabel="SaaS plans"
        journey={shellJourney}
        currentJourney="conversion"
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginTop: 24 }}>
        {catalog.products.map((product) => (
          <div key={product.id} style={cardStyle}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{product.name}</div>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>${product.priceUsd}</div>
            <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>{product.description}</p>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>{product.audience}</div>
            {product.stripePaymentLink ? (
              <a href={product.stripePaymentLink} style={ctaPrimaryStyle} target="_blank" rel="noopener noreferrer">
                Buy now
              </a>
            ) : product.assetPath ? (
              <a href={product.assetPath} style={ctaSecondaryStyle} target="_blank" rel="noopener noreferrer">
                Preview sample
              </a>
            ) : (
              <span style={{ color: "#94a3b8" }}>Payment link pending</span>
            )}
          </div>
        ))}
      </div>

      <section style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Need the full platform?</h2>
        <p style={{ color: "#475569", lineHeight: 1.7 }}>
          Digital kits complement FCA SaaS. For bids, projects, Academy, and Auricrux on one spine, choose a workspace plan.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/pricing" style={ctaPrimaryStyle}>Compare plans</a>
          <a href={PILOT_CHECKOUT_URL} style={ctaSecondaryStyle} target="_blank" rel="noopener noreferrer">
            Buy Pilot — $2,500
          </a>
        </div>
      </section>

      <ShellFooter />
    </div>
  );
}
