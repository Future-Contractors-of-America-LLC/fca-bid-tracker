export default function LeadHub() {
  if (typeof window !== "undefined") {
    window.location.replace("/portal/leads");
  }

  return (
    <div style={{ padding: "40px", fontFamily: "Segoe UI, Arial, sans-serif", maxWidth: 900, margin: "0 auto" }}>
      <h1>FCA Lead Intelligence</h1>
      <p style={{ color: "#64748b", lineHeight: 1.6 }}>
        Redirecting to the governed lead pipeline in the customer portal…
      </p>
      <a href="/portal/leads" style={{ color: "#2563eb", fontWeight: 700 }}>
        Open Lead Intelligence
      </a>
    </div>
  );
}
