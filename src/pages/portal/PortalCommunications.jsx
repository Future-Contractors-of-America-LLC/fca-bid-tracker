import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import PortalApiStatusBanner from "../../components/portal/PortalApiStatusBanner";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import {
  PortalAlert,
  PortalEntityTable,
  PortalPageIntro,
  PortalQuickStats,
  PortalStatusBadge,
} from "../../components/portal/PortalPrimitives";
import { portalButtonPrimary, portalButtonSecondary, portalCardStyle, portalInputStyle, portalTokens } from "../../portalDesignTokens";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import { fetchPortalMessages, sendPortalMessage } from "../../api/portalClient";
import { fetchWorkflowProjects } from "../../api/workflowClient";
import { fetchFieldTasks, createFieldTask } from "../../api/fieldOpsClient";
import { fetchFinancialWorkspace } from "../../api/financialClient";
import { routeStateOverlays } from "../../systemState";

const COMMS_OMNI_KEY = "fca_communications_omni_v1";
const COMMS_HASH_CHAIN_KEY = "fca_communications_hash_chain_v1";
const COMMS_ACTION_PACKETS_KEY = "fca_communications_action_packets_v1";

const languageCatalog = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "zh", label: "Chinese (Mandarin)" },
  { code: "vi", label: "Vietnamese" },
  { code: "tl", label: "Tagalog" },
  { code: "ko", label: "Korean" },
  { code: "ru", label: "Russian" },
  { code: "ar", label: "Arabic" },
  { code: "fr", label: "French" },
  { code: "pt", label: "Portuguese" },
];

const translations = {
  en: {
    transparencySubject: "Budget transparency update",
    transparencyBody: "We are sharing a proactive budget variance update and mitigation path to preserve schedule trust.",
    professionalismNudge: "Recommended professional revision",
    safetyPulse: "Safety communication spike detected",
  },
  es: {
    transparencySubject: "Actualizacion de transparencia presupuestaria",
    transparencyBody: "Compartimos una actualizacion proactiva de variacion presupuestaria y un plan de mitigacion para mantener la confianza del cronograma.",
    professionalismNudge: "Revision profesional recomendada",
    safetyPulse: "Aumento detectado en comunicaciones de seguridad",
  },
  zh: {
    transparencySubject: "Budget transparency update",
    transparencyBody: "We are sharing a proactive budget variance update and mitigation path to preserve schedule trust.",
    professionalismNudge: "Recommended professional revision",
    safetyPulse: "Safety communication spike detected",
  },
  vi: {
    transparencySubject: "Cap nhat minh bach ngan sach",
    transparencyBody: "Chung toi gui cap nhat chu dong ve chenh lech ngan sach va ke hoach giam thieu de giu vung do tin cay tien do.",
    professionalismNudge: "De xuat chinh sua chuyen nghiep",
    safetyPulse: "Phat hien gia tang giao tiep ve an toan",
  },
  tl: {
    transparencySubject: "Pag update sa transparency ng budget",
    transparencyBody: "Nagbabahagi kami ng proactive na update sa variance ng budget at mitigation plan upang mapanatili ang tiwala sa iskedyul.",
    professionalismNudge: "Inirerekomendang propesyonal na rebisyon",
    safetyPulse: "Natukoy ang pagtaas ng komunikasyon sa kaligtasan",
  },
  ko: {
    transparencySubject: "Budget transparency update",
    transparencyBody: "We are sharing a proactive budget variance update and mitigation path to preserve schedule trust.",
    professionalismNudge: "Recommended professional revision",
    safetyPulse: "Safety communication spike detected",
  },
  ru: {
    transparencySubject: "Obnovlenie prozrachnosti byudzheta",
    transparencyBody: "My proaktivno predostavlyaem obnovlenie otkloneniya byudzheta i plan snizheniya riskov dlya podderzhaniya doveriya k grafiku.",
    professionalismNudge: "Rekomendovannaya professionalnaya redakciya",
    safetyPulse: "Obnaruzhen vspлесk kommunikacii po bezopasnosti",
  },
  ar: {
    transparencySubject: "Budget transparency update",
    transparencyBody: "We are sharing a proactive budget variance update and mitigation path to preserve schedule trust.",
    professionalismNudge: "Recommended professional revision",
    safetyPulse: "Safety communication spike detected",
  },
  fr: {
    transparencySubject: "Mise a jour de transparence budgetaire",
    transparencyBody: "Nous partageons une mise a jour proactive des ecarts budgetaires et un plan d attenuation pour preserver la confiance dans le calendrier.",
    professionalismNudge: "Revision professionnelle recommandee",
    safetyPulse: "Pic de communication securite detecte",
  },
  pt: {
    transparencySubject: "Atualizacao de transparencia orcamentaria",
    transparencyBody: "Estamos compartilhando uma atualizacao proativa de variacao orcamentaria e plano de mitigacao para preservar a confianca no cronograma.",
    professionalismNudge: "Revisao profissional recomendada",
    safetyPulse: "Pico de comunicacao de seguranca detectado",
  },
};

