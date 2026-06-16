import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import ProductAccessStatusPanel from "../../components/ProductAccessStatusPanel";
import CustomerPlanSummaryPanel from "../../components/CustomerPlanSummaryPanel";
import { routeStateOverlays } from "../../systemState";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useCustomerSession from "../../hooks/useCustomerSession";
import { createPermitEscalationTool, stageEstimateRevisionTool, stageMobilizationInvoiceTool, queueProposalFollowupTool } from "../../customerCommandTools";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const TASK_STORAGE_KEY = "fca_customer_task_board_v1";
const BRAND_STORAGE_KEY = "fca_customer_brand_skin_v1";

const defaultTasks = [
  {
    id: "task-intake-review",
    title: "Review new opportunity intake",
    lane: "today",
    owner: "Sales Coordinator",
    due: "Today",
    detail: "Confirm scope notes, budget signal, and jurisdiction before qualification.",
    done: false,
  },
  {
    id: "task-estimate-start",
    title: "Open estimate worksheet",
    lane: "this-week",
    owner: "Estimator",
    due: "This week",
    detail: "Build the first estimate line set and stage proposal output for review.",
    done: false,
  },
  {
    id: "task-customer-followup",
    title: "Send customer next-step summary",
    lane: "customer",
    owner: "Auricrux",
    due: "After review",
    detail: "Deliver branded follow-up with tasks, files requested, and next meeting target.",
    done: false,
  },
];

const defaultBrandSkin = {
  companyName: "Customer Workspace",
  accent: "#1d4ed8",
  surface: "#eff6ff",
  welcomeMessage: "Welcome back. Your workspace is carrying sales, files, tasks, and training continuity forward.",
};

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

