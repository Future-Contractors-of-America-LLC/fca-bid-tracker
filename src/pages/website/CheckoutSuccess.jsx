import { useMemo } from "react";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import { shellJourney } from "../../websiteShell";
import { resolveCheckoutOffer } from "../../commerceCheckout";
import { pageShellStyle, cardStyle, ctaPrimaryStyle, ctaSecondaryStyle } from "../../publicShellStyles";

export default function CheckoutSuccess() {
  const searchParams = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const offer = useMemo(() => resolveCheckoutOffer(searchParams), [searchParams]);
  const sessionId = searchParams.get("session_id");

  const isAcademy = offer?.kind === "academy-course" || offer?.kind === "academy-pathway";
  const nextHref = isAcademy ? "/academy" : "/login";
  const nextLabel = isAcademy ? "Open Academy" : "Continue to workspace login";

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        eyebrow="Payment received"
        title="Your FCA purchase is confirmed"
        subtitle="Secure payment completed. Continue into workspace activation or academy enrollment from the same FCA shell."
        primaryHref={nextHref}
        primaryLabel={nextLabel}
        secondaryHref="/portal/billing"
        secondaryLabel="Open billing"
        journey={shellJourney}
        currentJourney="conversion"
      />

      <section style={{ ...cardStyle, maxWidth: 760, margin: "0 auto" }}>
        <div style={{ padding: 14, borderRadius: 12, background: "#ecfdf5", border: "1px solid #86efac", color: "#166534", fontWeight: 700, marginBottom: 18 }}>
          Payment successful{offer?.name ? ` — ${offer.name}` : ""}
        </div>

        {offer ? (
          <div style={{ lineHeight: 1.8, color: "#334155", marginBottom: 20 }}>
            <div><strong>Package:</strong> {offer.name}</div>
            <div><strong>Amount:</strong> {offer.priceLabel}</div>
            {sessionId ? <div><strong>Reference:</strong> {sessionId}</div> : null}
          </div>
        ) : null}

        <p style={{ color: "#475569", lineHeight: 1.7 }}>
          {isAcademy
            ? "Your academy purchase is recorded. Open Academy to access your program, track credential progress, and continue learning inside the live FCA workspace."
            : "Your workspace purchase is recorded. Sign in to activate your rollout package, open the platform dashboard, and continue with Auricrux-guided next steps."}
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
          <a href={nextHref} style={ctaPrimaryStyle}>{nextLabel}</a>
          <a href="/portal/billing" style={ctaSecondaryStyle}>Review billing</a>
          <a href="/contact" style={ctaSecondaryStyle}>Contact rollout</a>
        </div>
      </section>

      <ShellFooter />
    </div>
  );
}
