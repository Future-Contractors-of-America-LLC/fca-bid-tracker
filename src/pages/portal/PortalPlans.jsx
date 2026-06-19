import { createOperationalPortalPage } from "../../components/OperationalToolPage.jsx";

export default createOperationalPortalPage({
  title: "Plans & Packages",
  subtitle: "Review your active FCA plan, compare upgrade paths, and align your team to the right commercial package.",
  activeHref: "/portal/plans",
  storageKey: "fca_portal_plans_v1",
  itemLabel: "Plan review",
  journey: "lead",
  seedItems: [
    { id: "plan-1", name: "Enterprise - Full SaaS + Academy", owner: "Owner", reviewDate: "2026-06-01", status: "Open", notes: "Annual review scheduled" },
  ],
  fields: [
    { key: "name", label: "Plan or package name", required: true, placeholder: "Enterprise rollout" },
    { key: "owner", label: "Owner", required: true, placeholder: "Name" },
    { key: "reviewDate", label: "Review date", placeholder: "YYYY-MM-DD" },
    { key: "notes", label: "Notes", placeholder: "Scope, seats, or upgrade notes" },
  ],
});