const seededSignals = [
  {
    id: "SIG-001",
    channel: "sms",
    from: "Field Superintendent",
    subject: "Steel delivery delay",
    body: "Urgent. Rebar truck delayed 48h for PRJ-A117. Need resequence by tomorrow.",
    at: new Date().toISOString(),
  },
  {
    id: "SIG-002",
    channel: "linkedin",
    from: "Client Owner",
    subject: "Status follow-up",
    body: "Can we discuss variance signals on PRJ-A117 this afternoon?",
    at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "SIG-003",
    channel: "voice-memo",
    from: "Site Engineer",
    subject: "On-site transcript",
    body: "Voice memo: safety concern near crane lane on PRJ-B204. Need barricade update today.",
    at: new Date(Date.now() - 7200 * 1000).toISOString(),
  },
];

function readLocalJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best effort only
  }
}

function normalize(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9\s:-]/g, " ").replace(/\s+/g, " ").trim();
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatUsd(value) {
  return `$${Math.round(toNumber(value)).toLocaleString()}`;
}

function parsePriority(text) {
  const hay = normalize(text);
  if (/critical|urgent|asap|safety concern|incident/.test(hay)) return "Critical";
  if (/high|today|immediately|variance/.test(hay)) return "High";
  if (/soon|follow up|next/.test(hay)) return "Medium";
  return "Normal";
}

function inferBusinessObject(text) {
  const hay = normalize(text);
  if (/change order|co\b/.test(hay)) return { type: "ChangeOrder", route: "/portal/change-orders" };
  if (/rfi/.test(hay)) return { type: "Rfi", route: "/portal/rfis" };
  if (/budget|variance|cost|margin/.test(hay)) return { type: "Finance", route: "/portal/finance" };
  if (/safety|crew|material|delivery|field|schedule|task/.test(hay)) return { type: "FieldTask", route: "/portal/field-tasks" };
  return { type: "MessageThread", route: "/portal/messages" };
}

function parseDeadline(text) {
  const hay = normalize(text);
  const iso = String(text || "").match(/\b\d{4}-\d{2}-\d{2}\b/);
  if (iso) return iso[0];

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400000);
  if (/tomorrow/.test(hay)) return tomorrow.toISOString().slice(0, 10);
  if (/today/.test(hay)) return now.toISOString().slice(0, 10);

  const weekdayMap = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 0,
  };

  const hit = Object.entries(weekdayMap).find(([day]) => hay.includes(day));
  if (!hit) return "";

  const [_, target] = hit;
  const current = now.getDay();
  const delta = (target - current + 7) % 7 || 7;
  const result = new Date(now.getTime() + delta * 86400000);
  return result.toISOString().slice(0, 10);
}

function parseProjectId(text, projects = []) {
  const direct = String(text || "").match(/\bPRJ-[A-Z0-9-]+\b/i);
  if (direct) return direct[0].toUpperCase();

  const alt = String(text || "").match(/\b[A-Z]-\d{3}\b/);
  if (alt) return alt[0].toUpperCase();

  const hay = normalize(text);
  const found = projects.find((project) => {
    const id = normalize(project.id || "");
    const name = normalize(project.name || "");
    return (id && hay.includes(id)) || (name && hay.includes(name));
  });
  return found?.id || "";
}

function extractActionItem(text) {
  const raw = String(text || "").trim();
  if (!raw) return "Review communication and determine next action.";

  const clean = raw.replace(/voice memo[:\-]?/i, "").trim();
  const sentences = clean.split(/[.!?]/).map((row) => row.trim()).filter(Boolean);
  return sentences[0] || clean;
}

