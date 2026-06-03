import { useEffect, useMemo, useState } from "react";
import { brandIdentity } from "../brandIdentity";
import {
  auricruxRail,
  currentProject,
  portalTenant,
  routeStateOverlays,
  workspaceContext,
} from "../workspaceState";

const quickPrompts = [
  "What is the next customer action?",
  "Show training continuity.",
  "What is blocking revenue right now?",
];

const auricruxColors = brandIdentity.auricrux.colors;
const fcaColors = brandIdentity.fca.colors;
const OPEN_STORAGE_KEY = "auricrux-dock-open";
const COMPACT_STORAGE_KEY = "auricrux-dock-compact";

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
      tone: auricruxColors.ink,
      bg: auricruxColors.primarySoft,
      border: "#e8c46a",
      summary:
        "Fallback guidance is preserving shell continuity while backend connectivity is restored.",
    };
  }

  return {
    label: "Ready",
    tone: auricruxColors.ink,
    bg: auricruxColors.primarySoft,
    border: "#e8c46a",
    summary: "Prepared to narrate next actions and customer state.",
  };
}

function routePromptReply(command) {
  const normalized = command.toLowerCase();

  if (normalized.includes("next customer action")) {
    return `Auricrux continuity mode: Next customer action is to ${workspaceContext.currentNextAction.toLowerCase()}. Owner: ${workspaceContext.nextActionOwner}. Open /portal/messages or /portal/billing to continue.`;
  }

  if (normalized.includes("training continuity")) {
    return `Auricrux continuity mode: Training continuity is active. ${routeStateOverlays.academy.primaryDetail} Next move: assign the two pending learners from /academy so workforce readiness stays attached to ${currentProject.id}.`;
  }

  if (normalized.includes("blocking revenue")) {
    return `Auricrux continuity mode: Revenue is blocked by ${auricruxRail.currentBlocker.toLowerCase()}. Impact: ${auricruxRail.blockerImpact} Clear the approval path in /portal/bids and then advance /portal/billing.`;
  }

  if (normalized.includes("connected")) {
    return `Auricrux continuity mode: The shell is available and preserving state for ${portalTenant.name}. Live backend connectivity is degraded, so I am narrating next actions from shared workspace continuity instead of live API responses.`;
  }

  return `Auricrux continuity mode: ${auricruxRail.nextRecommendedAction}. ${auricruxRail.recommendationReason}`;
}

function connectivityLabel(message) {
  if (message === "Failed to fetch") {
    return "Backend connectivity degraded. Shell continuity fallback engaged.";
  }

  return `Backend continuity notice: ${message}`;
}

const continuityActions = [
  { href: "/portal/platform", label: "Platform state" },
  { href: "/portal/messages", label: "Messages" },
  { href: "/portal/billing", label: "Billing" },
  { href: "/academy", label: "Academy" },
  { href: "/portal/support", label: "Support" },
];

