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
  const isWorkspace = offer?.kind === "workspace";
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

  const portalHref = "/portal/platform";
  const academyHref = enrollment ? firstModuleHref : "/academy/dashboard";

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        eyebrow="Payment received"
        title="Your FCA workspace is ready"
        subtitle="One unified FCA Contractor Command account — workspace, academy, and Auricrux on a single tenant spine."
        primaryHref={isAcademy ? academyHref : portalHref}
        primaryLabel={isAcademy ? "Start your course" : "Open workspace"}
        secondaryHref={isAcademy ? portalHref : academyHref}
        secondaryLabel={isAcademy ? "Open workspace" : "Open Academy"}
        journey={shellJourney}
        currentJourney="conversion"
      />

      <section style={{ ...cardStyle, maxWidth: 760, margin: "0 auto" }}>
        <div style={{ padding: 14, borderRadius: 12, background: "#ecfdf5", border: "1px solid #86efac", color: "#166534", fontWeight: 700, marginBottom: 18 }}>
          Payment successful{offer?.name ? ` — ${offer.name}` : ""}
        </div>

        {offer ? (
          <div style={{ lineHeight: 1.8, color: "#334155", marginBottom: 20 }}>
            <div><strong>FCA product:</strong> Contractor Command (unified ecosystem)</div>
            <div><strong>Entry offer:</strong> {offer.name}</div>
            <div><strong>Amount:</strong> {offer.priceLabel}</div>
            {sessionId ? <div><strong>Reference:</strong> {sessionId}</div> : null}
          </div>
        ) : null}

        {enrollment ? (
          <p style={{ color: "#047857", fontWeight: 700, lineHeight: 1.7 }}>
            Enrollment confirmed. Academy access is active on your FCA tenant — open your first module or jump to the workspace.
          </p>
        ) : enrollError ? (
          <p style={{ color: "#b45309", lineHeight: 1.7 }}>
            Payment recorded on your FCA tenant. Enrollment needs one more step: {enrollError}
          </p>
        ) : (
          <p style={{ color: "#475569", lineHeight: 1.7 }}>
            {isAcademy
              ? "Your academy purchase is recorded on your unified FCA account. Confirming enrollment now…"
              : isWorkspace
                ? "Your workspace plan is active. Open Contractor Command to run pipeline, projects, files, and billing — Auricrux embedded throughout."
                : "Your FCA purchase is recorded. Open the workspace and academy from the same account."}
          </p>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
          <a href={portalHref} style={ctaPrimaryStyle}>Open workspace</a>
          <a href={academyHref} style={ctaSecondaryStyle}>Open Academy</a>
          <a href="/portal/auricrux" style={ctaSecondaryStyle}>Ask Auricrux</a>
          <a href="/portal/billing" style={ctaSecondaryStyle}>Review billing</a>
        </div>
      </section>

      <ShellFooter />
    </div>
  );
}
