import { useEffect, useMemo, useState } from "react";
import { brandIdentity } from "../brandIdentity";
import { auricruxPersona } from "../config/auricruxPersona";
import AuricruxAvatar from "./AuricruxAvatar";
import useAuricruxVoice, { resolveSpeechTierFromContext } from "../hooks/useAuricruxVoice";
import { sendAuricruxMessage, sendAuricruxFeedback } from "../api/auricruxClient";
import { submitAuricruxAction } from "../api/auricruxActionsClient";
import { readAcademyContext, subscribeAcademyContext } from "../academyContext";
import { readPortalPageContext, subscribePortalPageContext } from "../portalPageContext";
import {
  auricruxRail,
  currentProject,
  portalTenant,
  routeStateOverlays,
  workspaceContext,
} from "../workspaceState";

import {
  AURICRUX_ASSISTANT_CLOSE,
  AURICRUX_ASSISTANT_OPEN,
  AURICRUX_ASSISTANT_TOGGLE,
} from "../auricruxAssistant";
import { portalTokens } from "../portalDesignTokens";

const quickPrompts = [
  "What should I do next?",
  "Where do I find my products?",
  "What is blocking my project?",
];

const academyQuickPrompts = [
  "Explain this module objective.",
  "What should I focus on in the lab?",
  "How do I pass the knowledge check?",
];

const auricruxColors = brandIdentity.auricrux.colors;
const fcaColors = brandIdentity.fca.colors;
const OPEN_STORAGE_KEY = "auricrux-dock-open";
const COMPACT_STORAGE_KEY = "auricrux-dock-compact";

function safeStorageGet(key) {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Installed app / private mode / restricted storage should not break shell rendering.
  }
}

function modeMeta(mode, poweredByLlm) {
  if (poweredByLlm || mode === "llm-assistant") {
    return {
      label: "Executive operator mode",
      tone: "#166534",
      bg: "#dcfce7",
      border: "#86efac",
      summary: auricruxPersona.voiceSummary,
    };
  }

  if (mode === "live") {
    return {
      label: "Guidance mode",
      tone: "#166534",
      bg: "#dcfce7",
      border: "#86efac",
      summary: "Connected to Auricrux assistant with rule-based guidance.",
    };
  }

  if (mode === "fallback") {
    return {
      label: "Guidance mode",
      tone: auricruxColors.ink,
      bg: auricruxColors.primarySoft,
      border: "#e8c46a",
      summary:
        "Live AI is temporarily unavailable. Replies use guided workspace rules until the executive model reconnects.",
    };
  }

  return {
    label: "Guidance mode",
    tone: auricruxColors.ink,
    bg: auricruxColors.primarySoft,
    border: "#e8c46a",
    summary: "Prepared to narrate next actions and customer state.",
  };
}

function routePromptReply(command) {
  const normalized = command.toLowerCase();

  if (normalized.includes("next customer action")) {
    return `Next step: ${workspaceContext.currentNextAction.toLowerCase()}. Owner: ${workspaceContext.nextActionOwner}. Open Messages or Billing to continue.`;
  }

  if (normalized.includes("training continuity")) {
    return `Training: ${routeStateOverlays.academy.primaryDetail} Assign pending learners from Academy.`;
  }

  if (normalized.includes("blocking revenue")) {
    return `Revenue is blocked by ${auricruxRail.currentBlocker.toLowerCase()}. ${auricruxRail.blockerImpact} Clear the approval path in Bids, then advance Billing.`;
  }

  if (normalized.includes("sheet") || normalized.includes("markup") || normalized.includes("takeoff") || normalized.includes("plan")) {
    return `${routeStateOverlays.design.primaryDetail} ${routeStateOverlays.design.auricruxDetail}`;
  }

  if (normalized.includes("connected")) {
    return `I'm connected to ${portalTenant.name}. Ask me about next actions, training, or billing.`;
  }

  return `${auricruxRail.nextRecommendedAction}. ${auricruxRail.recommendationReason}`;
}

function connectivityLabel(message) {
  if (message === "Failed to fetch") {
    return "Backend connectivity degraded. Shell continuity fallback engaged.";
  }

  return `Backend continuity notice: ${message}`;
}

const continuityActions = [
  { href: "/portal/platform", label: "Platform state" },
  { href: "/portal/auricrux", label: "Auricrux hub" },
  { href: "/portal/messages", label: "Messages" },
  { href: "/portal/billing", label: "Billing" },
  { href: "/academy", label: "Academy" },
  { href: "/portal/support", label: "Support" },
];

