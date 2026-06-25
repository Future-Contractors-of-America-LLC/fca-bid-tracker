import PublicTopNav from "./PublicTopNav";
import ShellFooter from "./ShellFooter";
import ProductIllustration from "./ProductIllustration";
import { ctaPrimaryStyle, ctaSecondaryStyle, pageShellStyle } from "../publicShellStyles";

const heroCtaOnDark = {
  ...ctaPrimaryStyle,
  background: "#fff",
  color: "#0f172a",
  border: "none",
};

const heroCtaSecondaryOnDark = {
  ...ctaSecondaryStyle,
  background: "transparent",
  color: "#e2e8f0",
  border: "1px solid rgba(226, 232, 240, 0.45)",
};

export default function MarketingPageShell({
  eyebrow,
  title,
  subtitle,
  primaryHref = "/intake",
  primaryLabel = "Get started",
  secondaryHref = "/contact",
  secondaryLabel = "Talk to our team",
  showClosingCta = false,
  illustrationKey = null,
  children,
}) {
  return (
    <div style={{ ...pageShellStyle, background: "#ffffff", minHeight: "100vh", paddingTop: 0, maxWidth: "none", margin: 0, width: "100%" }}>
      <PublicTopNav />

      <section
        style={{
          background: "linear-gradient(165deg, #0f172a 0%, #1e3a5f 42%, #0f172a 100%)",
          padding: "clamp(40px, 7vw, 72px) clamp(20px, 4vw, 40px)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {eyebrow ? (
            <div style={{ color: "#93c5fd", fontWeight: 700, marginBottom: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 12 }}>
              {eyebrow}
            </div>
          ) : null}
          <h1 style={{ marginTop: 0, fontSize: "clamp(1.85rem, 3.5vw, 2.75rem)", lineHeight: 1.15, fontWeight: 800, maxWidth: 760, color: "#f8fafc" }}>
            {title}
          </h1>
          {subtitle ? (
            <p style={{ color: "#cbd5e1", lineHeight: 1.75, maxWidth: 640, marginTop: 16, fontSize: 17, marginBottom: 0 }}>
              {subtitle}
            </p>
          ) : null}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
            <a href={primaryHref} style={heroCtaOnDark}>{primaryLabel}</a>
            {secondaryHref ? <a href={secondaryHref} style={heroCtaSecondaryOnDark}>{secondaryLabel}</a> : null}
          </div>
        </div>
      </section>

      <div style={{ padding: "clamp(32px, 5vw, 56px) clamp(20px, 4vw, 40px)", maxWidth: 1280, margin: "0 auto", boxSizing: "border-box" }}>
        {illustrationKey ? (
          <div style={{ marginBottom: 28 }}>
            <ProductIllustration variant={illustrationKey} />
          </div>
        ) : null}
        {children}

        {showClosingCta ? (
          <section
            style={{
              marginTop: 40,
              padding: "28px 24px",
              borderRadius: 16,
              background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
              border: "1px solid #bfdbfe",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <strong style={{ display: "block", marginBottom: 6, fontSize: 18 }}>Ready to see FCA in action?</strong>
              <span style={{ color: "#475569", lineHeight: 1.6 }}>Start intake or schedule a walkthrough with our team.</span>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href="/intake" style={ctaPrimaryStyle}>Get started</a>
              <a href="/contact" style={ctaSecondaryStyle}>Contact us</a>
            </div>
          </section>
        ) : null}

        <ShellFooter />
      </div>
    </div>
  );
}
