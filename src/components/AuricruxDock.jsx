import { useState } from "react";

export default function AuricruxDock() {
  const [text, setText] = useState("");
  const [log, setLog] = useState([]);

  function send() {
    if (!text.trim()) return;
    setLog([{ t: new Date().toISOString(), m: text }, ...log]);
    setText("");
  }

  function speak() {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance("Auricrux is online.");
    window.speechSynthesis.speak(u);
  }

  async function video() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      s.getTracks().forEach((tr) => tr.stop());
      alert("Video capability available (capture test passed).");
    } catch (e) {
      alert("Video capability blocked by browser policy or permissions.");
    }
  }

  return (
    <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 9999, background: "#fff", padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
      <strong>Auricrux™</strong>
      <div style={{ marginTop: 8 }}>
        <button onClick={speak}>Voice</button>
        <button onClick={video}>Video</button>
      </div>
      <div style={{ marginTop: 8 }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message Auricrux…" />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}