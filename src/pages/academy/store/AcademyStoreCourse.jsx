import { useEffect, useState } from "react";
import ShellHeader from "../../../components/ShellHeader";
import ShellFooter from "../../../components/ShellFooter";
import {
  fetchAcademyCommerceItem,
  formatUsd,
  startAcademyCheckout,
  submitAcademyContactSales,
} from "../../../api/academyCommerceClient";
import { shellHeaderCtaSets, shellJourney } from "../../../websiteShell";
import { pageShellStyle } from "../../../publicShellStyles";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

function readProgramKey() {
  if (typeof window === "undefined") return "";
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}

export default function AcademyStoreCourse() {
  const programKey = readProgramKey();
  const [item, setItem] = useState(null);
  const [preview, setPreview] = useState(null);
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const payload = await fetchAcademyCommerceItem({ programKey });
        if (!active) return;
        setItem(payload.item);
        setPreview(payload.preview);
        setStripeConfigured(Boolean(payload.stripeConfigured));
      } catch (loadError) {
        if (!active) return;
        setError(loadError.message || "Course not found.");
      } finally {
        if (active) setLoading(false);
      }
    }
    if (programKey) load();
    return () => { active = false; };
  }, [programKey]);

  async function handleBuy() {
    if (!buyerEmail.trim()) {
      setStatus("Enter your email to continue.");
      return;
    }
    setSubmitting(true);
    setStatus("");
    const successUrl = `${window.location.origin}/academy/store/success?programKey=${encodeURIComponent(programKey)}`;
    const cancelUrl = `${window.location.origin}/academy/store/course/${encodeURIComponent(programKey)}`;
    try {
      const checkout = await startAcademyCheckout({
        purchaseType: "course",
        programKey,
        buyerEmail: buyerEmail.trim(),
        buyerName: buyerName.trim(),
        successUrl,
        cancelUrl,
      });
      if (checkout.mode === "contact-sales" || !checkout.checkoutUrl) {
        await submitAcademyContactSales({
          purchaseType: "course",
          programKey,
          buyerEmail: buyerEmail.trim(),
          buyerName: buyerName.trim(),
          notes,
          retailPrice: item?.retailPrice,
        });
        window.location.assign(`${successUrl}&mode=contact-sales`);
        return;
      }
      window.location.assign(checkout.checkoutUrl);
    } catch (buyError) {
      setStatus(buyError.message || "Checkout failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={pageShellStyle}>
      <ShellHeader ctaSet={shellHeaderCtaSets.academy} journey={shellJourney.academy} />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 48px" }}>
        <a href="/academy/store" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
          Back to Academy Store
        </a>
        {loading ? <p>Loading course...</p> : null}
        {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
        {item ? (
          <div style={{ marginTop: 20 }}>
            <h1 style={{ marginBottom: 8 }}>{item.title}</h1>
            <p style={{ color: "#475569" }}>
              {item.lane} | {item.moduleCount || item.duration} modules
              {item.credential ? ` | ${item.credential}` : ""}
            </p>
            <div style={{ ...cardStyle, marginTop: 20 }}>
              <h2 style={{ marginTop: 0 }}>Syllabus preview</h2>
              <p style={{ color: "#475569" }}>
                {preview?.deliveryModel || "Module-based training with knowledge checks and practical labs."}
              </p>
              <a
                href={`/academy/programs/${programKey}`}
                style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}
              >
                View full public syllabus
              </a>
            </div>
            <div style={{ ...cardStyle, marginTop: 20 }}>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>{formatUsd(item.retailPrice)}</div>
              <label style={{ display: "block", marginBottom: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Email</div>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(event) => setBuyerEmail(event.target.value)}
                  placeholder="you@company.com"
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }}
                />
              </label>
              <label style={{ display: "block", marginBottom: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Name (optional)</div>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(event) => setBuyerName(event.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }}
                />
              </label>
              {!stripeConfigured ? (
                <label style={{ display: "block", marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Notes for sales team</div>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={3}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }}
                  />
                </label>
              ) : null}
              <button
                type="button"
                onClick={handleBuy}
                disabled={submitting}
                style={{
                  border: "none",
                  background: "#2563eb",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "12px 18px",
                  fontWeight: 700,
                  cursor: submitting ? "wait" : "pointer",
                }}
              >
                {submitting ? "Processing..." : stripeConfigured ? "Buy now with Stripe" : "Request purchase"}
              </button>
              {status ? <p style={{ color: "#b45309", marginTop: 12 }}>{status}</p> : null}
            </div>
          </div>
        ) : null}
      </main>
      <ShellFooter />
    </div>
  );
}