export default function PortalHome() {
  const { state, refreshSyncStamp } = useWorkspaceState();
  const { session } = useCustomerSession();
  const [tasks, setTasks] = useState(() => readLocalJson(TASK_STORAGE_KEY, defaultTasks));
  const [brandSkin, setBrandSkin] = useState(() => readLocalJson(BRAND_STORAGE_KEY, defaultBrandSkin));
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const companyName = session?.company || state?.tenant?.name || brandSkin.companyName;

  useEffect(() => {
    refreshSyncStamp("Customer workspace task board active");
  }, [refreshSyncStamp]);

  useEffect(() => {
    writeLocalJson(TASK_STORAGE_KEY, tasks);
  }, [tasks]);

  useEffect(() => {
    writeLocalJson(BRAND_STORAGE_KEY, brandSkin);
  }, [brandSkin]);

  const lanes = useMemo(() => ([
    { key: "today", title: "Today" },
    { key: "this-week", title: "This week" },
    { key: "customer", title: "Customer follow-up" },
  ]), []);

  const routeCards = [
    { title: "Qualification", detail: "Advance opportunities and route work into estimate launch.", href: "/portal/bids", label: "Open Qualification" },
    { title: "Estimates", detail: "Move pricing, scope notes, and proposal packaging forward.", href: "/portal/estimates", label: "Open Estimates" },
    { title: "Projects", detail: "Control stage movement, milestones, and delivery posture.", href: "/portal/projects", label: "Open Projects" },
    { title: "Files", detail: "Keep evidence, permit packets, and customer documents attached to the right context.", href: "/portal/files", label: "Open Files" },
    { title: "Billing", detail: "Stage invoices and preserve revenue continuity.", href: "/portal/billing", label: "Open Billing" },
    { title: "Academy", detail: "Train teams through apprenticeship, certification, degree, licensure, and how-to tracks.", href: "/academy/catalog", label: "Open Academy Catalog" },
  ];

  function toggleTask(taskId) {
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, done: !task.done } : task));
  }

  function addTask() {
    const title = newTaskTitle.trim();
    if (!title) return;
    setTasks((current) => current.concat({
      id: `task-${Date.now()}`,
      title,
      lane: "today",
      owner: session?.role || "Workspace Owner",
      due: "New",
      detail: "Customer-created task inside the branded portal.",
      done: false,
    }));
    setNewTaskTitle("");
  }

  function runPermitEscalationTool() {
    createPermitEscalationTool({ companyName, projectId: state?.project?.id || "PRJ-A117" });
    refreshSyncStamp("Permit escalation support tool executed from command center");
  }

  function runMobilizationInvoiceTool() {
    stageMobilizationInvoiceTool({ companyName, projectId: state?.project?.id || "PRJ-A117" });
    refreshSyncStamp("Mobilization invoice tool executed from command center");
  }

  function runEstimateRevisionTool() {
    stageEstimateRevisionTool({ companyName, projectId: state?.project?.id || "PRJ-A117", estimateId: "EST-1001" });
    refreshSyncStamp("Estimate revision tool executed from command center");
  }

  function runProposalFollowupTool() {
    queueProposalFollowupTool({ companyName, proposalId: "PRO-1001", contact: session?.email || "owner@customer.com" });
    refreshSyncStamp("Proposal follow-up tool executed from command center");
  }

  return (
    <PortalShell
      title={`${companyName} Command Center`}
      subtitle="A branded contractor workspace for real opportunities, estimate preparation, customer commitments, tasks, and training continuity."
      activeHref="/portal"
      currentJourney="lead"
      routeOverlay={routeStateOverlays.overview}
      primaryHref="/portal/bids"
      primaryLabel="Open Qualification Workflow"
    >
      <ProductAccessStatusPanel session={session} />
      <div style={{ marginBottom: 24 }}>
        <CustomerPlanSummaryPanel session={session} title="Commercial package and enabled product scope" />
      </div>

      <div style={{ ...cardStyle, marginBottom: 24, background: brandSkin.surface, borderColor: brandSkin.accent }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ color: brandSkin.accent, fontWeight: 700, marginBottom: 8 }}>Customer-branded workspace</div>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>{companyName}</h2>
            <p style={{ color: "#334155", lineHeight: 1.7, margin: 0 }}>{brandSkin.welcomeMessage}</p>
          </div>
          <div style={{ minWidth: 280, display: "grid", gap: 10 }}>
            <input value={brandSkin.companyName} onChange={(event) => setBrandSkin((current) => ({ ...current, companyName: event.target.value || companyName }))} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #cbd5e1" }} placeholder="Workspace brand name" />
            <input value={brandSkin.welcomeMessage} onChange={(event) => setBrandSkin((current) => ({ ...current, welcomeMessage: event.target.value }))} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #cbd5e1" }} placeholder="Welcome message" />
            <input value={brandSkin.accent} onChange={(event) => setBrandSkin((current) => ({ ...current, accent: event.target.value }))} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #cbd5e1" }} placeholder="#1d4ed8" />
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Route dispatcher for real product slices</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {routeCards.map((card) => (
            <div key={card.title} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, background: "#f8fafc" }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{card.title}</div>
              <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>{card.detail}</div>
              <a href={card.href} style={{ color: brandSkin.accent, fontWeight: 700, textDecoration: "none" }}>{card.label}</a>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Functional product: Customer task board</h2>
          <p style={{ color: "#475569", lineHeight: 1.7 }}>
            This is a real customer-usable product surface. Tasks can be created, completed, and carried inside the branded workspace while Auricrux keeps the sales-to-operations flow visible.
          </p>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <input value={newTaskTitle} onChange={(event) => setNewTaskTitle(event.target.value)} placeholder="Add a customer task" style={{ flex: 1, padding: "12px 14px", borderRadius: 12, border: "1px solid #cbd5e1" }} />
            <button onClick={addTask} style={{ padding: "12px 16px", borderRadius: 12, border: "none", background: brandSkin.accent, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Add Task</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {lanes.map((lane) => (
              <div key={lane.key} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 14 }}>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>{lane.title}</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {tasks.filter((task) => task.lane === lane.key).map((task) => (
                    <label key={task.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: task.done ? "#f0fdf4" : "#fff", cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 6 }}>
                        <strong>{task.title}</strong>
                        <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} />
                      </div>
                      <div style={{ color: "#475569", lineHeight: 1.6 }}>{task.detail}</div>
                      <div style={{ color: "#64748b", marginTop: 6, fontSize: 13 }}>{task.owner} · {task.due}</div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Functional SaaS tools in live command center</h2>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#eff6ff" }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Tool 1 · Create permit escalation support request</div>
                <div style={{ color: "#334155", lineHeight: 1.7, marginBottom: 10 }}>Creates a real support ticket in Support Command and routes you into the support board.</div>
                <button type="button" onClick={runPermitEscalationTool} style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: brandSkin.accent, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Run Support Tool</button>
              </div>
              <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#eff6ff" }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Tool 2 · Stage mobilization invoice</div>
                <div style={{ color: "#334155", lineHeight: 1.7, marginBottom: 10 }}>Creates a real draft invoice in Billing Command and routes you into the billing board.</div>
                <button type="button" onClick={runMobilizationInvoiceTool} style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: brandSkin.accent, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Run Billing Tool</button>
              </div>
              <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#eff6ff" }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Tool 3 · Queue estimate revision package</div>
                <div style={{ color: "#334155", lineHeight: 1.7, marginBottom: 10 }}>Creates a real estimate-revision work item and routes the customer into the estimate studio.</div>
                <button type="button" onClick={runEstimateRevisionTool} style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: brandSkin.accent, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Run Estimate Tool</button>
              </div>
              <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#eff6ff" }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Tool 4 · Queue proposal follow-up</div>
                <div style={{ color: "#334155", lineHeight: 1.7, marginBottom: 10 }}>Creates a real proposal follow-up work item and routes the customer into proposal packaging.</div>
                <button type="button" onClick={runProposalFollowupTool} style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: brandSkin.accent, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Run Proposal Tool</button>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Auricrux confirmed</h2>
            <ul style={{ paddingLeft: 20, lineHeight: 1.8, color: "#334155" }}>
              <li>Explains the current opportunity and delivery posture</li>
              <li>Recommends the next qualification, estimate, proposal, and customer actions</li>
              <li>Executes task creation, support escalation, billing staging, estimate revision staging, proposal follow-up staging, and workspace branding continuity</li>
              <li>Stays present across SaaS and Academy surfaces</li>
            </ul>
            <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#eff6ff" }}>
              <div style={{ color: brandSkin.accent, fontWeight: 700, marginBottom: 6 }}>Auricrux next action</div>
              <div style={{ color: "#334155", lineHeight: 1.7 }}>Complete intake review, open the qualification workflow, create the first estimate revision package, and queue the proposal follow-up before sending the branded customer update.</div>
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
