// auricrux_engine.js
import React from 'react';

export default function AuricruxDock({ context }) {
  return (
    <aside className="auricrux-dock">
      <h4>Auricrux Intelligence</h4>
      <div>Account Summary: {context?.account || "Demo Customer"}</div>
      <div>Project Summary: {context?.project || "Demo Project"}</div>
      <div>Next Actions: {context?.nextActions || "Complete training module"}</div>
      <input placeholder="Ask Auricrux..." />
    </aside>
  );
}
