import { useEffect, useMemo, useState } from "react";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import { shellJourney } from "../../websiteShell";
import { resolveCheckoutOffer } from "../../commerceCheckout";
import { enrollAfterAcademyPurchase } from "../../api/academyCommerceClient";
import { pageShellStyle, cardStyle, ctaPrimaryStyle, ctaSecondaryStyle } from "../../publicShellStyles";

const BUYER_EMAIL_KEY = "fca_academy_buyer_email";

export default function CheckoutSuccess() {
  const searchParams = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const offer = useMemo(() => resolveCheckoutOffer(searchParams), [searchParams]);
  const sessionId = searchParams.get("session_id");
  const isAcademy = offer?.kind === "academy-course" || offer?.kind === "academy-pathway";
  const [enrollment, setEnrollment] = useState(null);
  const [enrollError, setEnrollError] = useState("");

  useEffect(() => {
    if (!isAcademy || enrollment || enrollError) return undefined;

    const storedEmail = typeof window !== "undefined" ? window.localStorage.getItem(BUYER_EMAIL_KEY) : "";
    if (!storedEmail) return undefined;

    let cancelled = false;
    (async () => {
      try {
        const payload = await enrollAfterAcademyPurchase({
          buyerEmail: storedEmail,
          programKey: offer.kind === "academy-course" ? offer.key : undefined,
          pathwayKey: offer.kind === "academy-pathway" ? offer.key : undefined,
          purchaseType: offer.kind === "academy-pathway" ? "pathway" : "course",
          stripeSessionId: sessionId || undefined,
        });
        if (!cancelled) setEnrollment(payload);
      } catch (error) {
        if (!cancelled) {
          setEnrollError(error.message || "Enrollment confirmation failed.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enrollError, enrollment, isAcademy, offer, sessionId]);

  const firstModuleHref = enrollment?.firstModuleHref
    || (offer?.kind === "academy-course" && offer.key
      ? `/academy/programs/${offer.key}/modules/1`
      : "/academy/dashboard");
  const nextHref = enrollment ? firstModuleHref : isAcademy ? "/academy/dashboard" : "/portal/platform";
  const nextLabel = isAcademy ? (enrollment ? "Start your course" : "Open Academy") : "Open your workspace";

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

        {enrollment ? (
          <p style={{ color: "#047857", fontWeight: 700, lineHeight: 1.7 }}>
            Enrollment confirmed. Your academy access is active — open your first module to begin.
          </p>
        ) : enrollError ? (
          <p style={{ color: "#b45309", lineHeight: 1.7 }}>
            Payment recorded. Enrollment needs one more step: {enrollError} Open Academy or contact rollout if this persists.
          </p>
        ) : (
          <p style={{ color: "#475569", lineHeight: 1.7 }}>
            {isAcademy
              ? "Your academy purchase is recorded. Confirming enrollment now…"
              : "Your workspace purchase is recorded. Open the platform dashboard to start your pipeline, projects, and Auricrux-guided next steps."}
          </p>
        )}

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
