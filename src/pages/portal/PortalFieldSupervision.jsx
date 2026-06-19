import { createOperationalPortalPage } from "../../components/OperationalToolPage.jsx";
import {
  completeFieldTask,
  createFieldTask,
  fetchFieldTasks,
} from "../../api/fieldOpsClient";

export default createOperationalPortalPage({
  title: "Field Supervision",
  subtitle: "Superintendent checklists, safety observations, and daily production reviews.",
  activeHref: "/portal/field-supervision",
  storageKey: "fca_portal_field_supervision_v1",
  itemLabel: "Supervision log",
  journey: "lead",
  seedItems: [],
  fields: [
    { key: "site", label: "Job site", required: true, placeholder: "Site name" },
    { key: "supervisor", label: "Supervisor", required: true, placeholder: "Name" },
    { key: "focus", label: "Focus area", placeholder: "Safety, quality, schedule" },
    { key: "shift", label: "Shift", type: "select", options: ["Day", "Night", "Weekend"], default: "Day" },
  ],
  projectScoped: true,
  apiHandlers: {
    fetchItems: async (params = {}) => {
      const payload = await fetchFieldTasks(params);
      return {
        ...payload,
        items: (payload.items || []).map((item) => ({
          ...item,
          site: item.projectId || params.projectId || "",
          supervisor: item.assignee,
          focus: item.task,
          shift: item.priority || "Day",
        })),
      };
    },
    createItem: (draft) => createFieldTask({
      task: `${draft.focus || "Supervision review"} - ${draft.site}`,
      assignee: draft.supervisor,
      dueDate: "",
      priority: draft.shift || "Normal",
      projectId: draft.projectId,
    }),
    completeItem: completeFieldTask,
  },
});