function professionalismReview(text) {
  const hay = normalize(text);
  const tooInformal = /(hey|yo|kinda|sorta|whatever|fyi only)/.test(hay);
  const behindSchedule = /(delay|late|variance|overrun|behind)/.test(hay);
  if (!tooInformal && !behindSchedule) return { needsRevision: false, revised: text };

  const revised = `Dear Stakeholder,\n\nWe are providing a formal status update regarding the current project condition. ${text}\n\nAuricrux has logged this communication with linked action owners and mitigation deadlines.\n\nRegards,\nFCA Project Team`;
  return { needsRevision: true, revised };
}

async function sha256Hex(input) {
  const value = String(input || "");
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const bytes = new TextEncoder().encode(value);
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export default function PortalCommunications() {
  const [language, setLanguage] = useState("en");
  const [rawInput, setRawInput] = useState("");
  const [selectedSignalId, setSelectedSignalId] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [humanInLoop, setHumanInLoop] = useState(true);
  const [pendingDraft, setPendingDraft] = useState({ subject: "", body: "" });

  const [omniSignals, setOmniSignals] = useState(() => readLocalJson(COMMS_OMNI_KEY, seededSignals));
  const [hashChain, setHashChain] = useState(() => readLocalJson(COMMS_HASH_CHAIN_KEY, []));
  const [actionPackets, setActionPackets] = useState(() => readLocalJson(COMMS_ACTION_PACKETS_KEY, []));

  const messagesLoad = usePortalApiLoad(() => fetchPortalMessages(), []);
  const projectsLoad = usePortalApiLoad(() => fetchWorkflowProjects(), []);
  const tasksLoad = usePortalApiLoad(() => fetchFieldTasks({}), []);
  const financeLoad = usePortalApiLoad(() => fetchFinancialWorkspace("dashboard"), []);

  const messages = messagesLoad.data?.items || messagesLoad.data?.drafts?.sent || [];
  const projects = projectsLoad.data?.items || [];
  const tasks = tasksLoad.data?.items || [];

  useEffect(() => {
    writeLocalJson(COMMS_OMNI_KEY, omniSignals);
  }, [omniSignals]);

  useEffect(() => {
    writeLocalJson(COMMS_HASH_CHAIN_KEY, hashChain);
  }, [hashChain]);

  useEffect(() => {
    writeLocalJson(COMMS_ACTION_PACKETS_KEY, actionPackets);
  }, [actionPackets]);

  useEffect(() => {
    if (!selectedSignalId && omniSignals.length) setSelectedSignalId(omniSignals[0].id);
  }, [omniSignals, selectedSignalId]);

  const unifiedRows = useMemo(() => {
    const apiRows = messages.map((item, index) => ({
      id: item.id || `MSG-${index + 1}`,
      channel: item.channel || "email",
      from: item.from || "Workspace",
      subject: item.subject || "Portal communication",
      body: item.message || item.preview || "",
      at: item.createdAt || item.updatedAt || new Date().toISOString(),
      source: "portal-messages",
    }));

    const localRows = omniSignals.map((item) => ({ ...item, source: "omnichannel" }));
    return [...localRows, ...apiRows]
      .sort((a, b) => Date.parse(b.at || "") - Date.parse(a.at || ""))
      .slice(0, 120);
  }, [messages, omniSignals]);

  const selectedSignal = unifiedRows.find((row) => row.id === selectedSignalId) || unifiedRows[0] || null;

  const semanticEnvelope = useMemo(() => {
    if (!selectedSignal) return null;
    const text = `${selectedSignal.subject || ""}. ${selectedSignal.body || ""}`;
    const businessObject = inferBusinessObject(text);
    return {
      actionItem: extractActionItem(text),
      priority: parsePriority(text),
      deadline: parseDeadline(text),
      projectId: parseProjectId(text, projects),
      businessObject,
    };
  }, [projects, selectedSignal]);

  const communicationPulse = useMemo(() => {
    const byProject = {};
    for (const row of unifiedRows) {
      const text = `${row.subject || ""} ${row.body || ""}`;
      const projectId = parseProjectId(text, projects) || "UNMAPPED";
      const safety = /safety|incident|near miss|hazard|osha/i.test(text);
      if (!byProject[projectId]) byProject[projectId] = { projectId, volume: 0, safetyVolume: 0 };
      byProject[projectId].volume += 1;
      if (safety) byProject[projectId].safetyVolume += 1;
    }

    return Object.values(byProject)
      .map((row) => ({
        ...row,
        attention: row.safetyVolume >= 3 || (row.safetyVolume > 0 && row.volume >= 6) ? "High-Attention" : row.volume >= 4 ? "Watch" : "Normal",
      }))
      .sort((a, b) => b.safetyVolume - a.safetyVolume || b.volume - a.volume)
      .slice(0, 10);
  }, [projects, unifiedRows]);

  const topAttention = communicationPulse.find((row) => row.attention === "High-Attention");

  const financeSignals = useMemo(() => {
    const dashboard = financeLoad.data?.dashboard || {};
    const forecastMargin = toNumber(dashboard.forecastMarginPct || dashboard.grossMarginPct || 0);
    const targetMargin = toNumber(dashboard.marginTargetPct || dashboard.targetMarginPct || 12);
    const variancePct = targetMargin - forecastMargin;
    return {
      forecastMargin,
      targetMargin,
      variancePct,
      varianceHigh: variancePct >= 3,
    };
  }, [financeLoad.data]);

  const localized = translations[language] || translations.en;

  async function appendImmutableRecord(record) {
    const previous = hashChain[hashChain.length - 1];
    const previousHash = previous?.chainHash || "GENESIS";
    const chainHash = await sha256Hex(`${previousHash}|${JSON.stringify(record)}`);

    const row = {
      id: `hash-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      previousHash,
      chainHash,
      record,
    };

    setHashChain((current) => [...current, row].slice(-1000));
  }

  async function ingestRawSignal() {
    if (!rawInput.trim()) return;
    const signal = {
      id: `SIG-${Date.now()}`,
      channel: "voice-memo",
      from: "Omni Ingest",
      subject: "Normalized inbound signal",
      body: rawInput.trim(),
      at: new Date().toISOString(),
    };

    setOmniSignals((current) => [signal, ...current].slice(0, 200));
    setSelectedSignalId(signal.id);
    setRawInput("");

    await appendImmutableRecord({
      event: "signal-ingested",
      channel: signal.channel,
      body: signal.body,
      sourceRoute: "/portal/communications",
    });

    setNotice("Signal ingested into the omnichannel neural pipeline.");
  }

  async function createActionFromSemantic() {
    if (!semanticEnvelope) return;

    setBusy(true);
    try {
      const packet = {
        id: `ACT-${Date.now()}`,
        createdAt: new Date().toISOString(),
        fromSignalId: selectedSignal?.id || "",
        ...semanticEnvelope,
        status: "queued",
      };

      if (semanticEnvelope.businessObject.type === "FieldTask") {
        const targetProjectId = semanticEnvelope.projectId || projects[0]?.id || "";
        if (targetProjectId) {
          await createFieldTask({
            projectId: targetProjectId,
            task: semanticEnvelope.actionItem,
            priority: semanticEnvelope.priority,
            dueDate: semanticEnvelope.deadline || "",
            sourceRoute: "/portal/communications",
            notes: "Created by Auricrux semantic normalization.",
          });
          packet.status = "published";
          packet.publishedTo = "/portal/field-tasks";
        }
      }

      setActionPackets((current) => [packet, ...current].slice(0, 500));

      await appendImmutableRecord({
        event: "semantic-normalization",
        actionItem: packet.actionItem,
        priority: packet.priority,
        deadline: packet.deadline,
        projectId: packet.projectId,
        businessObject: packet.businessObject,
        status: packet.status,
      });

      setNotice(packet.status === "published" ? "Semantic action published to Field Tasks." : "Semantic action packet generated and queued.");
    } catch (error) {
      setNotice(error?.message || "Unable to publish semantic action.");
    } finally {
      setBusy(false);
    }
  }

  function buildProxyDraft() {
    if (!selectedSignal) return;
    const projectId = semanticEnvelope?.projectId || "project";
    const subject = `RFI/Issue response for ${projectId}`;
    const body = `Thank you for the update. Auricrux reviewed the latest workflow state and prepared the next action path for ${projectId}. We have assigned owners, verified dependencies, and set response timing to prevent schedule slippage.`;
    const tone = professionalismReview(body);
    setPendingDraft({ subject, body: tone.revised });
    setNotice("Autonomous proxy draft generated with professionalism review.");
  }

  async function sendProxyDraft() {
    if (!pendingDraft.subject.trim() || !pendingDraft.body.trim()) return;
    if (humanInLoop) {
      setNotice("Human-in-the-loop is enabled. Review and approve to send.");
      return;
    }

    setBusy(true);
    try {
      await sendPortalMessage({
        subject: pendingDraft.subject,
        message: pendingDraft.body,
        channel: "email",
        sourceRoute: "/portal/communications",
      });

      await appendImmutableRecord({
        event: "autonomous-proxy-send",
        subject: pendingDraft.subject,
        channel: "email",
      });

      setNotice("Autonomous proxy response sent.");
      messagesLoad.reload();
    } catch (error) {
      setNotice(error?.message || "Unable to send autonomous proxy message.");
    } finally {
      setBusy(false);
    }
  }

  async function sendTransparencyConversation() {
    if (!financeSignals.varianceHigh) {
      setNotice("No major variance detected; transparency conversation not required.");
      return;
    }

    setBusy(true);
    try {
      const subject = localized.transparencySubject;
      const message = `${localized.transparencyBody} Current forecast margin is ${financeSignals.forecastMargin.toFixed(1)}% versus target ${financeSignals.targetMargin.toFixed(1)}%. Variance: ${financeSignals.variancePct.toFixed(1)} points.`;

      await sendPortalMessage({
        subject,
        message,
        channel: "email",
        sourceRoute: "/portal/communications",
      });

      await appendImmutableRecord({
        event: "transparency-conversation",
        subject,
        variancePct: financeSignals.variancePct,
      });

      setNotice("Proactive transparency communication sent.");
      messagesLoad.reload();
    } catch (error) {
      setNotice(error?.message || "Unable to send transparency communication.");
    } finally {
      setBusy(false);
    }
  }

  const professionalismDraftReview = useMemo(() => professionalismReview(pendingDraft.body || ""), [pendingDraft.body]);
  const topAttentionRecommendation = topAttention
    ? `${localized.safetyPulse}: ${topAttention.projectId} (${topAttention.safetyVolume} safety-tagged interactions).`
    : "No high-attention safety pulse detected.";
  const interpreterRecommendations = [
    `${languageCatalog.length} supported languages are active for multilingual communication coverage in US construction environments.`,
    topAttentionRecommendation,
    `Immutable chain entries recorded: ${hashChain.length}.`,
  ];

  return (
    <PortalShell
      title="Auricrux Communications"
      subtitle="Omnichannel neural network for orchestrating, interpreting, influencing, and immutably recording project communications."
      activeHref="/portal/communications"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.communications || routeStateOverlays.messages}
      primaryHref="/portal/audit"
      primaryLabel="Open audit ledger"
      showRouteOverlay={false}
    >
      <AuricruxInsightPanel
        title="Auricrux Universal Interpreter"
        targetObjectId={selectedSignal?.id || "COMMS"}
        sourceRoute="/portal/communications"
        rationale="Normalize unstructured signals into deterministic action packets and preserve legally defensible communication history."
        nextAction={semanticEnvelope
          ? `Action: ${semanticEnvelope.actionItem} | Priority: ${semanticEnvelope.priority}${semanticEnvelope.deadline ? ` | Deadline: ${semanticEnvelope.deadline}` : ""}`
          : "Select a signal to normalize into operational action."}
        recommendations={interpreterRecommendations}
        tone="blue"
        liveRecommend
      />

      <PortalPageIntro
        eyebrow="Voice and Ears"
        title="From messaging app to omnichannel neural network"
        detail="Auricrux aggregates signals, semantically normalizes intent, creates actionable records, and drives influence-oriented nudges to resolve issues faster across supply-chain stakeholders."
        actions={(
          <>
            <button type="button" style={{ ...portalButtonPrimary, border: "none", cursor: "pointer" }} onClick={createActionFromSemantic} disabled={busy || !semanticEnvelope}>Normalize To Action</button>
            <button type="button" style={portalButtonSecondary} onClick={sendTransparencyConversation} disabled={busy}>Send Transparency Conversation</button>
          </>
        )}
      />

      <PortalApiStatusBanner status={messagesLoad.status} error={messagesLoad.error} onRetry={messagesLoad.reload} label="messages" />
      <PortalApiStatusBanner status={projectsLoad.status} error={projectsLoad.error} onRetry={projectsLoad.reload} label="projects" />
      {notice ? <PortalAlert tone={notice.includes("Unable") ? "warning" : "success"}>{notice}</PortalAlert> : null}

      <PortalQuickStats
        items={[
          { label: "Unified Signals", value: unifiedRows.length, hint: "Email, SMS, IM, voice, and social" },
          { label: "Action Packets", value: actionPackets.length, hint: "Semantic normalization outputs" },
          { label: "Immutable Records", value: hashChain.length, hint: "Crypto-hash audit chain" },
          { label: "Open Field Tasks", value: tasks.filter((row) => !/complete|done|closed/i.test(String(row.status || ""))).length, hint: "Execution context" },
        ]}
      />

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Multilingual Output</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          {languageCatalog.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              style={{
                ...portalButtonSecondary,
                border: language === lang.code ? `1px solid ${portalTokens.primary}` : "1px solid #cbd5e1",
                background: language === lang.code ? "#eff6ff" : "#fff",
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Omnichannel Aggregation</div>
        <label style={{ display: "grid", gap: 6, marginTop: 8 }}>
          <span style={{ fontWeight: 700 }}>Ingest unstructured signal (voice memo, SMS, social DM, email snippet)</span>
          <textarea
            value={rawInput}
            onChange={(event) => setRawInput(event.target.value)}
            style={{ ...portalInputStyle, minHeight: 90 }}
            placeholder="Example: Urgent safety issue near PRJ-A117 crane lane. Need barricade update by Friday and notify PM."
          />
        </label>
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" style={portalButtonPrimary} onClick={ingestRawSignal}>Ingest Signal</button>
          <a href="/portal/messages" style={{ ...portalButtonSecondary, textDecoration: "none" }}>Open Messages</a>
        </div>

        <PortalEntityTable
          columns={[
            { key: "channel", label: "Channel", render: (row) => <PortalStatusBadge status={String(row.channel || "").toUpperCase()} active={row.source === "omnichannel"} /> },
            { key: "from", label: "From" },
            { key: "subject", label: "Subject" },
            { key: "source", label: "Source" },
            {
              key: "action",
              label: "",
              render: (row) => <button type="button" style={portalButtonSecondary} onClick={() => setSelectedSignalId(row.id)}>{row.id === selectedSignal?.id ? "Selected" : "Inspect"}</button>,
            },
          ]}
          rows={unifiedRows.slice(0, 20)}
          emptyTitle="No communication signals"
          emptyDetail="Signals appear as channels are ingested and message APIs sync."
          emptyPrimaryHref="/portal/messages"
          emptyPrimaryLabel="Open Messages"
        />
      </div>

      {semanticEnvelope ? (
        <div style={{ ...portalCardStyle, marginBottom: 16 }}>
          <div style={portalEyebrowStyle}>Semantic Normalization</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 8 }}>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
              <div style={{ fontSize: 12, color: portalTokens.muted }}>Action Item</div>
              <strong>{semanticEnvelope.actionItem}</strong>
            </div>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
              <div style={{ fontSize: 12, color: portalTokens.muted }}>Priority</div>
              <PortalStatusBadge status={semanticEnvelope.priority} active={semanticEnvelope.priority === "Critical" || semanticEnvelope.priority === "High"} />
            </div>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
              <div style={{ fontSize: 12, color: portalTokens.muted }}>Deadline</div>
              <strong>{semanticEnvelope.deadline || "Not detected"}</strong>
            </div>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
              <div style={{ fontSize: 12, color: portalTokens.muted }}>Project ID</div>
              <strong>{semanticEnvelope.projectId || "Unmapped"}</strong>
            </div>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
              <div style={{ fontSize: 12, color: portalTokens.muted }}>Business Object</div>
              <strong>{semanticEnvelope.businessObject.type}</strong>
              <div style={{ marginTop: 6 }}><a href={semanticEnvelope.businessObject.route} style={{ color: portalTokens.primary, fontWeight: 700 }}>Open linked module</a></div>
            </div>
          </div>
        </div>
      ) : null}

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Autonomous Communicator</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Autonomous Proxying</div>
            <button type="button" style={portalButtonSecondary} onClick={buildProxyDraft}>Generate Proxy Draft</button>
          </div>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Human In The Loop</div>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={humanInLoop} onChange={(event) => setHumanInLoop(event.target.checked)} />
              Require human approval before autonomous send
            </label>
          </div>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Influence Nudge</div>
            <div style={{ color: portalTokens.body }}>{localized.professionalismNudge}: Auricrux revises high-risk informal tone before client delivery.</div>
          </div>
        </div>

        <label style={{ display: "grid", gap: 6, marginTop: 10 }}>
          <span style={{ fontWeight: 700 }}>Subject</span>
          <input value={pendingDraft.subject} onChange={(event) => setPendingDraft((current) => ({ ...current, subject: event.target.value }))} style={portalInputStyle} />
        </label>
        <label style={{ display: "grid", gap: 6, marginTop: 10 }}>
          <span style={{ fontWeight: 700 }}>Body</span>
          <textarea value={pendingDraft.body} onChange={(event) => setPendingDraft((current) => ({ ...current, body: event.target.value }))} style={{ ...portalInputStyle, minHeight: 110 }} />
        </label>

        {professionalismDraftReview.needsRevision ? (
          <PortalAlert tone="warning" title="Contextual sentiment awareness">
            The draft tone may be misaligned for current project pressure. Auricrux recommends a high-professionalism revision.
          </PortalAlert>
        ) : null}

        <div style={{ marginTop: 10 }}>
          <button type="button" style={portalButtonPrimary} onClick={sendProxyDraft} disabled={busy}>Send Proxy Draft</button>
        </div>
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Communication-as-Record</div>
        <PortalEntityTable
          columns={[
            { key: "timestamp", label: "Timestamp" },
            { key: "previousHash", label: "Prev Hash", render: (row) => String(row.previousHash).slice(0, 12) },
            { key: "chainHash", label: "Hash", render: (row) => String(row.chainHash).slice(0, 16) },
            { key: "event", label: "Event", render: (row) => row.record?.event || "interaction" },
          ]}
          rows={hashChain.slice(-20).reverse()}
          emptyTitle="No immutable records"
          emptyDetail="Hash-linked records are written whenever signals, normalizations, or autonomous sends occur."
          emptyPrimaryHref="/portal/audit"
          emptyPrimaryLabel="Open Audit"
        />
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Global Presence and Intent Mapping</div>
        <PortalEntityTable
          columns={[
            { key: "projectId", label: "Project" },
            { key: "volume", label: "Comms Volume" },
            { key: "safetyVolume", label: "Safety Volume" },
            { key: "attention", label: "Risk Pulse", render: (row) => <PortalStatusBadge status={row.attention} active={row.attention === "High-Attention"} /> },
          ]}
          rows={communicationPulse}
          emptyTitle="No pulse data"
          emptyDetail="Intent mapping appears when project-linked communication accumulates."
          emptyPrimaryHref="/portal/projects"
          emptyPrimaryLabel="Open Projects"
        />
      </div>

      <div style={{ ...portalCardStyle }}>
        <div style={portalEyebrowStyle}>System Of Influence Layer</div>
        <div style={{ color: portalTokens.body, lineHeight: 1.6 }}>
          This module acts as both system-of-record and system-of-influence. It not only stores verified interaction history, but also nudges stakeholders toward high-probability resolution language, faster issue closure, and proactive transparency.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10, marginTop: 10 }}>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
            <div style={{ fontSize: 12, color: portalTokens.muted }}>Forecast Margin</div>
            <strong>{financeSignals.forecastMargin.toFixed(1)}%</strong>
          </div>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
            <div style={{ fontSize: 12, color: portalTokens.muted }}>Target Margin</div>
            <strong>{financeSignals.targetMargin.toFixed(1)}%</strong>
          </div>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
            <div style={{ fontSize: 12, color: portalTokens.muted }}>Variance</div>
            <strong>{financeSignals.variancePct.toFixed(1)} pts</strong>
          </div>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
            <div style={{ fontSize: 12, color: portalTokens.muted }}>Risk</div>
            <PortalStatusBadge status={financeSignals.varianceHigh ? "Bridge Conversation Required" : "Within Guardrail"} active={financeSignals.varianceHigh} />
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
