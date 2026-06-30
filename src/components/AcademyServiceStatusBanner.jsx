import { ACADEMY_DEGRADED_MESSAGE } from "../api/academyResponseGuard";

/**
 * Slice 07 protective surface.
 *
 * Renders nothing when academy services are healthy. When the academy LMS or
 * commerce API is in the known degraded state (empty body / non-JSON from the
 * upstream auricrux-central endpoint, per the LMS repair loop history),
 * shows a customer-comprehension-positive banner with safe fallback CTAs to
 * the rest of the FCA platform so customer trust and continuity are
 * preserved while the canonical fix lands on the Primary machine.
 *
 * Inputs:
 * - persistenceState: meta.persistenceState from useAcademyLms()
 * - error: optional caught error from a commerce / catalog call
 * - context: short label ("Academy LMS", "Academy Store", etc.) for UX clarity
 */

const bannerStyle = {
  border: "1px solid #e5d3a1",
  borderRadius: 16,
  padding: 18,
  background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
  marginBottom: 24,
};

const headlineStyle = {
  color: "#8a6a14",
  fontWeight: 700,
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 8,
};

const linkStyle = {
  border: "1px solid #8a6a14",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  textDecoration: "none",
  color: "#6b5a19",
  background: "#fff",
};

const primaryLinkStyle = {
  ...linkStyle,
  background: "#8a6a14",
  color: "#fff",
};

// Fix: removed 'pending' from the degraded check.
// useAcademyLms initializes with 'Academy API pending' before the first fetch
// resolves — this is normal transient loading state, not a degradation signal.
// Showing the degraded banner during every healthy page load is a false positive.
// Only 'unavailable' and 'degraded' strings indicate a real upstream failure.
function isAcademyApiDegraded(persistenceState) {
  if (!persistenceState) return false;
  const lower = String(persistenceState).toLowerCase();
  return lower.includes("unavailable") || lower.includes("degraded");
}

function errorIsDegraded(error) {
  if (!error) return false;
  if (typeof error === "object" && error?.degraded === true) return true;
  const message = typeof error === "string" ? error : error?.message || "";
  return /updating|unavailable|temporarily|status 5\d\d|unexpected end of json/i.test(message);
}

export default function AcademyServiceStatusBanner({
  persistenceState,
  error,
  context = "Academy",
  showWhenHealthy = false,
}) {
  const degraded = isAcademyApiDegraded(persistenceState) || errorIsDegraded(error);

  if (!degraded && !showWhenHealthy) return null;

  if (!degraded) {
    return (
      <div style={{ ...bannerStyle, borderColor: "#bbf7d0", background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)" }}>
        <div style={{ ...headlineStyle, color: "#166534" }}>Academy services online</div>
        <div style={{ color: "#475569", lineHeight: 1.6 }}>
          {context} is connected to the live FCA learning spine.
        </div>
      </div>
    );
  }

  const customerMessage = errorIsDegraded(error) && error?.message
    ? error.message
    : ACADEMY_DEGRADED_MESSAGE;

  return (
    <div role="status" aria-live="polite" style={bannerStyle}>
      <div style={headlineStyle}>{context} services updating</div>
      <h2 style={{ margin: "0 0 10px", fontSize: 20, color: "#111827" }}>
        Your account, orders, and progress are safe
      </h2>
      <p style={{ color: "#475569", lineHeight: 1.7, marginTop: 0, maxWidth: 720 }}>
        {customerMessage} Existing enrollments, completed lessons, and credentials are stored on the
        FCA spine and will reappear automatically once the academy service finishes updating.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        <a href="/portal" style={primaryLinkStyle}>
          Open Contractor Command
        </a>
        <a href="/portal/support" style={linkStyle}>
          Contact FCA support
        </a>
        <a href="/pricing" style={linkStyle}>
          View academy plans
        </a>
      </div>
    </div>
  );
}
