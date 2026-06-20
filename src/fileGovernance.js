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
};
