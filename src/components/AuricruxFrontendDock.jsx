import { useMemo, useState } from "react";
import AuricruxBrandMark from "./AuricruxBrandMark";

const dockButtonStyle = {
  position: "fixed",
  right: 18,
  bottom: 18,
  zIndex: 999,
  borderRadius: 999,
  border: "1px solid #d3a74d",
  background: "linear-gradient(135deg, #fff2c8 0%, #d49a22 65%, #8a5a12 100%)",
  color: "#2c1803",
  fontWeight: 900,
  letterSpacing: "0.04em",
  padding: "10px 14px",
  boxShadow: "0 16px 28px rgba(124, 83, 19, 0.32)",
  cursor: "pointer",
};

const panelStyle = {
  position: "fixed",
  right: 18,
  bottom: 72,
  width: "min(92vw, 360px)",
  zIndex: 999,
  borderRadius: 16,
  border: "1px solid #ecd089",
  background: "linear-gradient(135deg, #fff8e6 0%, #ffffff 60%)",
  boxShadow: "0 20px 34px rgba(124, 83, 19, 0.2)",
  padding: 14,
};

const quickActions = [
  {
    label: "Open Auricrux Command",
    href: "/auricrux",
  },
  {
    label: "Open Platform Dashboard",
    href: "/portal/platform",
  },
  {
    label: "Message Support",
    href: "mailto:support@futurecontractorsofamerica.com?subject=Auricrux%20Support%20Request",
  },
];

function resolveResponse(input) {
  const value = input.trim().toLowerCase();
  if (!value) return "Give Auricrux a command or ask for a next step.";
  if (value.includes("next") || value.includes("priority")) {
    return "Auricrux recommendation: open Platform Dashboard, review bids and blockers, then advance the next action in portal operations.";
  }
  if (value.includes("price") || value.includes("plan")) {
    return "Auricrux recommendation: compare plan depth in Pricing, then schedule a walkthrough for rollout alignment.";
  }
  if (value.includes("academy") || value.includes("training")) {
    return "Auricrux recommendation: open Academy continuity and map training checkpoints to active project state.";
  }
  return "Auricrux received your request. Use quick actions below to continue in the live workspace flow.";
}

export default function AuricruxFrontendDock() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("Auricrux online. Ask for a next action, pricing guidance, or training continuity step.");

  const routeCue = useMemo(() => {
    if (typeof window === "undefined") return "Public route";
    const path = window.location.pathname;
    if (path.startsWith("/portal")) return "Portal route detected";
    if (path.startsWith("/academy")) return "Academy route detected";
    if (path.startsWith("/auricrux")) return "Auricrux route detected";
    return "Public route detected";
  }, [open]);

  function handleAsk(event) {
    event.preventDefault();
    setResponse(resolveResponse(prompt));
    setPrompt("");
  }

  return (
    <>
      {open ? (
        <div style={panelStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 8 }}>
            <AuricruxBrandMark compact />
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ border: "1px solid #e7c77f", background: "#fff", borderRadius: 8, padding: "6px 10px", fontWeight: 700, color: "#7c5313", cursor: "pointer" }}
            >
              Close
            </button>
          </div>

          <div style={{ color: "#7c5313", fontWeight: 700, fontSize: 12, marginBottom: 8 }}>{routeCue}</div>
          <div style={{ border: "1px solid #ecd089", borderRadius: 12, background: "#fffdf5", padding: 10, color: "#4b3208", lineHeight: 1.6, marginBottom: 10 }}>
            {response}
          </div>

          <form onSubmit={handleAsk} style={{ display: "grid", gap: 8, marginBottom: 10 }}>
            <input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask Auricrux for your next step"
              style={{ border: "1px solid #e7c77f", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
            />
            <button
              type="submit"
              style={{ border: "1px solid #7c5313", background: "linear-gradient(135deg, #fff0c2 0%, #d49a22 100%)", borderRadius: 10, padding: "9px 12px", fontWeight: 800, color: "#2c1803", cursor: "pointer" }}
            >
              Ask Auricrux
            </button>
          </form>

          <div style={{ display: "grid", gap: 8 }}>
            {quickActions.map((action) => (
              <a
                key={action.label}
                href={action.href}
                style={{ textDecoration: "none", border: "1px solid #e7c77f", borderRadius: 10, padding: "9px 10px", color: "#6b450c", fontWeight: 700, background: "#fff" }}
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <button type="button" onClick={() => setOpen((value) => !value)} style={dockButtonStyle} aria-label="Open Auricrux interaction dock">
        Auricrux Live
      </button>
    </>
  );
}
