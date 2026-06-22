import { useEffect, useState } from "react";
import ShellHeader from "../../../components/ShellHeader";
import ShellFooter from "../../../components/ShellFooter";
import { enrollAfterAcademyPurchase } from "../../../api/academyCommerceClient";
import { shellHeaderCtaSets, shellJourney } from "../../../websiteShell";
import { pageShellStyle } from "../../../publicShellStyles";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

function readParams() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    programKey: params.get("programKey") || "",
    pathwayKey: params.get("pathwayKey") || "",
    mode: params.get("mode") || "",
    sessionId: params.get("session_id") || "",
  };
}

export default function AcademyStoreSuccess() {
  const [params] = useState(readParams);
  const [enrollment, setEnrollment] = useState(null);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (params.mode === "contact-sales") return;
    const storedEmail = typeof window !== "undefined" ? window.localStorage.getItem("fca_academy_buyer_email") : "";
    if (storedEmail) setEmail(storedEmail);
  }, [params.mode]);

  async function confirmEnrollment() {
    if (!email.trim()) {
      setError("Enter the email used at checkout.");
      return;
    }
    setError("");
    try {
      const payload = await enrollAfterAcademyPurchase({
        buyerEmail: email.trim(),
        programKey: params.programKey || undefined,
        pathwayKey: params.pathwayKey || undefined,
        purchaseType: params.pathwayKey ? "pathway" : "course",
        stripeSessionId: params.sessionId || undefined,
      });
      setEnrollment(payload);
    } catch (confirmError) {
      setError(confirmError.message || "Enrollment confirmation failed.");
    }
  }

  const firstModuleHref = enrollment?.firstModuleHref
    || (params.programKey ? `/academy/programs/${params.programKey}/modules/1` : "/academy/dashboard");

  return (
    <div style={pageShellStyle}>
      <ShellHeader ctaSet={shellHeaderCtaSets.academy} journey={shellJourney.academy} />
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 48px" }}>
        <div style={cardStyle}>
          <h1 style={{ marginTop: 0 }}>Purchase received</h1>
          {params.mode === "contact-sales" ? (
            <p style={{ color: "#475569", lineHeight: 1.7 }}>
              Your purchase request has been recorded. Our team will contact you to complete enrollment.
              Contractor Command SaaS is not required for academy-only access.
            </p>
          ) : (
            <p style={{ color: "#475569", lineHeight: 1.7 }}>
              Thank you for your academy purchase. Confirm your enrollment below to unlock course access.
            </p>
          )}

          {enrollment ? (
            <div style={{ marginTop: 20 }}>
              <p style={{ color: "#047857", fontWeight: 700 }}>
                Enrolled in {enrollment.enrolledProgramKeys?.length || 1} program(s) for {enrollment.buyerEmail}.
              </p>
              <a
                href={firstModuleHref}
                style={{
                  display: "inline-block",
                  marginTop: 12,
                  border: "1px solid #2563eb",
                  background: "#2563eb",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Start first module
              </a>
              <div style={{ marginTop: 16 }}>
                <a href="/login?next=/academy/dashboard" style={{ color: "#2563eb", fontWeight: 600 }}>
                  Create account or sign in
                </a>
              </div>
            </div>
          ) : params.mode !== "contact-sales" ? (
            <div style={{ marginTop: 20 }}>
              <label style={{ display: "block", marginBottom: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Checkout email</div>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }}
                />
              </label>
              <button
                type="button"
                onClick={confirmEnrollment}
                style={{
                  border: "none",
                  background: "#2563eb",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Confirm enrollment
              </button>
              {error ? <p style={{ color: "#b91c1c", marginTop: 12 }}>{error}</p> : null}
            </div>
          ) : (
            <a
              href="/academy/store"
              style={{ display: "inline-block", marginTop: 16, color: "#2563eb", fontWeight: 600 }}
            >
              Return to Academy Store
            </a>
          )}
        </div>
      </main>
      <ShellFooter />
    </div>
  );
}
