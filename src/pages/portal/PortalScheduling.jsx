import { createOperationalPortalPage } from "../../components/OperationalToolPage.jsx";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import {
  completeFieldScheduleEvent,
  createFieldScheduleEvent,
  fetchFieldSchedule,
} from "../../api/fieldOpsClient";
import { routeStateOverlays } from "../../systemState";

export default createOperationalPortalPage({
  title: "Scheduling",
  subtitle: "Schedule crew mobilization, inspections, customer walkthroughs, and milestone meetings.",
  activeHref: "/portal/scheduling",
  storageKey: "fca_portal_scheduling_v1",
  itemLabel: "Scheduled event",
  journey: "job",
  routeOverlay: routeStateOverlays.projects,
  primaryHref: "/portal/field-tasks",
  primaryLabel: "Open field tasks",
  seedItems: [],
  fields: [
    { key: "title", label: "Event title", required: true, placeholder: "Inspection / mobilization / meeting" },
    { key: "date", label: "Date", required: true, placeholder: "YYYY-MM-DD" },
    { key: "crew", label: "Crew or owner", placeholder: "Assigned team" },
    { key: "project", label: "Project", placeholder: "Job name or ID" },
    { key: "estimatedCost", label: "Estimated cost", placeholder: "750" },
  ],
  apiHandlers: {
    fetchItems: fetchFieldSchedule,
    createItem: createFieldScheduleEvent,
    completeItem: completeFieldScheduleEvent,
  },
  projectScoped: true,
  renderBeforeContent({ selectedProjectId }) {
    const fieldHref = selectedProjectId
      ? `/portal/field-tasks?projectId=${encodeURIComponent(selectedProjectId)}`
      : "/portal/field-tasks";

    return (
      <AuricruxInsightPanel
        title="Auricrux Scheduling Intelligence"
        targetObjectId={selectedProjectId || "workspace"}
        sourceRoute="/portal/scheduling"
        rationale="Mobilization, inspections, and walkthroughs should stay tied to active field tasks and project milestones."
        nextAction="Confirm crew availability before locking inspection or turnover dates."
        actionHref={fieldHref}
        actionLabel="Open field tasks"
        tone="blue"
        liveRecommend={Boolean(selectedProjectId)}
      />
    );
  },
});
