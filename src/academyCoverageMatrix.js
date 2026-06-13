export const academyCoverageMatrix = {
  releaseRule: {
    title: "Single-release hold",
    detail: "FCA Academy and FCA SaaS continue developing on one shared spine. Production deployment remains intentionally deferred until offerings are both broad and deep enough to credibly support one coordinated release.",
  },
  levels: [
    {
      title: "Foundation",
      description: "Operational fluency, trade literacy, safety, document reading, platform navigation, and execution basics for new learners and cross-functional staff.",
    },
    {
      title: "Professional",
      description: "Role-ready pathways for estimators, PMs, field leaders, coordinators, accounting staff, and specialist contributors.",
    },
    {
      title: "Advanced",
      description: "Graduate-style seminars, capstones, adversarial simulations, design review labs, forensic cost review, and executive decision discipline.",
    },
    {
      title: "Credentialed",
      description: "Apprenticeship, licensure preparation, continuing education, compliance refreshers, and stackable credential issuance tied to evidence and readiness state.",
    },
  ],
  domains: [
    {
      key: "tradecraft-and-field",
      title: "Tradecraft and Field Execution",
      depth: "Apprenticeship depth from onboarding through supervision and recurring field readiness.",
      offerings: [
        "Electrical systems and controls",
        "HVAC and mechanical execution",
        "Plumbing and piping systems",
        "Concrete, civil, and sitework",
        "Framing, envelope, and interior systems",
        "Equipment safety, mobilization, and field leadership",
      ],
      linkedSurfaces: ["/portal/support", "/portal/projects", "/portal/files"],
    },
    {
      key: "preconstruction-and-estimating",
      title: "Preconstruction, Estimating, and Commercial Packaging",
      depth: "From scope reading and quantity logic to award defense, vendor leveling, and commercial integrity.",
      offerings: [
        "Plan reading and scope interpretation",
        "Digital takeoff and estimate assemblies",
        "Vendor bid leveling and procurement analysis",
        "Proposal architecture and owner-facing award strategy",
        "Cost feedback loops and forensic estimate review",
      ],
      linkedSurfaces: ["/portal/bids", "/portal/estimates", "/portal/proposals"],
    },
    {
      key: "project-controls-and-docs",
      title: "Project Controls, Documents, and Quality Governance",
      depth: "Revision truth, submittals, RFIs, redlines, change events, punch, closeout, and warranty continuity.",
      offerings: [
        "Drawing set authority and revision lineage",
        "RFI writing and submittal routing discipline",
        "Change management and approval logic",
        "QC inspections, punch closure, and closeout packaging",
        "Warranty and recurring service record continuity",
      ],
      linkedSurfaces: ["/portal/files", "/portal/audit", "/warranty"],
    },
    {
      key: "management-finance-and-ops",
      title: "Management, Finance, and Contractor Operations",
      depth: "Project leadership, billing, pay app logic, job-cost interpretation, coordination, and executive operating discipline.",
      offerings: [
        "Project management and superintendent decision habits",
        "Billing, pay applications, SOV, and retainage reasoning",
        "Job-cost, WIP, and operational baseline review",
        "Client communication, service recovery, and trust architecture",
        "Executive operations, governance, and founder-hands-off systems",
      ],
      linkedSurfaces: ["/portal/billing", "/portal/platform", "/portal/admin"],
    },
    {
      key: "design-engineering-and-compliance",
      title: "Design, Engineering, and Compliance Intelligence",
      depth: "Architecture, engineering literacy, code review, design critique, and regulated competency pathways.",
      offerings: [
        "Architecture and engineering drawing interpretation",
        "Structural, MEP, and systems coordination literacy",
        "Code and standards review labs",
        "Permit tracking and compliance workflows",
        "Design review audits and adversarial legal / contract simulations",
      ],
      linkedSurfaces: ["/portal/files", "/portal/projects", "/portal/auricrux"],
    },
    {
      key: "academy-platform-mastery",
      title: "FCA Platform Mastery and Embedded Auricrux Guidance",
      depth: "Every discipline includes platform execution so Academy and SaaS remain one product, not two disconnected experiences.",
      offerings: [
        "Workspace navigation and object-state literacy",
        "File and evidence handling inside FCA",
        "Auricrux-guided execution, review, and correction loops",
        "Role-based feature gates and just-in-time micro-learning",
        "Transcript, cohort, credential, and readiness governance",
      ],
      linkedSurfaces: ["/portal/academy", "/portal/auricrux", "/academy/transcript"],
    },
  ],
  credentialFamilies: [
    {
      title: "Apprenticeship and workforce readiness",
      items: ["Trade apprenticeship tracks", "Field readiness badges", "Supervisor readiness pathways", "Continuing education refreshers"],
    },
    {
      title: "Licensure and regulatory preparation",
      items: ["State contractor-license preparation", "Safety and compliance renewals", "Permit and inspection readiness", "Code-interpretation review paths"],
    },
    {
      title: "Professional certifications",
      items: ["Project management and controls", "Estimating and cost analysis", "Construction finance and operations", "Sustainability and specialty credentials"],
    },
    {
      title: "Degree-aligned academic pathways",
      items: ["Associate-level foundations", "Bachelor-level professional sequence", "Graduate-style capstones", "Research and advanced design review seminars"],
    },
  ],
  gatingPrinciples: [
    "No production deployment until SaaS and LMS breadth plus depth are jointly credible.",
    "Every offering family must map to a real FCA operating surface.",
    "Every pathway must yield evidence, progress state, and credential logic.",
    "Auricrux must remain present as teacher, guide, reviewer, and corrective operator across all lanes.",
  ],
};
