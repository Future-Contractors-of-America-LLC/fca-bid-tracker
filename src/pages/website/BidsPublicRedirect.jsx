import { useEffect } from "react";

/** Legacy public /bids path → authenticated bids workspace entry. */
export default function BidsPublicRedirect() {
  useEffect(() => {
    window.location.replace("/login?next=/portal/bids");
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "#f8fafc",
        color: "#0f172a",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 560, background: "#fff", border: "1px solid #dbe3ef", borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2563eb" }}>
          Future Contractors of America
        </div>
        <h1 style={{ marginTop: 12, fontSize: 28 }}>Opening bids workspace…</h1>
        <p style={{ color: "#475569", lineHeight: 1.6 }}>
          Bids live inside the FCA contractor workspace. Continue to sign in, or review the public company pages while
          you wait.
        </p>
        <p>
          <a href="/login?next=/portal/bids" style={{ color: "#1d4ed8", fontWeight: 700 }}>Continue to login</a>
          {" · "}
          <a href="/" style={{ color: "#1d4ed8", fontWeight: 700 }}>Homepage</a>
          {" · "}
          <a href="/platform" style={{ color: "#1d4ed8", fontWeight: 700 }}>Platform</a>
          {" · "}
          <a href="/company.html" style={{ color: "#1d4ed8", fontWeight: 700 }}>Company overview</a>
        </p>
      </div>
    </main>
  );
}
