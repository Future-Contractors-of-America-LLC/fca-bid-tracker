export const adminGovernance = {
  controls: [
    {
      title: "Tenant rollout governance",
      purpose: "Keep rollout state, activation posture, and tenant-level execution readiness visible inside the operating shell.",
      route: "/portal/admin",
      label: "Open Admin",
      artifacts: ["Tenant rollout status", "Activation checklist", "Workspace readiness note", "Executive next action"],
    },
    {
      title: "Seat and role governance",
      purpose: "Track seats, role assignments, and access expectations for delivery, billing, Academy, and support continuity.",
      route: "/portal/profile",
      label: "Open Profile",
      artifacts: ["Seat map", "Role assignment", "Access review", "Identity continuity note"],
    },
    {
      title: "Commercial and expansion governance",
      purpose: "Tie plan state, revenue posture, Academy readiness, and customer expansion into one control surface.",
      route: "/pricing",
      label: "Plans & Rollout",
      artifacts: ["Selected plan", "Expansion trigger", "Commercial review note", "Upgrade posture"],
    },
  ],
  readinessSignals: [
    "Tenant activation posture",
    "Seat assignment completeness",
    "Role-linked execution readiness",
    "Commercial expansion visibility",
  ],
  governanceActions: [
    {
      title: "Open platform dashboard",
      href: "/portal/platform",
      label: "Open Platform Dashboard",
    },
    {
      title: "Open billing",
      href: "/portal/billing",
      label: "Open Billing",
    },
    {
      title: "Open contact and rollout",
      href: "/contact",
      label: "Open Contact & Rollout",
    },
  ],
};
