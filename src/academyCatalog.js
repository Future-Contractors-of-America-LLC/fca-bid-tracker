export const academyCatalog = {
  programs: [
    {
      key: "ops-core",
      title: "Construction Operations Foundations",
      credential: "FCA Core Operations Certificate",
      audience: "Owners, coordinators, assistant PMs, and new operations staff",
      duration: "4 weeks",
      format: "Guided cohort + on-demand replay + workspace lab",
      goal: "Build reliable operational discipline from intake through handoff, kickoff, customer visibility, and execution continuity.",
      outcome: "Build reliable operational discipline from intake through handoff, kickoff, and customer visibility.",
      outcomes: [
        "Move from inquiry to qualified opportunity with cleaner commercial discipline.",
        "Carry intake, qualification, and handoff decisions into the live workspace without context loss.",
        "Train coordinators and operations staff on FCA-native workflow posture instead of disconnected tool habits.",
      ],
      classrooms: ["Construction Operations Foundations"],
      stack: ["Portal workspace", "Bid continuity", "Customer coordination", "Auricrux guidance"],
      linkedSurface: "/portal/platform",
      linkedLabel: "Open Platform Dashboard",
      courses: [
        {
          code: "OPS-101",
          title: "Commercial Intake and Opportunity Control",
          lessons: 6,
          lab: "Lead qualification and handoff simulation",
        },
        {
          code: "OPS-102",
          title: "Project Activation and Workspace Readiness",
          lessons: 5,
          lab: "Project setup continuity workshop",
        },
        {
          code: "OPS-103",
          title: "Customer Visibility and Delivery Discipline",
          lessons: 4,
          lab: "Status communication and escalation drill",
        },
      ],
    },
    {
      key: "precon-estimating",
      title: "Estimating and Preconstruction Readiness",
      credential: "Preconstruction Readiness Certificate",
      audience: "Estimators, project executives, and preconstruction leads",
      duration: "6 modules",
      format: "Estimator lab + vendor scenario drills + pricing workshops",
      goal: "Strengthen scope control, estimating reliability, vendor comparison, and award recommendations before project handoff.",
      outcome: "Strengthen scope control, vendor bid handling, pricing accuracy, and award recommendations.",
      outcomes: [
        "Turn opportunities into build-ready estimates with less pricing drift.",
        "Improve bid leveling and recommendation quality before commercial commitment.",
        "Embed margin, allowance, and contingency discipline into repeatable workflows.",
      ],
      classrooms: ["Estimating, Bidding, and Margin Control"],
      stack: ["Bid workspace", "Project flow", "Commercial packaging", "Approval routing"],
      linkedSurface: "/portal/estimates",
      linkedLabel: "Open Estimates Workspace",
      courses: [
        {
          code: "EST-201",
          title: "Scope Packaging and Quantity Discipline",
          lessons: 5,
          lab: "Takeoff and assembly packaging lab",
        },
        {
          code: "EST-202",
          title: "Vendor Leveling and Recommendation Logic",
          lessons: 4,
          lab: "Bid leveling review board",
        },
        {
          code: "EST-203",
          title: "Margin Protection and Award Posture",
          lessons: 4,
          lab: "Commercial approval simulation",
        },
      ],
    },
    {
      key: "project-controls",
      title: "Project Controls and Document Governance",
      credential: "Project Controls Certificate",
      audience: "Project managers, coordinators, and document-control roles",
      duration: "5-part technical lab",
      format: "Interactive drawing review + RFI/submittal simulation",
      goal: "Make RFIs, submittals, revisions, document logs, and closeout deliverables dependable and audit-ready.",
      outcome: "Make RFIs, submittals, revisions, and closeout packages dependable and audit-ready.",
      outcomes: [
        "Create stronger file and evidence continuity across project execution.",
        "Reduce dropped approvals, revision confusion, and closeout gaps.",
        "Train document-control habits directly against FCA file and audit surfaces.",
      ],
      classrooms: ["Document Control, RFIs, and Submittals"],
      stack: ["Files workspace", "Messages", "Closeout continuity", "Audit-ready records"],
      linkedSurface: "/portal/files",
      linkedLabel: "Open Files Workspace",
      courses: [
        {
          code: "DOC-301",
          title: "Drawing Logs and Revision Control",
          lessons: 4,
          lab: "Revision continuity walkthrough",
        },
        {
          code: "DOC-302",
          title: "RFI and Submittal Execution",
          lessons: 5,
          lab: "RFI/submittal routing simulation",
        },
        {
          code: "DOC-303",
          title: "Closeout and Archive Readiness",
          lessons: 3,
          lab: "Closeout evidence packaging lab",
        },
      ],
    },
    {
      key: "field-readiness",
      title: "Field Safety and Mobilization Readiness",
      credential: "Field Readiness Badge",
      audience: "Superintendents, foremen, crew leads, and field onboarding cohorts",
      duration: "3 weeks",
      format: "Safety drills + kickoff planning + supervisor coaching",
      goal: "Prepare crews for mobilization, job hazard analysis, toolbox talks, and escalation discipline under one FCA delivery posture.",
      outcome: "Prepare crews for mobilization, job hazard analysis, toolbox talks, and escalation discipline.",
      outcomes: [
        "Improve mobilization readiness before crews hit the field.",
        "Connect training to support, safety, and customer delivery obligations.",
        "Use one consistent field-readiness standard across onboarding and ongoing operations.",
      ],
      classrooms: ["Field Safety, Mobilization, and Readiness"],
      stack: ["Support continuity", "Safety refreshers", "Kickoff readiness", "Crew communications"],
      linkedSurface: "/portal/support",
      linkedLabel: "Open Support Continuity",
      courses: [
        {
          code: "FLD-401",
          title: "Mobilization and Site Startup",
          lessons: 4,
          lab: "Kickoff readiness drill",
        },
        {
          code: "FLD-402",
          title: "Toolbox Talks and Incident Discipline",
          lessons: 4,
          lab: "Supervisor coaching lab",
        },
        {
          code: "FLD-403",
          title: "Crew Communications and Escalation",
          lessons: 3,
          lab: "Field escalation scenario run",
        },
      ],
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
