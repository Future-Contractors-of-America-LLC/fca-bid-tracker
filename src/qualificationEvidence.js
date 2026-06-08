export const qualificationEvidencePackets = [
  {
    bidId: "BID-1",
    packageName: "Package A-117",
    readiness: "Evidence packet ready for estimator handoff",
    summary: "Plans, buyer notes, permit narrative, and coordination register are attached so qualification can be defended before pricing advances.",
    files: [
      "Bid package summary.pdf",
      "Permit set_A117.pdf",
      "RFI_Submittal_Log_A117.xlsx",
    ],
    checks: [
      "Buyer scope narrative attached",
      "Budget and alternates visible in bid summary",
      "Jurisdiction review attached to permit narrative",
      "Trade coordination evidence attached before estimate release",
    ],
    nextAction: "Route evidence-backed qualification packet to estimating",
  },
  {
    bidId: "BID-2",
    packageName: "Package B-204",
    readiness: "Evidence packet incomplete",
    summary: "Trade leveling and buyer budget proof are not yet fully attached, so qualification should stay in review before deeper estimating work.",
    files: [
      "Bid package summary.pdf",
      "RFI_Submittal_Log_A117.xlsx",
    ],
    checks: [
      "Subcontractor pricing refresh still required",
      "Buyer budget confirmation still required",
      "Travel premium review must be documented",
    ],
    nextAction: "Complete budget and trade evidence before estimate lock",
  },
  {
    bidId: "BID-3",
    packageName: "Package C-410",
    readiness: "Evidence packet archived with job-start handoff",
    summary: "Won work keeps the qualification packet attached so contract conversion and startup context remain auditable.",
    files: [
      "Bid package summary.pdf",
      "Site_Safety_Onboarding_Packet.pdf",
    ],
    checks: [
      "Qualification rationale preserved in project archive",
      "Startup packet tied to approved scope",
      "Field onboarding packet linked for job start",
    ],
    nextAction: "Carry evidence packet into project and billing continuity",
  },
];
