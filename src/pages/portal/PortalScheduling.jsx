import { createOperationalPortalPage } from "../../components/OperationalToolPage.jsx";
import {
  completeFieldScheduleEvent,
  createFieldScheduleEvent,
  fetchFieldSchedule,
} from "../../api/fieldOpsClient";

export default createOperationalPortalPage({
  title: "Scheduling",
  subtitle: "Schedule crew mobilization, inspections, customer walkthroughs, and milestone meetings.",
  activeHref: "/portal/scheduling",
  storageKey: "fca_portal_scheduling_v1",
  itemLabel: "Scheduled event",
  journey: "lead",
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
});
