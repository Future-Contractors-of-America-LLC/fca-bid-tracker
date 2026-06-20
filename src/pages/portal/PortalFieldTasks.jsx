import { createOperationalPortalPage } from "../../components/OperationalToolPage.jsx";
import {
  completeFieldTask,
  createFieldTask,
  fetchFieldTasks,
} from "../../api/fieldOpsClient";

export default createOperationalPortalPage({
  title: "Field Tasks",
  subtitle: "Assign, track, and close daily field tasks tied to active jobs.",
  activeHref: "/portal/field-tasks",
  storageKey: "fca_portal_field_tasks_v1",
  itemLabel: "Field task",
  journey: "lead",
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
});
