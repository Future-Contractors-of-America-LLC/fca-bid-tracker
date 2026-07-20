export const operationsPipeline = {
  stages: [
    {
      key: "lead-intake",
      title: "Lead Intake",
      owner: "Sales coordination",
      outcome: "Capture inbound demand with source, scope, budget signal, and contact continuity.",
      primaryRoute: "/bid-entry",
      primaryLabel: "Open Bid Entry",
      artifacts: [
        "Lead record",
        "Discovery intake",
        "Budget signal",
        "Consultation request",
      ],
    },
    {
      key: "qualification",
      title: "Qualification",
      owner: "Preconstruction review",
      outcome: "Confirm scope fit, jurisdiction, travel viability, and buyer seriousness before deeper production work.",
      primaryRoute: "/portal/bids",
      primaryLabel: "Open Bid Workspace",
      artifacts: [
        "Qualification score",
        "Jurisdiction review",
        "Travel check",
        "Fee readiness",
      ],
    },
    {
      key: "preconstruction",
      title: "Preconstruction",
      owner: "Estimating and preconstruction",
      outcome: "Turn qualified demand into scoped bid packaging, pricing structure, and award posture.",
      primaryRoute: "/portal/projects",
      primaryLabel: "Open Project Flow",
      artifacts: [
        "Scope package",
        "Takeoff summary",
        "Vendor requests",
        "Estimate baseline",
      ],
    },
    {
      key: "award-kickoff",
      title: "Award and Kickoff",
      owner: "Project operations",
      outcome: "Convert approvals into a live project with role clarity, startup tasks, and customer-visible next actions.",
      primaryRoute: "/portal/platform",
      primaryLabel: "Open Platform Dashboard",
      artifacts: [
        "Award confirmation",
        "Kickoff checklist",
        "Role assignment",
        "Startup plan",
      ],
    },
    {
      key: "document-control",
      title: "Document Control",
      owner: "Project controls",
      outcome: "Keep files, revisions, RFIs, and submittals coordinated inside a single contractor platform.",
      primaryRoute: "/portal/files",
      primaryLabel: "Open Files Workspace",
      artifacts: [
        "Drawing log",
        "RFI queue",
        "Submittal register",
        "Closeout draft",
      ],
    },
    {
      key: "billing-closeout",
      title: "Billing and Closeout",
      owner: "Billing and customer success",
      outcome: "Preserve invoice readiness, customer communication, handoff discipline, and recurring retention motion.",
      primaryRoute: "/portal/billing",
      primaryLabel: "Open Billing",
      artifacts: [
        "Invoice package",
        "Approval trail",
        "Closeout package",
        "Warranty setup",
      ],
    },
    {
      key: "warranty-referrals",
      title: "Warranty and Referrals",
      owner: "Service and growth",
      outcome: "Extend the customer lifecycle into service requests, review capture, and referral monetization.",
      primaryRoute: "/warranty",
      primaryLabel: "Open Warranty Continuity",
      artifacts: [
        "Warranty request",
        "Service dispatch",
        "Review request",
        "Referral trigger",
      ],
    }
  ],
  commandDeck: [
    {
      title: "Open live operations summary",
      detail: "See the active contractor pipeline from intake to service continuity in one surface.",
      href: "/portal/pipeline",
      label: "Open Commercial Pipeline",
    },
    {
      title: "Review project delivery state",
      detail: "Carry bid, project, file, billing, and support continuity through a shared operating shell.",
      href: "/portal/platform",
      label: "Open Platform Dashboard",
    },
    {
      title: "Validate market-facing route continuity",
      detail: "Move from the public shell into live workflow surfaces without losing product context.",
      href: "/platform",
      label: "Open Platform Overview",
    }
  ]
};