export default function AuricruxDock() {
  const [text, setText] = useState("");
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("ready");
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  const meta = useMemo(() => modeMeta(mode), [mode]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedOpen = window.localStorage.getItem(OPEN_STORAGE_KEY);
    const storedCompact = window.localStorage.getItem(COMPACT_STORAGE_KEY);

    if (storedOpen === null) {
      setOpen(window.innerWidth >= 1440);
    } else {
      setOpen(storedOpen === "true");
    }

    if (storedCompact === null) {
      setCompact(window.innerWidth < 1600);
    } else {
      setCompact(storedCompact === "true");
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.localStorage.setItem(OPEN_STORAGE_KEY, String(open));
  }, [open, hydrated]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.localStorage.setItem(COMPACT_STORAGE_KEY, String(compact));
  }, [compact, hydrated]);

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
      const continuityReply = routePromptReply(cmd);
      setLog((prev) => [
        {
          t: new Date().toISOString(),
          m: `AURICRUX: ${continuityReply}`,
        },
        {
          t: new Date().toISOString(),
          m: `CONTINUITY: ${connectivityLabel(err.message)}`,
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

  const dockWidth = open ? (compact ? "min(320px, calc(100vw - 24px))" : "min(392px, calc(100vw - 24px))") : 76;

  return (
    <div
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        width: dockWidth,
        maxHeight: open ? "min(78vh, 760px)" : "auto",
        zIndex: 9999,
        borderRadius: 18,
        overflow: "hidden",
        border: `1px solid ${open ? auricruxColors.primary : "#d6b25e"}`,
        boxShadow: "0 20px 50px rgba(15, 23, 42, 0.2)",
        background: "#ffffff",
        fontFamily: "Arial",
        transition: "width 160ms ease, border-color 160ms ease, max-height 160ms ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: 12,
          background: `linear-gradient(135deg, ${auricruxColors.primaryDark} 0%, ${auricruxColors.primary} 100%)`,
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, letterSpacing: 0.2 }}>Auricrux</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>
              {open ? "Executive operating layer" : "Open comms"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {open ? (
              <>
                <button
                  onClick={() => setCompact((v) => !v)}
                  style={headerButtonStyle}
                >
                  {compact ? "Expand" : "Compact"}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  style={headerButtonStyle}
                >
                  Minimize
                </button>
              </>
            ) : (
              <button onClick={() => setOpen(true)} style={headerButtonStyle}>
                Open
              </button>
            )}
          </div>
        </div>
      </div>

      {open ? (
        <div style={{ padding: 14, overflow: "auto" }}>
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

          <div style={{ marginTop: 12, fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
            Use Auricrux to narrate next actions, explain customer state, and preserve continuity across portal and academy routes.
          </div>

          <div
            style={{
              marginTop: 12,
              border: "1px solid #e5d3a1",
              borderRadius: 12,
              padding: 12,
              background: "#fffaf0",
              display: "grid",
              gap: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 11, letterSpacing: 0.3, fontWeight: 700, color: "#8a6a14", textTransform: "uppercase" }}>
                Customer state
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginTop: 4 }}>{portalTenant.name}</div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>{portalTenant.roleSummary}</div>
            </div>
            <div style={{ display: "grid", gap: 6, fontSize: 12, color: "#1f2937" }}>
              <div><strong>Project:</strong> {currentProject.id} · {currentProject.stage}</div>
              <div><strong>Next action:</strong> {workspaceContext.currentNextAction}</div>
              <div><strong>Revenue blocker:</strong> {auricruxRail.currentBlocker}</div>
              <div><strong>Training:</strong> Two learners need assignment to preserve academy continuity.</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <button onClick={speak} style={buttonStyle("secondary")}>Voice</button>
            <button onClick={video} style={buttonStyle("secondary")}>Video</button>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: auricruxColors.ink, marginBottom: 8 }}>Quick prompts</div>
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
                border: `1px solid ${fcaColors.primarySoft === "#EFF4FF" ? "#d6b25e" : "#cbd5e1"}`,
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

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: auricruxColors.ink, marginBottom: 8 }}>Continuity routes</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {continuityActions.map((action) => (
                <a key={action.href} href={action.href} style={routeLinkStyle}>
                  {action.label}
                </a>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              border: "1px solid #efe2bd",
              borderRadius: 12,
              padding: 10,
              maxHeight: compact ? 180 : 220,
              overflow: "auto",
              background: "#fffdf7",
            }}
          >
            {log.length === 0 ? (
              <div style={{ color: "#7c6b4a", fontSize: 12, lineHeight: 1.6 }}>
                Ask Auricrux for the next action, a customer update, training guidance, or a production-rollout narration cue.
              </div>
            ) : (
              log.map((l, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: 8,
                    paddingBottom: 8,
                    borderBottom: i === log.length - 1 ? "none" : "1px solid #f3ead2",
                  }}
                >
                  <div style={{ opacity: 0.55, fontSize: 10 }}>{l.t}</div>
                  <div style={{ fontSize: 12, marginTop: 3, color: "#0f172a", lineHeight: 1.5 }}>{l.m}</div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div style={{ padding: "10px 12px", background: "#fffdf7", color: "#6b7280", fontSize: 11, lineHeight: 1.5 }}>
          Open Auricrux without covering the page.
        </div>
      )}
    </div>
  );
}

function buttonStyle(kind) {
  if (kind === "primary") {
    return {
      border: "none",
      background: `linear-gradient(135deg, ${auricruxColors.primaryDark} 0%, ${auricruxColors.primary} 100%)`,
      color: "#fff",
      borderRadius: 12,
      padding: "11px 14px",
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 10px 24px rgba(212, 154, 34, 0.25)",
    };
  }

  if (kind === "chip") {
    return {
      border: `1px solid ${auricruxColors.primary}`,
      background: auricruxColors.primarySoft,
      color: auricruxColors.ink,
      borderRadius: 999,
      padding: "8px 10px",
      fontSize: 12,
      cursor: "pointer",
    };
  }

  return {
    border: `1px solid ${auricruxColors.primary}`,
    background: "#fffdf7",
    color: auricruxColors.ink,
    borderRadius: 10,
    padding: "8px 12px",
    fontWeight: 600,
    cursor: "pointer",
  };
}

const routeLinkStyle = {
  textDecoration: "none",
  border: "1px solid #e5d3a1",
  background: "#fffaf0",
  color: "#8a6a14",
  borderRadius: 999,
  padding: "8px 10px",
  fontSize: 12,
  fontWeight: 700,
};

const headerButtonStyle = {
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(255,255,255,0.12)",
  color: "#fff",
  borderRadius: 10,
  padding: "6px 10px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
};
