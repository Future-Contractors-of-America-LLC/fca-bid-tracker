import { useEffect, useMemo, useState } from "react";
import FcaBrandMark from "../../components/FcaBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import EmbeddedStripeCheckout from "../../components/EmbeddedStripeCheckout";
import { shellJourney } from "../../websiteShell";
import { navigateTo } from "../../navigation";
import { readCustomerRecord } from "../../api/intakeClient";
import { createPlanCheckout } from "../../api/stripeClient";
import { createAcademyCheckout } from "../../api/academyCommerceClient";
import {
  checkoutCancelHref,
  checkoutSuccessHref,
  resolveCheckoutOffer,
} from "../../commerceCheckout";
import { resolveCatalogCheckoutUrl } from "../../stripeCatalog";
import { pageShellStyle, cardStyle, twoColumnGridStyle, ctaPrimaryStyle } from "../../publicShellStyles";

const fieldStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  marginTop: 8,
  boxSizing: "border-box",
  fontSize: 15,
};

const trustItems = [
  "Card entry stays inside the FCA checkout experience via Stripe Embedded Checkout",
  "PCI-compliant payment handling with enterprise-grade Stripe infrastructure",
  "Workspace or academy activation continues immediately after payment confirmation",
];

const steps = ["Review package", "Confirm buyer", "Secure payment"];

