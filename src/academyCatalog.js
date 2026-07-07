export const academyCatalog = {
  programs: [
    {
      key: "ops-core",
      title: "Construction Operations Foundations",
      credential: "FCA Core Operations Certificate",
      audience: "Owners, coordinators, assistant PMs, and new operations staff",
      duration: "4 weeks",
      format: "Guided cohort + on-demand replay + workspace lab",
      goal: "Build reliable operational discipline from intake through handoff, kickoff, and customer visibility.",
      outcome: "Build reliable operational discipline from intake through handoff, kickoff, and customer visibility.",
      outcomes: [
        "Map intake through closeout into one governed operating cadence.",
        "Reduce handoff and kickoff misses across estimating and delivery.",
        "Establish customer visibility standards that persist through completion."
      ],
      courses: [
        { code: "OPS-101", title: "Lifecycle Operating Fundamentals", lessons: "8", lab: "Intake-to-handoff simulation" },
        { code: "OPS-121", title: "Execution Rhythm and Controls", lessons: "7", lab: "Daily control-room drill" },
        { code: "OPS-141", title: "Customer Visibility Discipline", lessons: "6", lab: "Portal-driven customer update run" }
      ],
      classrooms: ["Construction Operations Foundations"],
      stack: ["Portal workspace", "Bid continuity", "Customer coordination", "Auricrux guidance"],
      price: "$299",
      pricingMode: "listed",
      linkedSurface: "/portal/platform",
      linkedLabel: "Open Platform Dashboard"
    },
    {
      key: "precon-estimating",
      title: "Estimating and Preconstruction Readiness",
      credential: "Preconstruction Readiness Certificate",
      audience: "Estimators, project executives, and preconstruction leads",
      duration: "6 modules",
      format: "Estimator lab + vendor scenario drills + pricing workshops",
      goal: "Strengthen scope control, vendor bid handling, pricing accuracy, and award recommendations.",
      outcome: "Strengthen scope control, vendor bid handling, pricing accuracy, and award recommendations.",
      outcomes: [
        "Calibrate scope alignment before vendor outreach.",
        "Standardize leveling and comparison discipline for bid packages.",
        "Improve margin confidence before award recommendation."
      ],
      courses: [
        { code: "PRE-201", title: "Scope Packaging and Assumptions", lessons: "7", lab: "Scope package stress test" },
        { code: "PRE-221", title: "Vendor Leveling and Risk Flags", lessons: "8", lab: "Comparative bid board exercise" },
        { code: "PRE-241", title: "Margin and Award Readiness", lessons: "6", lab: "Executive recommendation memo" }
      ],
      classrooms: ["Estimating, Bidding, and Margin Control"],
      stack: ["Bid workspace", "Project flow", "Commercial packaging", "Approval routing"],
      price: "$349",
      pricingMode: "listed",
      linkedSurface: "/portal/bids",
      linkedLabel: "Open Bid Workspace"
    },
    {
      key: "project-controls",
      title: "Project Controls and Document Governance",
      credential: "Project Controls Certificate",
      audience: "Project managers, coordinators, and document-control roles",
      duration: "5-part technical lab",
      format: "Interactive drawing review + RFI/submittal simulation",
      goal: "Make RFIs, submittals, revisions, and closeout packages dependable and audit-ready.",
      outcome: "Make RFIs, submittals, revisions, and closeout packages dependable and audit-ready.",
      outcomes: [
        "Maintain drawing and revision control under schedule pressure.",
        "Run compliant RFI and submittal workflows with full evidence chain.",
        "Package closeout documents with no continuity breaks."
      ],
      courses: [
        { code: "DOC-301", title: "Drawing and Revision Integrity", lessons: "6", lab: "Live revision-log challenge" },
        { code: "DOC-321", title: "RFI and Submittal Discipline", lessons: "8", lab: "RFI-to-submittal simulation" },
        { code: "DOC-341", title: "Closeout and Audit Readiness", lessons: "6", lab: "Closeout archive quality gate" }
      ],
      classrooms: ["Document Control, RFIs, and Submittals"],
      stack: ["Files workspace", "Messages", "Closeout continuity", "Audit-ready records"],
      price: "$329",
      pricingMode: "listed",
      linkedSurface: "/portal/files",
      linkedLabel: "Open Files Workspace"
    },
    {
      key: "field-readiness",
      title: "Field Safety and Mobilization Readiness",
      credential: "Field Readiness Badge",
      audience: "Superintendents, foremen, crew leads, and field onboarding cohorts",
      duration: "3 weeks",
      format: "Safety drills + kickoff planning + supervisor coaching",
      goal: "Prepare crews for mobilization, job hazard analysis, toolbox talks, and escalation discipline.",
      outcome: "Prepare crews for mobilization, job hazard analysis, toolbox talks, and escalation discipline.",
      outcomes: [
        "Increase mobilization readiness before first-day field activity.",
        "Reinforce repeatable safety communication and escalation behavior.",
        "Tie field onboarding to support and customer continuity."
      ],
      courses: [
        { code: "FLD-401", title: "Kickoff and Mobilization Readiness", lessons: "5", lab: "Mobilization readiness board" },
        { code: "FLD-421", title: "Job Hazard and Safety Leadership", lessons: "7", lab: "JHA facilitation practicum" },
        { code: "FLD-441", title: "Field Communication Standards", lessons: "5", lab: "Crew communication simulation" }
      ],
      classrooms: ["Field Safety, Mobilization, and Readiness"],
      stack: ["Support continuity", "Safety refreshers", "Kickoff readiness", "Crew communications"],
      price: "$279",
      pricingMode: "listed",
      linkedSurface: "/portal/support",
      linkedLabel: "Open Support Continuity"
    },
    {
      key: "cte-program",
      title: "CTE Program Pathway",
      credential: "CTE Program Delivery Track",
      audience: "CTE students, teachers, administrators, and substitutes",
      duration: "School-term aligned",
      format: "Role-specific portal pathways + competency evidence workflow",
      goal: "Run CTE implementation with dedicated teacher, administrator, substitute, and student entry points.",
      outcome: "Provide role-based CTE access with auditable student pathway progression and program governance.",
      outcomes: [
        "Separate role-based CTE logins for teacher, administrator, substitute, and student.",
        "Centralize CTE student pathway progression and evidence review.",
        "Support district rollout governance with FCA continuity controls."
      ],
      courses: [
        { code: "CTE-101", title: "Student Pathway Onboarding", lessons: "6", lab: "Student portal orientation" },
        { code: "CTE-201", title: "Teacher Delivery Workflow", lessons: "7", lab: "Classroom evidence review" },
        { code: "CTE-301", title: "Administrator Program Governance", lessons: "5", lab: "Program compliance checkpoint" }
      ],
      classrooms: ["CTE Program Portal"],
      stack: ["CTE Program Portal", "Role-based logins", "Student pathway evidence"],
      price: "Contact us",
      pricingMode: "contact",
      linkedSurface: "/cte/program",
      linkedLabel: "Open CTE Program"
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
      title: "CTE program pathway",
      description: "Launch CTE program delivery with dedicated teacher, administrator, substitute, and student login routes.",
      route: "/cte/program",
      label: "Open CTE Program",
    },
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
