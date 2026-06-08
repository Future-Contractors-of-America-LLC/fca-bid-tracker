export const supportGovernance = {
  lanes: [
    {
      title: "Owner and approval escalation lane",
      purpose: "Keep approval blockers, scope disputes, and decision delays tied to the same project and revenue continuity state.",
      route: "/portal/support",
      label: "Open Support",
      artifacts: ["Escalation record", "Approval dependency", "Decision owner", "Recovery next step"],
    },
    {
      title: "Document, permit, and coordination lane",
      purpose: "Preserve issue handling around RFIs, submittals, plan sets, and permit blockers as governed operational recovery.",
      route: "/portal/files",
      label: "Open Files",
      artifacts: ["Document issue log", "Permit blocker note", "RFI dependency", "Coordination response trail"],
    },
    {
      title: "Warranty and post-handover recovery lane",
      purpose: "Connect service issues, warranty continuity, and customer trust recovery to retention and referral protection.",
      route: "/warranty",
      label: "Open Warranty Continuity",
      artifacts: ["Warranty intake", "Service response record", "Customer recovery note", "Retention follow-through"],
    },
  ],
  responseSignals: [
    "Escalation ownership clarity",
    "Response deadline visibility",
    "Recovery posture by tenant and project",
    "Referral-safe customer recovery",
  ],
  commsRecoveryActions: [
    {
      title: "Open messages",
      href: "/portal/messages",
      label: "Open Messages",
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
