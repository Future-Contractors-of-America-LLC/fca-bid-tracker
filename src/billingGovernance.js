export const billingGovernance = {
  lanes: [
    {
      title: "Contract and subscription billing lane",
      purpose: "Keep plan activation, subscription state, and customer account continuity visible in one place.",
      route: "/portal/billing",
      label: "Open Billing",
      artifacts: ["Plan record", "Billing model", "Activation status", "Account continuity log"],
    },
    {
      title: "Change-order and approval billing lane",
      purpose: "Preserve revenue impact, owner approvals, and project-linked commercial follow-through.",
      route: "/portal/projects",
      label: "Open Project Flow",
      artifacts: ["Change-order request", "Approval trail", "Revised value summary", "Revenue-impact note"],
    },
    {
      title: "Closeout, warranty, and recurring-service lane",
      purpose: "Connect delivery completion to closeout billing, warranty continuity, and repeat service revenue.",
      route: "/warranty",
      label: "Open Warranty Continuity",
      artifacts: ["Closeout billing package", "Warranty handoff", "Service revenue trigger", "Retention release note"],
    },
  ],
  revenueSignals: [
    "Plan activation continuity",
    "Invoice package readiness",
    "Change-order approval posture",
    "Recurring service revenue posture",
  ],
  conversionLinks: [
    {
      title: "Plans and rollout",
      href: "/pricing",
      label: "Plans & Rollout",
    },
    {
      title: "Contact and rollout review",
      href: "/contact",
      label: "Open Contact & Rollout",
    },
    {
      title: "Referral-driven revenue continuity",
      href: "/referrals",
      label: "Open Referral Continuity",
    },
  ],
};
