import { useMemo, useState } from "react";

const fallbackResponses = [
  "Auricrux continuity mode: I can guide the next customer action from this shell.",
  "Auricrux continuity mode: The portal and academy are aligned for onboarding continuity.",
  "Auricrux continuity mode: One approval is ready and two learners need assignment.",
];

const quickPrompts = [
  "What is the next customer action?",
  "Show training continuity.",
  "What is blocking revenue right now?",
];

function modeMeta(mode) {
  if (mode === "live") {
    return {
      label: "Live API",
      tone: "#166534",
      bg: "#dcfce7",
      border: "#86efac",
      summary: "Connected to active bid-intake behavior.",
    };
  }

  if (mode === "fallback") {
    return {
      label: "Continuity Mode",
      tone: "#9a3412",
      bg: "#ffedd5",
      border: "#fdba74",
      summary: "Fallback guidance is preserving shell continuity while backend connectivity is restored.",
    };
  }

  return {
    label: "Ready",
    tone: "#1d4ed8",
    bg: "#dbeafe",
    border: "#93c5fd",
    summary: "Prepared to narrate next actions and customer state.",
  };
}

export default function AuricruxDock() {
  const [text, setText] = useState("");
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("ready");
  const [open, setOpen] = useState(true);

  const meta = useMemo(() => modeMeta(mode), [mode]);

  async function send(customText) {
    const cmd = (customText ?? text).trim();
    if (!cmd || loading) return;

    setLoading(true);

    setLog((prev) => [
      { t: new Date().toISOString(), m: `SENT: ${cmd}` },
      ...prev,
    ]);

    setText("");

    try {
      const res = await fetch(
        "https://auricrux-bid-api-node-ftcueggjg4b0ehbs.centralus-01.azurewebsites.net/api/bids",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: `dock-${Date.now()}`,
            company: "FCA User",
            value: 100000,
            status: "new",
            source: "auricrux-dock",
            command: cmd,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setMode("live");

      setLog((prev) => [
        {
          t: new Date().toISOString(),
          m: `SUCCESS: Bid created (${data.id || "no id"})`,
        },
        ...prev,
      ]);
    } catch (err) {
      setMode("fallback");
      const reply = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      setLog((prev) => [
        {
          t: new Date().toISOString(),
          m: `AURICRUX: ${reply}`,
        },
        {
          t: new Date().toISOString(),
          m: `CONTINUITY: ${err.message}`,
        },
        ...prev,
      ]);
    }

    setLoading(false);
  }

  function speak() {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance("Auricrux is online.");
    window.speechSynthesis.speak(u);
  }

  async function video() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      stream.getTracks().forEach((t) => t.stop());
      alert("Video capability available for workspace review.");
    } catch {
      alert("Video capability blocked by browser policy or permissions.");
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        width: open ? 368 : 220,
        zIndex: 9999,
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid #cbd5e1",
        boxShadow: "0 20px 50px rgba(15, 23, 42, 0.2)",
        background: "#ffffff",
        fontFamily: "Arial",
        transition: "width 160ms ease",
      }}
    >
      <div
        style={{
          padding: 14,
          background: "linear-gradient(135deg, #111827 0%, #1e3a8a 100%)",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, letterSpacing: 0.2 }}>Auricrux</div>
            <div style={{ fontSize: 12, opacity: 0.82 }}>Executive operating layer</div>
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              borderRadius: 10,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            {open ? "Minimize" : "Open"}
          </button>
        </div>
      </div>

      <div style={{ padding: 14 }}>
        <div
          style={{
            border: `1px solid ${meta.border}`,
            background: meta.bg,
            color: meta.tone,
            borderRadius: 12,
            padding: 12,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Mode: {meta.label}</div>
          <div style={{ fontSize: 12, lineHeight: 1.5 }}>{meta.summary}</div>
        </div>

        {open ? (
          <>
            <div style={{ marginTop: 12, fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
              Use Auricrux to narrate next actions, explain customer state, and preserve continuity across portal and academy routes.
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button onClick={speak} style={buttonStyle("secondary")}>Voice</button>
              <button onClick={video} style={buttonStyle("secondary")}>Video</button>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 8 }}>Quick prompts</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => send(prompt)}
                    disabled={loading}
                    style={buttonStyle("chip")}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Message Auricrux…"
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: "1px solid #cbd5e1",
                  borderRadius: 12,
                  padding: "11px 12px",
                  outline: "none",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
              />
              <button onClick={() => send()} disabled={loading} style={buttonStyle("primary")}>
                {loading ? "..." : "Send"}
              </button>
            </div>

            <div
              style={{
                marginTop: 12,
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 10,
                maxHeight: 220,
                overflow: "auto",
                background: "#f8fafc",
              }}
            >
              {log.length === 0 ? (
                <div style={{ color: "#64748b", fontSize: 12, lineHeight: 1.6 }}>
                  Ask Auricrux for the next action, a customer update, training guidance, or a production-rollout narration cue.
                </div>
              ) : (
                log.map((l, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: 8,
                      paddingBottom: 8,
                      borderBottom: i === log.length - 1 ? "none" : "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ opacity: 0.55, fontSize: 10 }}>{l.t}</div>
                    <div style={{ fontSize: 12, marginTop: 3, color: "#0f172a", lineHeight: 1.5 }}>{l.m}</div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div style={{ marginTop: 12, fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
            Open Auricrux to access prompts, voice, video, and continuity activity.
          </div>
        )}
      </div>
    </div>
  );
}

function buttonStyle(kind) {
  if (kind === "primary") {
    return {
      border: "none",
      background: "#111827",
      color: "#fff",
      borderRadius: 12,
      padding: "11px 14px",
      fontWeight: 700,
      cursor: "pointer",
    };
  }

  if (kind === "chip") {
    return {
      border: "1px solid #cbd5e1",
      background: "#fff",
      color: "#0f172a",
      borderRadius: 999,
      padding: "8px 10px",
      fontSize: 12,
      cursor: "pointer",
    };
  }

  return {
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    color: "#0f172a",
    borderRadius: 10,
    padding: "8px 12px",
    fontWeight: 600,
    cursor: "pointer",
  };
}