export default function Checkout() {
  const searchParams = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const offer = useMemo(() => resolveCheckoutOffer(searchParams), [searchParams]);
  const intakeRecord = useMemo(() => readCustomerRecord(), []);
  const cancelled = searchParams.get("cancelled") === "1";

  const [company, setCompany] = useState(intakeRecord?.company || "");
  const [name, setName] = useState(intakeRecord?.name || "");
  const [email, setEmail] = useState(searchParams.get("email") || intakeRecord?.email || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(cancelled ? "Payment was cancelled. Review your package and try again when ready." : "");
  const [paymentStep, setPaymentStep] = useState("review");
  const [embeddedSession, setEmbeddedSession] = useState(null);

  useEffect(() => {
    if (!offer) {
      setError("Select a package from pricing or academy before continuing to checkout.");
    }
  }, [offer]);

  function activeStepIndex() {
    if (paymentStep === "pay") return 2;
    return 0;
  }

  async function startEmbeddedPayment(event) {
    event.preventDefault();
    if (!offer) return;

    if (!email.trim()) {
      setError("Enter the billing contact email for this purchase.");
      return;
    }

    setBusy(true);
    setError("");
    setStatus("Preparing secure in-page payment...");

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const clientReferenceId = searchParams.get("ref") || intakeRecord?.intakeId || intakeRecord?.email || email.trim();
    const successPath = checkoutSuccessHref(offer);
    const returnUrl = origin
      ? `${origin}${successPath}${successPath.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`
      : undefined;

    try {
      let checkout;

      if (offer.kind === "workspace") {
        checkout = await createPlanCheckout(offer.key, {
          customerEmail: email.trim(),
          returnUrl,
          successUrl: returnUrl,
          cancelUrl: origin ? `${origin}${checkoutCancelHref(offer)}` : undefined,
          clientReferenceId,
          company: company.trim(),
          contactName: name.trim(),
          uiMode: "embedded",
        });
      } else {
        checkout = await createAcademyCheckout({
          programKey: offer.kind === "academy-course" ? offer.key : undefined,
          pathwayKey: offer.kind === "academy-pathway" ? offer.key : undefined,
          buyerEmail: email.trim(),
          returnUrl,
          successUrl: returnUrl,
          cancelUrl: origin ? `${origin}${checkoutCancelHref(offer)}` : undefined,
          clientReferenceId,
          uiMode: "embedded",
        });
      }

      if (checkout?.clientSecret) {
        setEmbeddedSession({
          clientSecret: checkout.clientSecret,
          publishableKey: checkout.publishableKey,
        });
        setPaymentStep("pay");
        setStatus("");
        return;
      }

      if (checkout?.checkoutUrl) {
        window.location.href = checkout.checkoutUrl;
        return;
      }

      if (checkout?.mode === "contact-sales") {
        navigateTo("/contact");
        return;
      }

      throw new Error("Checkout session could not be created.");
    } catch (checkoutError) {
      const catalogUrl = await resolveCatalogCheckoutUrl(offer);
      if (catalogUrl) {
        window.location.href = catalogUrl;
        return;
      }
      setStatus("");
      setError(checkoutError.message || "Unable to start secure checkout. Contact rollout if this continues.");
    } finally {
      setBusy(false);
    }
  }

  function backToReview() {
    setPaymentStep("review");
    setEmbeddedSession(null);
    setStatus("");
  }

  const stepIndex = activeStepIndex();

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        eyebrow="Secure checkout"
        title="Complete your FCA purchase"
        subtitle="Review your package, confirm buyer details, and complete payment inside the FCA checkout experience."
        primaryHref="/pricing"
        primaryLabel="Back to pricing"
        secondaryHref="/contact"
        secondaryLabel="Talk to rollout"
        journey={shellJourney}
        currentJourney="conversion"
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {steps.map((step, index) => (
            <div
              key={step}
              style={{
                border: "1px solid #dbe3ef",
                borderRadius: 999,
                padding: "8px 14px",
                background: index <= stepIndex ? "#eff6ff" : "#fff",
                color: index <= stepIndex ? "#1d4ed8" : "#64748b",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {index + 1}. {step}
            </div>
          ))}
        </div>
        <FcaBrandMark compact />
      </div>

      {!offer ? (
        <section style={{ ...cardStyle, maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ marginTop: 0 }}>No package selected</h2>
          <p style={{ color: "#475569", lineHeight: 1.7 }}>
            Start from pricing to choose a workspace rollout tier, or open an academy program and select buy to reach this checkout flow.
          </p>
          <a href="/pricing" style={ctaPrimaryStyle}>Open pricing</a>
        </section>
      ) : paymentStep === "pay" && embeddedSession ? (
        <div style={twoColumnGridStyle}>
          <section style={{ ...cardStyle, background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#f8fafc", border: "none" }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "#93c5fd", fontWeight: 800, marginBottom: 8 }}>
              Order summary
            </div>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>{offer.name}</h2>
            <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>{offer.priceLabel}</div>
            <p style={{ lineHeight: 1.7, color: "#cbd5e1", marginTop: 0 }}>{offer.summary}</p>
            <div style={{ color: "#93c5fd", fontSize: 14 }}>{company || "Your company"} · {email}</div>
          </section>

          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Secure payment</h2>
            <p style={{ color: "#475569", lineHeight: 1.7 }}>
              Enter payment details below. You will remain inside FCA while Stripe processes the transaction.
            </p>
            <EmbeddedStripeCheckout
              clientSecret={embeddedSession.clientSecret}
              publishableKey={embeddedSession.publishableKey}
              onBack={backToReview}
            />
          </section>
        </div>
      ) : (
        <form onSubmit={startEmbeddedPayment}>
          <div style={twoColumnGridStyle}>
            <section style={{ ...cardStyle, background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#f8fafc", border: "none" }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "#93c5fd", fontWeight: 800, marginBottom: 8 }}>
                Order summary
              </div>
              <h2 style={{ marginTop: 0, marginBottom: 8 }}>{offer.name}</h2>
              <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>{offer.priceLabel}</div>
              <p style={{ lineHeight: 1.7, color: "#cbd5e1", marginTop: 0 }}>{offer.summary}</p>

              {offer.bestFor ? (
                <div style={{ border: "1px solid rgba(147, 197, 253, 0.35)", borderRadius: 12, padding: 12, marginBottom: 16, background: "rgba(15, 23, 42, 0.35)" }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#93c5fd", fontWeight: 800, marginBottom: 6 }}>Best for</div>
                  <div style={{ lineHeight: 1.65 }}>{offer.bestFor}</div>
                </div>
              ) : null}

              {offer.products?.length ? (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#93c5fd", fontWeight: 800, marginBottom: 6 }}>Included products</div>
                  <div style={{ lineHeight: 1.7 }}>{offer.products.join(" · ")}</div>
                </div>
              ) : null}

              {offer.comms?.length ? (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#93c5fd", fontWeight: 800, marginBottom: 6 }}>Communications</div>
                  <div style={{ lineHeight: 1.7 }}>{offer.comms.join(" · ")}</div>
                </div>
              ) : null}

              {offer.academyAccess ? (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#fcd34d", fontWeight: 800, marginBottom: 6 }}>Academy</div>
                  <div style={{ lineHeight: 1.7 }}>{offer.academyAccess}</div>
                </div>
              ) : null}

              {offer.auricruxRole ? (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#fcd34d", fontWeight: 800, marginBottom: 6 }}>Auricrux</div>
                  <div style={{ lineHeight: 1.7 }}>{offer.auricruxRole}</div>
                </div>
              ) : null}

              {offer.includes?.length ? (
                <ul style={{ paddingLeft: 20, lineHeight: 1.8, marginBottom: 0 }}>
                  {offer.includes.map((item) => <li key={item}>{item}</li>)}
                </ul>
              ) : null}
            </section>

            <section style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Buyer and billing contact</h2>
              <p style={{ color: "#475569", lineHeight: 1.7 }}>
                These details attach the purchase to your FCA rollout record and prefill the secure payment step.
              </p>

              <label>
                <strong>Company</strong>
                <input value={company} onChange={(event) => setCompany(event.target.value)} style={{ ...fieldStyle, marginBottom: 16 }} placeholder="Your contracting company" />
              </label>

              <label>
                <strong>Contact name</strong>
                <input value={name} onChange={(event) => setName(event.target.value)} style={{ ...fieldStyle, marginBottom: 16 }} placeholder="Primary rollout contact" />
              </label>

              <label>
                <strong>Billing email</strong>
                <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} style={{ ...fieldStyle, marginBottom: 16 }} placeholder="you@company.com" />
              </label>

              {status ? (
                <div style={{ padding: 12, borderRadius: 12, background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e3a8a", marginBottom: 16, lineHeight: 1.6 }}>
                  {status}
                </div>
              ) : null}

              {error ? (
                <div style={{ padding: 12, borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", marginBottom: 16, lineHeight: 1.6 }}>
                  {error}
                </div>
              ) : null}

              <button type="submit" disabled={busy} style={{ ...ctaPrimaryStyle, width: "100%", border: "none", cursor: busy ? "wait" : "pointer", opacity: busy ? 0.8 : 1 }}>
                {busy ? "Preparing secure payment..." : "Continue to secure payment"}
              </button>

              <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6, marginBottom: 0, marginTop: 14 }}>
                Payment opens on this page using Stripe Embedded Checkout. You will not be sent to a generic external payment link.
              </p>
            </section>
          </div>

          <section style={{ ...cardStyle, marginTop: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Enterprise checkout assurance</div>
            <div style={{ display: "grid", gap: 10 }}>
              {trustItems.map((item) => (
                <div key={item} style={{ color: "#475569", lineHeight: 1.65, paddingLeft: 18, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: "#2563eb" }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          </section>
        </form>
      )}

      <ShellFooter />
    </div>
  );
}
