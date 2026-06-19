import { createOperationalPortalPage } from "../../components/OperationalToolPage.jsx";

export default createOperationalPortalPage({
  title: "Scheduling",
  subtitle: "Schedule crew mobilization, inspections, customer walkthroughs, and milestone meetings.",
  activeHref: "/portal/scheduling",
  storageKey: "fca_portal_scheduling_v1",
  itemLabel: "Scheduled event",
  journey: "lead",
  seedItems: [
    { id: "sch-1", title: "Site mobilization walkthrough", date: "2026-06-22", crew: "Field crew A", project: "Active job", status: "Open" },
  ],
  fields: [
    { key: "title", label: "Event title", required: true, placeholder: "Inspection / mobilization / meeting" },
    { key: "date", label: "Date", required: true, placeholder: "YYYY-MM-DD" },
    { key: "crew", label: "Crew or owner", placeholder: "Assigned team" },
    { key: "project", label: "Project", placeholder: "Job name or ID" },
  ],
});
