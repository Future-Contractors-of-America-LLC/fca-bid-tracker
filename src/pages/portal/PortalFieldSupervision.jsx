import { createOperationalPortalPage } from "../../components/OperationalToolPage.jsx";

export default createOperationalPortalPage({
  title: "Field Supervision",
  subtitle: "Superintendent checklists, safety observations, and daily production reviews.",
  activeHref: "/portal/field-supervision",
  storageKey: "fca_portal_field_supervision_v1",
  itemLabel: "Supervision log",
  journey: "lead",
  seedItems: [
    { id: "fs-1", site: "Job site A", supervisor: "Superintendent", focus: "Safety walk + production review", shift: "Day", status: "Open" },
  ],
  fields: [
    { key: "site", label: "Job site", required: true, placeholder: "Site name" },
    { key: "supervisor", label: "Supervisor", required: true, placeholder: "Name" },
    { key: "focus", label: "Focus area", placeholder: "Safety, quality, schedule" },
    { key: "shift", label: "Shift", type: "select", options: ["Day", "Night", "Weekend"], default: "Day" },
  ],
});
