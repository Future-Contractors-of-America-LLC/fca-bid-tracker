import { useState } from "react";

const demoResponses = [
  "Auricrux demo mode: I can guide the next customer action from this shell.",
  "Auricrux demo mode: The portal and academy are aligned for onboarding continuity.",
  "Auricrux demo mode: One approval is ready and two learners need assignment."
];

export default function AuricruxDock() {
  const [text, setText] = useState("");
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("ready");

  async function send() {
    const cmd = text.trim();
    if (!cmd || loading) return;

    setLoading(true);

    setLog((prev) => [
      { t: new Date().toISOString(), m: `SENT: ${cmd}` },
      ...prev
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
            command: cmd
          })
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
          m: `SUCCESS: Bid created (${data.id || "no id"})`
        },
        ...prev
      ]);
    } catch (err) {
      setMode("demo");
      const reply = demoResponses[Math.floor(Math.random() * demoResponses.length)];
      setLog((prev) => [
        {
          t: new Date().toISOString(),
          m: `AURICRUX: ${reply}`
        },
        {
          t: new Date().toISOString(),
          m: `DEMO FALLBACK: ${err.message}`
        },
        ...prev
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
        audio: true
      });
      stream.getTracks().forEach((t) => t.stop());
      alert("Video capability available (capture test passed).");
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
        width: 340,
        zIndex: 9999,
        background: "#fff",
        padding: 12,
        border: "1px solid #ddd",
        borderRadius: 12,
        boxShadow: "0 10px 30px rgba(0,0,0,0.12)"
      }}
    >
      <strong>Auricrux™</strong>
      <div style={{ marginTop: 4, fontSize: 12, color: "#6b7280" }}>
        Mode: {mode === "live" ? "Live API" : mode === "demo" ? "Demo Fallback" : "Ready"}
      </div>

      <div style={{ marginTop: 8 }}>
        <button onClick={speak}>Voice</button>
        <button onClick={video} style={{ marginLeft: 6 }}>
          Video
        </button>
      </div>

      <div style={{ marginTop: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message Auricrux…"
          style={{ width: "65%" }}
        />
        <button onClick={send} disabled={loading} style={{ marginLeft: 6 }}>
          {loading ? "..." : "Send"}
        </button>
      </div>

      <div
        style={{
          marginTop: 10,
          maxHeight: 200,
          overflow: "auto",
          fontSize: 11
        }}
      >
        {log.length === 0 ? (
          <div style={{ color: "#6b7280" }}>
            Ask Auricrux for the next action, customer update, or training guidance.
          </div>
        ) : (
          log.map((l, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <div style={{ opacity: 0.5 }}>{l.t}</div>
              <div>{l.m}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