function buildChatContext({
  route,
  portalTenant,
  workspaceContext,
  auricruxRail,
  portalPageContext,
  academyContext,
  designParams,
  pageProjectId,
}) {
  if (!route.startsWith("/portal")) {
    return {
      company: "Future Contractors of America",
      route,
      nextAction: route.startsWith("/academy")
        ? "Browse Academy programs or assign training to your crew."
        : "Learn how FCA unifies bids, field execution, billing, and contractor training.",
      blocker: "None — public discovery lane.",
      pageSurface: route === "/" ? "marketing-home" : "public-site",
      academyContext: academyContext || null,
    };
  }

  return {
    company: portalTenant.name,
    nextAction: workspaceContext.currentNextAction,
    blocker: auricruxRail.currentBlocker,
    projectId: pageProjectId,
    pipelineStep: portalPageContext?.pipelineStep || null,
    bidId: portalPageContext?.bidId || null,
    pageSurface: portalPageContext?.surface || null,
    academyContext: academyContext || null,
    designContext: route.includes("/portal/design")
      ? {
          fileId: designParams.get("fileId") || "",
          sheetId: designParams.get("sheetId") || "",
          overlay: routeStateOverlays.design,
        }
      : null,
  };
}

export default function AuricruxDock() {
  const [text, setText] = useState("");
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("ready");
  const [poweredByLlm, setPoweredByLlm] = useState(false);
  const [llmUnavailableReason, setLlmUnavailableReason] = useState("");
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [academyContext, setAcademyContext] = useState(() => readAcademyContext());
  const [portalPageContext, setPortalPageContext] = useState(() => readPortalPageContext());
  const [lastReply, setLastReply] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const [feedbackState, setFeedbackState] = useState("");
  const { supported: voiceSupported, speaking, speak, stop } = useAuricruxVoice();

  const speechTier = useMemo(() => {
    if (!academyContext) return 3;
    return resolveSpeechTierFromContext({
      lane: academyContext.lane || "professional",
      programLevel: academyContext.programLevel || 1,
      moduleNumber: academyContext.moduleNumber || 1,
      lessonIndex: academyContext.lessonIndex || 1,
      completedModules: academyContext.completedModules || 0,
    });
  }, [academyContext]);

  const avatarState = loading ? "thinking" : speaking ? "speaking" : text.trim() ? "listening" : "idle";

  const meta = useMemo(() => {
    const base = modeMeta(mode, poweredByLlm);
    if (!poweredByLlm && llmUnavailableReason) {
      return {
        ...base,
        summary: `Guidance mode — ${llmUnavailableReason}`,
      };
    }
    return base;
  }, [mode, poweredByLlm, llmUnavailableReason]);
  const activeQuickPrompts = academyContext ? academyQuickPrompts : quickPrompts;

  useEffect(() => subscribeAcademyContext(setAcademyContext), []);
  useEffect(() => subscribePortalPageContext(setPortalPageContext), []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    function onToggle() {
      setOpen((value) => !value);
    }
    function onOpen() {
      setOpen(true);
    }
    function onClose() {
      setOpen(false);
    }

    window.addEventListener(AURICRUX_ASSISTANT_TOGGLE, onToggle);
    window.addEventListener(AURICRUX_ASSISTANT_OPEN, onOpen);
    window.addEventListener(AURICRUX_ASSISTANT_CLOSE, onClose);

    return () => {
      window.removeEventListener(AURICRUX_ASSISTANT_TOGGLE, onToggle);
      window.removeEventListener(AURICRUX_ASSISTANT_OPEN, onOpen);
      window.removeEventListener(AURICRUX_ASSISTANT_CLOSE, onClose);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !open) return;
    safeStorageSet(OPEN_STORAGE_KEY, "true");
  }, [open, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    safeStorageSet(COMPACT_STORAGE_KEY, String(compact));
  }, [compact, hydrated]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  async function send(customText) {
    const cmd = (customText ?? text).trim();
    if (!cmd || loading) return;

    setLoading(true);
    setFeedbackState("");

    setLog((prev) => [
      { t: new Date().toISOString(), m: `SENT: ${cmd}` },
      ...prev,
    ]);

    setText("");

    try {
      const route = typeof window !== "undefined" ? window.location.pathname : "/portal/platform";
      const designParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
      const pageProjectId = portalPageContext?.projectId || currentProject.id;
      const data = await sendAuricruxMessage({
        message: cmd,
        route,
        context: buildChatContext({
          route,
          portalTenant,
          workspaceContext,
          auricruxRail,
          portalPageContext,
          academyContext,
          designParams,
          pageProjectId,
        }),
      });
      setMode(data.poweredByLlm || data.mode === "llm-assistant" ? "live" : "fallback");
      setPoweredByLlm(Boolean(data.poweredByLlm || data.mode === "llm-assistant"));
      setLlmUnavailableReason(data.llmUnavailableReason || "");
      setLastReply(data.reply || "");
      setLastPrompt(cmd);

      setLog((prev) => [
        {
          t: new Date().toISOString(),
          m: data.llmUnavailableReason
            ? `AURICRUX: ${data.reply} (Guidance mode — ${data.llmUnavailableReason})`
            : `AURICRUX: ${data.reply}`,
        },
        ...prev,
      ]);

      if (data.reply) {
        void speak(data.reply.replace(/^AURICRUX:\s*/i, ""), { tier: speechTier });
      }

      void submitAuricruxAction({
        mode: "recommend",
        targetObjectType: "Project",
        targetObjectId: pageProjectId,
        rationale: cmd,
        sourceRoute: route,
      }).catch(() => {});
    } catch (err) {
      setMode("fallback");
      setPoweredByLlm(false);
      setLlmUnavailableReason("");
      const continuityReply = routePromptReply(cmd);
      setLastReply(continuityReply);
      setLastPrompt(cmd);
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

  function speakLastReply() {
    if (lastReply) void speak(lastReply, { tier: speechTier });
  }

  async function submitFeedback(rating) {
    if (!lastReply || !lastPrompt || feedbackState) return;
    const route = typeof window !== "undefined" ? window.location.pathname : "/portal/platform";
    try {
      await sendAuricruxFeedback({
        rating,
        message: lastPrompt,
        reply: lastReply,
        route,
        context: {
          company: portalTenant.name,
          nextAction: workspaceContext.currentNextAction,
          blocker: auricruxRail.currentBlocker,
          academyContext: academyContext || null,
        },
      });
      setFeedbackState(rating);
    } catch {
      setFeedbackState("error");
    }
  }

  async function video() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      alert("Video capability is unavailable in this browser context.");
      return;
    }

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

  const panelWidth = compact ? "min(360px, 100vw)" : "min(420px, 100vw)";

  if (!open) {
    return (
      <button
        type="button"
        aria-label="Open Auricrux assistant"
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9990,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px 12px 12px",
          borderRadius: 999,
          border: `2px solid ${auricruxColors.primary}`,
          background: `linear-gradient(135deg, ${auricruxColors.primaryDark} 0%, ${auricruxColors.primary} 100%)`,
          color: "#fff7e1",
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
          boxShadow: "0 12px 32px rgba(15, 23, 42, 0.22)",
          fontFamily: portalTokens.font,
        }}
      >
        <img
          src="/brand/auricrux/auricrux-portrait.png"
          alt=""
          width={28}
          height={28}
          style={{ display: "block" }}
        />
        Ask Auricrux
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close Auricrux assistant"
        onClick={() => setOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          border: "none",
          padding: 0,
          background: "rgba(15, 23, 42, 0.35)",
          cursor: "pointer",
        }}
      />
      <aside
        aria-label="Auricrux assistant"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: panelWidth,
          height: "100vh",
          zIndex: 9999,
          borderLeft: `1px solid ${auricruxColors.primary}`,
          boxShadow: "-12px 0 40px rgba(15, 23, 42, 0.18)",
          background: "#ffffff",
          fontFamily: portalTokens.font,
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
          <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
            <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 14, padding: 4 }}>
              <AuricruxAvatar state={avatarState} size={compact ? 72 : 84} showCaption={false} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, letterSpacing: 0.2 }}>{auricruxPersona.name}</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>
                {auricruxPersona.title}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              onClick={() => setCompact((v) => !v)}
              style={headerButtonStyle}
            >
              {compact ? "Wider" : "Narrow"}
            </button>
            <button
              onClick={() => setOpen(false)}
              style={headerButtonStyle}
            >
              Close
            </button>
          </div>
        </div>
      </div>

        <div style={{ padding: 14, overflow: "auto", flex: 1 }}>
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
            {auricruxPersona.intro}
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
            <AuricruxAvatar state={avatarState} size={compact ? 108 : 128} compact={compact} />
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
              <div><strong>Project:</strong> {portalPageContext?.projectId || currentProject.id} · {currentProject.stage}</div>
              {portalPageContext?.pipelineStep ? (
                <div><strong>Pipeline step:</strong> {portalPageContext.pipelineStep}</div>
              ) : null}
              <div><strong>Next action:</strong> {workspaceContext.currentNextAction}</div>
              <div><strong>Revenue blocker:</strong> {auricruxRail.currentBlocker}</div>
              {academyContext ? (
                <div><strong>Academy:</strong> {academyContext.programTitle || academyContext.programKey} · Module {academyContext.moduleNumber}</div>
              ) : (
                <div><strong>Training:</strong> Two learners need assignment to preserve academy continuity.</div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <button
              onClick={speakLastReply}
              disabled={!voiceSupported || !lastReply || speaking}
              style={buttonStyle("secondary")}
            >
              {speaking ? "Speaking..." : "Hear reply"}
            </button>
            <button onClick={stop} disabled={!speaking} style={buttonStyle("secondary")}>Stop voice</button>
            <button
              onClick={() => submitFeedback("up")}
              disabled={!lastReply || Boolean(feedbackState)}
              style={buttonStyle(feedbackState === "up" ? "primary" : "secondary")}
            >
              {feedbackState === "up" ? "Thanks" : "Helpful"}
            </button>
            <button
              onClick={() => submitFeedback("down")}
              disabled={!lastReply || Boolean(feedbackState)}
              style={buttonStyle(feedbackState === "down" ? "primary" : "secondary")}
            >
              {feedbackState === "down" ? "Noted" : "Improve"}
            </button>
            <button onClick={video} style={buttonStyle("secondary")}>Video</button>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: auricruxColors.ink, marginBottom: 8 }}>Quick prompts</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {activeQuickPrompts.map((prompt) => (
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
              placeholder="Message Auricrux..."
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
                Ask Auricrux for the next step, help finding a product, training guidance, or what is blocking your work.
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
      </aside>
    </>
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
