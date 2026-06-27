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

export default class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      message: "",
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
    } catch {
      // Avoid secondary failures while reporting startup faults.
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={panelStyle}>
          <div style={cardStyle}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2563eb" }}>
              FCA startup recovery
            </div>
            <h1 style={{ marginTop: 12, marginBottom: 12, fontSize: 28 }}>
              Something went wrong loading this page.
            </h1>
            <p style={{ marginTop: 0, color: "#475569", lineHeight: 1.6 }}>
              Return home or open your workspace. If this keeps happening, contact FCA support with the details below.
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
                Reload home
              </a>
              <a
                href="/portal/platform"
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
                Open workspace
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
