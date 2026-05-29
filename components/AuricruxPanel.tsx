"use client";

import { useState } from "react";

export default function AuricruxPanel() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  async function send() {
    const res = await fetch("/api/auricrux", {
      method: "POST",
      body: JSON.stringify({ input }),
    });

    const data = await res.json();

    setOutput(
      "Auricrux: Based on your system, next action is to build connected workflow modules."
    );
  }

  return (
    <div style={{marginTop: "30px", border: "2px solid black", padding: "15px"}}>
      <h3>Auricrux Intelligence</h3>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask Auricrux..."
      />

      <button onClick={send}>Send</button>

      <p style={{marginTop: "10px"}}>{output}</p>
    </div>
  );
}
