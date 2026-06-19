import { createOperationalPortalPage } from "../../components/OperationalToolPage.jsx";

export default createOperationalPortalPage({
  title: "Field Tasks",
  subtitle: "Assign, track, and close daily field tasks tied to active jobs.",
  activeHref: "/portal/field-tasks",
  storageKey: "fca_portal_field_tasks_v1",
  itemLabel: "Field task",
  journey: "lead",
  seedItems: [
    { id: "ft-1", task: "Rough-in inspection prep", assignee: "Crew lead", dueDate: "2026-06-20", priority: "High", status: "Open" },
  ],
  fields: [
    { key: "task", label: "Task description", required: true, placeholder: "What needs to happen in the field?" },
    { key: "assignee", label: "Assignee", required: true, placeholder: "Crew member or lead" },
    { key: "dueDate", label: "Due date", placeholder: "YYYY-MM-DD" },
    { key: "priority", label: "Priority", type: "select", options: ["Normal", "High", "Urgent"], default: "Normal" },
  ],
});
