import { createOperationalPortalPage } from "../../components/OperationalToolPage.jsx";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import {
  completeFieldTask,
  createFieldTask,
  fetchFieldTasks,
} from "../../api/fieldOpsClient";
import { routeStateOverlays } from "../../systemState";

const card = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff" };
const linkBtn = {
  display: "inline-block",
  border: "1px solid #2563eb",
  background: "#eff6ff",
  color: "#1d4ed8",
  borderRadius: 8,
  padding: "10px 14px",
  fontWeight: 700,
  textDecoration: "none",
};

export default createOperationalPortalPage({
  title: "Field Tasks",
  subtitle: "Assign, track, and close daily field tasks tied to active jobs.",
  activeHref: "/portal/field-tasks",
  storageKey: "fca_portal_field_tasks_v1",
  itemLabel: "Field task",
  journey: "project",
  routeOverlay: routeStateOverlays.projects,
  primaryHref: "/portal/projects",
  primaryLabel: "Back to projects",
  seedItems: [],
  fields: [
    { key: "task", label: "Task description", required: true, placeholder: "What needs to happen in the field?" },
    { key: "assignee", label: "Assignee", required: true, placeholder: "Crew member or lead" },
    { key: "dueDate", label: "Due date", placeholder: "YYYY-MM-DD" },
    { key: "priority", label: "Priority", type: "select", options: ["Normal", "High", "Urgent"], default: "Normal" },
    { key: "estimatedCost", label: "Estimated cost", placeholder: "500 or $500" },
  ],
  apiHandlers: {
    fetchItems: fetchFieldTasks,
    createItem: createFieldTask,
    completeItem: completeFieldTask,
  },
  projectScoped: true,
  renderBeforeContent({ selectedProjectId }) {
    const supervisionHref = selectedProjectId
      ? `/portal/field-supervision?projectId=${encodeURIComponent(selectedProjectId)}`
      : "/portal/field-supervision";

    return (
      <>
        <AuricruxInsightPanel
          title="Auricrux Field Tasks"
          targetObjectId={selectedProjectId || "field-tasks"}
          sourceRoute="/portal/field-tasks"
          rationale="Close daily field tasks with photo evidence, plan compare, and redline continuity."
          nextAction="Attach site photos from Field Supervision when documenting task completion or discrepancies."
          actionHref={supervisionHref}
          actionLabel="Open Field Supervision"
          tone="amber"
          liveRecommend
        />
        <div style={{ ...card, marginBottom: 18, borderLeft: "4px solid #2563eb" }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Document field conditions</div>
          <p style={{ margin: "0 0 12px", color: "#475569", lineHeight: 1.6 }}>
            Workers and supervisors can capture photos, add notes and annotations, compare to governing plans,
            and auto-generate redlines from Field Supervision.
          </p>
          <a href={supervisionHref} style={linkBtn}>Open Field Supervision →</a>
        </div>
      </>
    );
  },
});
