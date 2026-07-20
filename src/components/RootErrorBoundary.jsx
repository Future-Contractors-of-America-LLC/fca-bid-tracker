import React from "react";

const panelStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  background: "#f8fafc",
  color: "#0f172a",
  fontFamily: "Arial, sans-serif",
};

const cardStyle = {
  width: "min(720px, 100%)",
  background: "#ffffff",
  border: "1px solid #dbe3ef",
  borderRadius: 20,
  boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)",
  padding: 24,
};

function isChunkLoadMessage(message) {
  const text = String(message || "").toLowerCase();
  return (
    text.includes("failed to fetch dynamically imported module") ||
    text.includes("error loading dynamically imported module") ||
    text.includes("loading chunk") ||
    text.includes("importing a module script failed")
  );
}

export default class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      message: "",
      reloading: false,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "Unknown startup error",
    };
  }

  componentDidCatch(error, errorInfo) {
    try {
      console.error("FCA root startup error", error, errorInfo);
      if (isChunkLoadMessage(error?.message || error) && typeof window !== "undefined") {
        const key = "fca_chunk_reload_boundary_v1";
        if (window.sessionStorage.getItem(key) !== "1") {
          window.sessionStorage.setItem(key, "1");
          this.setState({ reloading: true });
          window.location.reload();
        }
      }
    } catch {
      // Avoid secondary failures while reporting startup faults.
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.state.reloading) {
        return (
          <div style={panelStyle}>
            <div style={cardStyle}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2563eb" }}>
                Future Contractors of America
              </div>
              <h1 style={{ marginTop: 12, marginBottom: 12, fontSize: 28 }}>Refreshing workspace assets…</h1>
              <p style={{ marginTop: 0, color: "#475569", lineHeight: 1.6 }}>
                A newer site build is loading. This usually clears after one refresh.
              </p>
            </div>
          </div>
        );
      }

      return (
        <div style={panelStyle}>
          <div style={cardStyle}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2563eb" }}>
              Future Contractors of America
            </div>
            <h1 style={{ marginTop: 12, marginBottom: 12, fontSize: 28 }}>
              This page needs a quick refresh.
            </h1>
            <p style={{ marginTop: 0, color: "#475569", lineHeight: 1.6 }}>
              FCA is an AI-native contractor platform that combines contractor workflows,
              project execution, billing, workforce training, and Auricrux construction intelligence.
              Use the company pages below while we recover this workspace view.
            </p>
            <div
              style={{
                marginTop: 16,
                border: "1px solid #dbe3ef",
                borderRadius: 14,
                padding: 14,
                background: "#f8fafc",
                fontFamily: "monospace",
                fontSize: 12,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {this.state.message}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
              <a
                href="/"
                style={{
                  textDecoration: "none",
                  background: "#2563eb",
                  color: "#fff",
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontWeight: 700,
                }}
              >
                Company homepage
              </a>
              <a
                href="/platform"
                style={{
                  textDecoration: "none",
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  border: "1px solid #bfdbfe",
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontWeight: 700,
                }}
              >
                Platform
              </a>
              <a
                href="/pricing"
                style={{
                  textDecoration: "none",
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  border: "1px solid #bfdbfe",
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontWeight: 700,
                }}
              >
                Pricing
              </a>
              <a
                href="/contact"
                style={{
                  textDecoration: "none",
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  border: "1px solid #bfdbfe",
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontWeight: 700,
                }}
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
