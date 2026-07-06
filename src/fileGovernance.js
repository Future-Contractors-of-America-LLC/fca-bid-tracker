export const fileGovernance = {
  registers: [
    {
      title: "Legal & Compliance Register",
      purpose: "Track executed contracts, lien waivers, COIs, formation certificates, and permit evidence.",
      route: "/portal/legal",
      label: "Open Legal Command",
      artifacts: ["Owner contract", "Subcontract", "Conditional lien waiver", "COI", "SCC certificate", "DPOR license copy"],
    },
    {
      title: "Drawing Register",
      purpose: "Track issued plan sets, revisions, and field-usable drawing continuity.",
      route: "/portal/files",
      label: "Open Files Workspace",
      artifacts: ["Issued drawing log", "Revision index", "Permit-set snapshot", "As-built placeholder"],
    },
    {
      title: "RFI and Submittal Register",
      purpose: "Preserve unanswered questions, approvals, dependencies, and turnaround accountability.",
      route: "/portal/rfis",
      label: "Open RFI Register",
      artifacts: ["Open RFI queue", "Submittal tracker", "Approval dependencies", "Response deadlines"],
    },
    {
      title: "Closeout and Handover Register",
      purpose: "Prepare warranty-ready closeout packages and customer handoff continuity.",
      route: "/portal/closeout",
      label: "Open Closeout Workspace",
      artifacts: ["Closeout checklist", "Warranty packet", "Selection records", "Final owner package"],
    },
  ],
  closeoutPackages: [
    "As-built drawing archive",
    "Approved submittal package",
    "Warranty and service handoff",
    "Owner training / turnover notes",
  ],
  auditSignals: [
    "Revision drift visibility",
    "Missing response deadlines",
    "Closeout readiness posture",
  ],
  retentionPolicies: [
    {
      projectType: "Public Infrastructure",
      category: "Legal",
      years: 12,
      rationale: "Long-tail claims and public contract audit exposure.",
    },
    {
      projectType: "Public Infrastructure",
      category: "Drawing",
      years: 10,
      rationale: "As-built and design liability retention window.",
    },
    {
      projectType: "Commercial",
      category: "Submittal",
      years: 7,
      rationale: "Standard commercial documentation retention for disputes.",
    },
    {
      projectType: "Commercial",
      category: "Photo",
      years: 6,
      rationale: "Field condition evidence retained through warranty runway.",
    },
    {
      projectType: "Residential",
      category: "Warranty",
      years: 10,
      rationale: "Warranty and latent defect evidence retention.",
    },
    {
      projectType: "Any",
      category: "Default",
      years: 5,
      rationale: "Default retention policy when no stricter mapping exists.",
    },
  ],
};

export function resolveRetentionPolicy(projectType, category) {
  const normalizedProjectType = String(projectType || "Any").toLowerCase();
  const normalizedCategory = String(category || "Default").toLowerCase();

  const exact = fileGovernance.retentionPolicies.find((policy) =>
    policy.projectType.toLowerCase() === normalizedProjectType && policy.category.toLowerCase() === normalizedCategory,
  );
  if (exact) return exact;

  const projectDefault = fileGovernance.retentionPolicies.find((policy) =>
    policy.projectType.toLowerCase() === normalizedProjectType && policy.category.toLowerCase() === "default",
  );
  if (projectDefault) return projectDefault;

  const globalDefault = fileGovernance.retentionPolicies.find((policy) =>
    policy.projectType.toLowerCase() === "any" && policy.category.toLowerCase() === "default",
  );
  return globalDefault || { projectType: "Any", category: "Default", years: 5, rationale: "Fallback retention policy." };
}

export function computeRetentionDates({ projectType, category, recordedAt }) {
  const policy = resolveRetentionPolicy(projectType, category);
  const origin = recordedAt ? new Date(recordedAt) : new Date();
  const retainUntil = new Date(origin);
  retainUntil.setFullYear(retainUntil.getFullYear() + Number(policy.years || 0));
  return {
    policy,
    retainUntil: retainUntil.toISOString(),
  };
}
