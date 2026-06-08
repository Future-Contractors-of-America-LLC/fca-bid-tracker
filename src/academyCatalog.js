export const academyCatalog = {
  programs: [
    {
      key: "ops-core",
      title: "Construction Operations Foundations",
      credential: "FCA Core Operations Certificate",
      audience: "Owners, coordinators, assistant PMs, and new operations staff",
      duration: "4 weeks",
      format: "Guided cohort + on-demand replay + workspace lab",
      outcome: "Build reliable operational discipline from intake through handoff, kickoff, and customer visibility.",
      classrooms: ["Construction Operations Foundations"],
      stack: ["Portal workspace", "Bid continuity", "Customer coordination", "Auricrux guidance"],
    },
    {
      key: "precon-estimating",
      title: "Estimating and Preconstruction Readiness",
      credential: "Preconstruction Readiness Certificate",
      audience: "Estimators, project executives, and preconstruction leads",
      duration: "6 modules",
      format: "Estimator lab + vendor scenario drills + pricing workshops",
      outcome: "Strengthen scope control, vendor bid handling, pricing accuracy, and award recommendations.",
      classrooms: ["Estimating, Bidding, and Margin Control"],
      stack: ["Bid workspace", "Project flow", "Commercial packaging", "Approval routing"],
    },
    {
      key: "project-controls",
      title: "Project Controls and Document Governance",
      credential: "Project Controls Certificate",
      audience: "Project managers, coordinators, and document-control roles",
      duration: "5-part technical lab",
      format: "Interactive drawing review + RFI/submittal simulation",
      outcome: "Make RFIs, submittals, revisions, and closeout packages dependable and audit-ready.",
      classrooms: ["Document Control, RFIs, and Submittals"],
      stack: ["Files workspace", "Messages", "Closeout continuity", "Audit-ready records"],
    },
    {
      key: "field-readiness",
      title: "Field Safety and Mobilization Readiness",
      credential: "Field Readiness Badge",
      audience: "Superintendents, foremen, crew leads, and field onboarding cohorts",
      duration: "3 weeks",
      format: "Safety drills + kickoff planning + supervisor coaching",
      outcome: "Prepare crews for mobilization, job hazard analysis, toolbox talks, and escalation discipline.",
      classrooms: ["Field Safety, Mobilization, and Readiness"],
      stack: ["Support continuity", "Safety refreshers", "Kickoff readiness", "Crew communications"],
    }
  ],
  credentials: [
    {
      title: "FCA Core Operations Certificate",
      renewal: "Annual operational refresh",
      evidence: "Workspace lab completion, customer-lifecycle walkthrough, and project handoff review",
    },
    {
      title: "Preconstruction Readiness Certificate",
      renewal: "Semi-annual estimating calibration",
      evidence: "Scope package review, vendor leveling drill, and margin-control workshop",
    },
    {
      title: "Project Controls Certificate",
      renewal: "Quarterly document-control checkup",
      evidence: "RFI/submittal simulation, drawing-log review, and closeout archive audit",
    },
    {
      title: "Field Readiness Badge",
      renewal: "Mobilization-ready safety verification every 6 months",
      evidence: "Toolbox talk leadership, JHA review, and kickoff readiness verification",
    }
  ],
  pathways: [
    {
      title: "Sales-to-operations onboarding pathway",
      description: "Moves new team members from intake visibility into estimating discipline, customer coordination, and delivery-readiness habits.",
      route: "/portal/platform",
      label: "Open Platform Dashboard",
    },
    {
      title: "Preconstruction-to-project pathway",
      description: "Links bid packaging, award posture, document control, and project kickoff discipline into a single curriculum progression.",
      route: "/portal/projects",
      label: "Open Project Flow",
    },
    {
      title: "Field-readiness pathway",
      description: "Ties mobilization, safety reinforcement, and field communication standards to live support and continuity surfaces.",
      route: "/portal/support",
      label: "Open Support Continuity",
    }
  ]
};
