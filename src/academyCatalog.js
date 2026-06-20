export const academyCatalog = {
  programs: [
    {
      key: "fca-workspace-quick-start",
      title: "FCA Workspace Quick Start",
      credential: "FCA Onboarding · Workspace Operator",
      audience: "New FCA customers, pilot teams, and owner-operators activating their first workspace",
      duration: "4 lessons · ~45 minutes",
      format: "Self-paced onboarding tied to live portal routes",
      goal: "Move from first login through project creation, bid tracking, file upload, and proposal readiness inside the real FCA shell.",
      outcomes: [
        "Create and select an active project in /portal/projects",
        "Add or qualify a bid and link it to the project spine",
        "Register files under the governed file spine in /portal/files",
        "Generate proposal continuity from estimates and portal workflows"
      ],
      courses: [
        {
          code: "ONB-001",
          title: "FCA Workspace Quick Start",
          lessons: 4,
          lab: "Live portal lab across /portal/projects, /portal/bids, /portal/files, /portal/proposals",
          lessonTitles: [
            "Lesson 1 · Create your first project and set the active job root",
            "Lesson 2 · Add a bid, qualify the opportunity, and link it to the project",
            "Lesson 3 · Upload files and track evidence on the project spine",
            "Lesson 4 · Advance estimates and package a customer-ready proposal"
          ]
        }
      ],
      linkedSurface: "/portal/projects",
      linkedLabel: "Open Projects Workspace"
    },
    {
      key: "electrical-apprenticeship-year1",
      title: "Electrical Apprenticeship Year 1: Jobsite Foundations",
      credential: "FCA Apprenticeship Track · Electrical Apprentice I",
      audience: "New electrical apprentices, helper-level field hires, and first-year trade learners",
      duration: "12 weeks",
      format: "Cohort + field lab + guided workspace reinforcement",
      goal: "Build first-year electrical trade discipline tied directly to FCA project, file, safety, and support workflows.",
      outcomes: [
        "Read basic drawings, layouts, and electrical scope notes inside FCA workflows",
        "Document field safety observations and escalation needs through live support continuity",
        "Attach jobsite evidence to project and file-control surfaces",
        "Coordinate toolbox-talk execution with Auricrux guidance"
      ],
      courses: [
        {
          code: "APP-ELEC-101",
          title: "Electrical Apprenticeship Year 1: Jobsite Foundations",
          lessons: 6,
          lab: "Project-linked field readiness lab in /portal/support and /portal/files",
          lessonTitles: [
            "Lesson 1 · Electrical safety orientation and PPE discipline",
            "Lesson 2 · Tool identification and material handling",
            "Lesson 3 · Reading basic electrical plan symbols and notes",
            "Lesson 4 · Conduit, boxes, and rough-in sequence awareness",
            "Lesson 5 · Using FCA files and support command for field escalation",
            "Lesson 6 · Auricrux-guided daily readiness and close-of-day reporting"
          ]
        }
      ],
      linkedSurface: "/portal/support",
      linkedLabel: "Open Field Support Continuity"
    },
    {
      key: "osha30-certification-prep",
      title: "OSHA 30 Construction Certification Prep Bootcamp",
      credential: "FCA Certification Track · OSHA 30 Prep",
      audience: "Field leaders, supervisors, coordinators, and compliance-focused team members",
      duration: "6 modules",
      format: "Certification prep cohort + safety scenario drills + portal lab",
      goal: "Prepare learners for OSHA 30 certification while keeping safety action routing tied to real FCA support and project surfaces.",
      outcomes: [
        "Explain OSHA hazard categories in jobsite language",
        "Escalate safety issues through Support Command without losing customer or project context",
        "Connect safety documentation to project files and audit continuity",
        "Use Auricrux to recommend next corrective action after a hazard event"
      ],
      courses: [
        {
          code: "CERT-OSHA30-201",
          title: "OSHA 30 Construction Certification Prep Bootcamp",
          lessons: 6,
          lab: "Safety escalation lab using /portal/support, /portal/files, and /portal/audit",
          lessonTitles: [
            "Lesson 1 · OSHA framework and worker rights",
            "Lesson 2 · Fall protection and ladder safety",
            "Lesson 3 · Electrical hazard awareness and lockout basics",
            "Lesson 4 · Excavation, struck-by, and caught-in hazards",
            "Lesson 5 · Incident documentation inside FCA Contractor Command",
            "Lesson 6 · Auricrux-guided corrective action and follow-through"
          ]
        }
      ],
      linkedSurface: "/portal/audit",
      linkedLabel: "Open Audit and Safety Continuity"
    },
    {
      key: "aas-construction-operations-sem1",
      title: "A.A.S. Construction Operations: Semester 1 Studio",
      credential: "FCA Degree Track · A.A.S. Construction Operations",
      audience: "Degree-seeking learners, coordinators, assistant PMs, and operations staff",
      duration: "16 weeks",
      format: "Semester studio + SaaS lab + cohort review",
      goal: "Introduce degree-track learners to integrated construction operations using real FCA command surfaces rather than detached theory.",
      outcomes: [
        "Map lifecycle stages from intake to billing and closeout",
        "Use project, bid, estimate, and billing surfaces as one operating spine",
        "Document operational decisions with audit and file continuity",
        "Interpret customer-facing workflow posture through Auricrux guidance"
      ],
      courses: [
        {
          code: "DEG-AAS-110",
          title: "A.A.S. Construction Operations: Semester 1 Studio",
          lessons: 6,
          lab: "Cross-surface lab using /portal/platform, /portal/bids, /portal/projects, and /portal/billing",
          lessonTitles: [
            "Lesson 1 · Construction lifecycle and FCA system spine",
            "Lesson 2 · Opportunity qualification and bid posture",
            "Lesson 3 · Project setup, stage control, and execution handoff",
            "Lesson 4 · File governance and auditability",
            "Lesson 5 · Billing readiness and revenue continuity",
            "Lesson 6 · Auricrux explain, recommend, execute across operations"
          ]
        }
      ],
      linkedSurface: "/portal/platform",
      linkedLabel: "Open Platform Dashboard"
    },
    {
      key: "virginia-dpor-residential-license-prep",
      title: "Virginia DPOR Residential Contractor License Prep",
      credential: "FCA Licensure Track · Virginia DPOR Residential Contractor Prep",
      audience: "Virginia residential builders, owners, qualifying individuals, and license candidates",
      duration: "8 weeks",
      format: "Licensure prep + law/compliance review + applied workflow lab",
      goal: "Prepare candidates for Virginia DPOR residential contractor licensure while teaching how compliance and documentation live inside FCA workflows.",
      outcomes: [
        "Understand Virginia licensing structure, classification, and responsibility",
        "Identify documentation required for compliant residential operations",
        "Tie permit, file, and communication behavior to licensure-safe execution",
        "Use Auricrux to detect missing compliance actions before customer delivery suffers"
      ],
      courses: [
        {
          code: "LIC-DPOR-301",
          title: "Virginia DPOR Residential Contractor License Prep",
          lessons: 6,
          lab: "Compliance lab using /portal/files, /portal/messages, and /portal/projects",
          lessonTitles: [
            "Lesson 1 · Virginia DPOR classifications and roles",
            "Lesson 2 · Contracting, documentation, and consumer protection basics",
            "Lesson 3 · Permit and jurisdiction workflow discipline",
            "Lesson 4 · Communication records and customer notice continuity",
            "Lesson 5 · File-control and project evidence for compliant delivery",
            "Lesson 6 · Auricrux-guided compliance readiness review"
          ]
        }
      ],
      linkedSurface: "/portal/files",
      linkedLabel: "Open File Governance"
    },
    {
      key: "fca-contractor-command-user-guide",
      title: "FCA Contractor Command User Guide: From Login to Closeout",
      credential: "FCA How-To Track · Contractor Command Operator",
      audience: "New FCA users, owners, coordinators, estimators, PMs, and customer-success staff",
      duration: "5 modules",
      format: "How-to course + route walkthrough + live portal practice",
      goal: "Teach users exactly how to move through FCA Contractor Command from login to real work execution.",
      outcomes: [
        "Sign in and understand what opens after login",
        "Navigate the command center, bids, projects, files, support, and billing",
        "Use real portal tools rather than reading static descriptions",
        "Understand how Academy and Auricrux remain attached to live work"
      ],
      courses: [
        {
          code: "GUIDE-FCA-001",
          title: "FCA Contractor Command User Guide: From Login to Closeout",
          lessons: 6,
          lab: "Live route walkthrough using /login, /portal, /portal/bids, /portal/projects, /portal/files, /portal/billing, and /academy/catalog",
          lessonTitles: [
            "Lesson 1 · Login, session posture, and workspace entry",
            "Lesson 2 · Using the command center and task continuity",
            "Lesson 3 · Moving through qualification and estimate launch",
            "Lesson 4 · Managing project, file, and audit continuity",
            "Lesson 5 · Creating support requests and staging invoices",
            "Lesson 6 · Using Academy and Auricrux to stay execution-ready"
          ]
        }
      ],
      linkedSurface: "/portal",
      linkedLabel: "Open Command Center"
    },
    {
      key: "fca-bids-qualification-estimates",
      title: "FCA Bids, Qualification & Estimates Operator Guide",
      credential: "FCA How-To Track · Bids & Estimates Operator",
      audience: "Estimators, coordinators, and owners managing opportunity intake through proposal readiness",
      duration: "5 lessons · ~60 minutes",
      format: "Self-paced how-to tied to /portal/bids and estimate workflows",
      goal: "Move from bid intake through qualification, scope review, and estimate launch inside the live FCA bid spine.",
      outcomes: [
        "Create and qualify bids with consistent opportunity posture",
        "Link bids to active projects and file evidence",
        "Launch estimates from qualified bid packages",
        "Package proposal continuity from estimate outputs"
      ],
      courses: [
        {
          code: "FCA-BIDS-101",
          title: "Bids, Qualification & Estimates",
          lessons: 5,
          lab: "Live portal lab across /portal/bids, /portal/projects, /portal/files, /portal/proposals",
          lessonTitles: [
            "Lesson 1 · Bid intake, opportunity fields, and qualification gates",
            "Lesson 2 · Scope notes, attachments, and bid-to-project linking",
            "Lesson 3 · Estimate launch posture and revision discipline",
            "Lesson 4 · Proposal packaging from estimate continuity",
            "Lesson 5 · Auricrux-guided bid review and next-action routing"
          ]
        }
      ],
      linkedSurface: "/portal/bids",
      linkedLabel: "Open Bids Workspace"
    },
    {
      key: "fca-projects-stage-control",
      title: "FCA Projects & Stage Control Operator Guide",
      credential: "FCA How-To Track · Projects Operator",
      audience: "PMs, supers, coordinators, and owners managing active job execution",
      duration: "5 lessons · ~60 minutes",
      format: "Self-paced how-to tied to /portal/projects stage control",
      goal: "Set up projects, manage stage progression, and keep execution continuity on the FCA project spine.",
      outcomes: [
        "Create projects with correct job root and stage posture",
        "Advance stages with audit-safe documentation",
        "Coordinate field evidence through files and support",
        "Use Auricrux for daily execution readiness checks"
      ],
      courses: [
        {
          code: "FCA-PROJ-201",
          title: "Projects & Stage Control",
          lessons: 5,
          lab: "Live portal lab across /portal/projects, /portal/files, /portal/support",
          lessonTitles: [
            "Lesson 1 · Project creation, job root, and active project selection",
            "Lesson 2 · Stage control, milestones, and execution handoff",
            "Lesson 3 · Linking bids, estimates, and files to the project spine",
            "Lesson 4 · Field escalation through support command continuity",
            "Lesson 5 · Close-of-day reporting and Auricrux execution checks"
          ]
        }
      ],
      linkedSurface: "/portal/projects",
      linkedLabel: "Open Projects Workspace"
    },
    {
      key: "fca-files-audit-governance",
      title: "FCA Files, Audit & Document Governance Guide",
      credential: "FCA How-To Track · Files & Governance Operator",
      audience: "Coordinators, PMs, compliance staff, and owners managing project evidence",
      duration: "4 lessons · ~45 minutes",
      format: "Self-paced how-to tied to /portal/files and /portal/audit",
      goal: "Register, govern, and audit project files with FCA file-control discipline.",
      outcomes: [
        "Upload and classify files under the governed file spine",
        "Maintain audit continuity across project stages",
        "Route compliance evidence to legal and billing surfaces",
        "Use Auricrux to detect missing documentation before delivery"
      ],
      courses: [
        {
          code: "FCA-FILE-301",
          title: "Files, Audit & Governance",
          lessons: 4,
          lab: "Live portal lab across /portal/files, /portal/audit, /portal/projects",
          lessonTitles: [
            "Lesson 1 · File spine structure and upload discipline",
            "Lesson 2 · Classification, versioning, and project linkage",
            "Lesson 3 · Audit trails and compliance evidence routing",
            "Lesson 4 · Auricrux-guided documentation gap detection"
          ]
        }
      ],
      linkedSurface: "/portal/files",
      linkedLabel: "Open File Governance"
    },
    {
      key: "fca-billing-invoicing",
      title: "FCA Billing & Invoicing Operator Guide",
      credential: "FCA How-To Track · Billing Operator",
      audience: "Owners, office managers, and PMs managing revenue continuity",
      duration: "4 lessons · ~45 minutes",
      format: "Self-paced how-to tied to /portal/billing",
      goal: "Stage invoices, track billing readiness, and maintain revenue continuity from project execution.",
      outcomes: [
        "Understand billing posture tied to project stages",
        "Stage invoices with correct project and file linkage",
        "Track payment and revenue continuity in the portal",
        "Use Auricrux for billing readiness reviews"
      ],
      courses: [
        {
          code: "FCA-BILL-401",
          title: "Billing & Invoicing",
          lessons: 4,
          lab: "Live portal lab across /portal/billing, /portal/projects, /portal/files",
          lessonTitles: [
            "Lesson 1 · Billing readiness and project stage alignment",
            "Lesson 2 · Invoice staging, line items, and customer context",
            "Lesson 3 · Payment tracking and revenue continuity",
            "Lesson 4 · Auricrux-guided billing gap review before send"
          ]
        }
      ],
      linkedSurface: "/portal/billing",
      linkedLabel: "Open Billing Workspace"
    },
    {
      key: "fca-legal-command-workspace",
      title: "FCA Contractor Legal Command Workspace Guide",
      credential: "FCA How-To Track · Legal Command Operator",
      audience: "Owners, qualifying individuals, and compliance staff using /portal/legal",
      duration: "4 lessons · ~45 minutes",
      format: "Self-paced how-to tied to Contractor Legal Command",
      goal: "Load entity credentials, track agreements, and maintain licensure-safe legal continuity in FCA.",
      outcomes: [
        "Set up the legal workspace with entity and license records",
        "Track owner contracts, sub agreements, and COI collection",
        "Execute lien waiver and closeout documentation discipline",
        "Connect legal records to project files and billing"
      ],
      courses: [
        {
          code: "FCA-LEGAL-501",
          title: "Legal Command Workspace",
          lessons: 4,
          lab: "Live portal lab across /portal/legal, /portal/files, /portal/billing",
          lessonTitles: [
            "Lesson 1 · Legal workspace setup and entity credential loading",
            "Lesson 2 · Agreement tracker, templates, and COI discipline",
            "Lesson 3 · Lien waivers and closeout documentation",
            "Lesson 4 · Auricrux compliance readiness before customer delivery"
          ]
        }
      ],
      linkedSurface: "/portal/legal",
      linkedLabel: "Open Contractor Legal Command"
    },
    {
      key: "fca-support-auricrux-operator",
      title: "FCA Support Command & Auricrux Operator Guide",
      credential: "FCA How-To Track · Support & Auricrux Operator",
      audience: "Field leaders, supers, coordinators, and support staff",
      duration: "4 lessons · ~45 minutes",
      format: "Self-paced how-to tied to /portal/support and Auricrux guidance",
      goal: "Create support requests, route field escalation, and use Auricrux for corrective action without losing project context.",
      outcomes: [
        "Create and track support requests with project continuity",
        "Escalate field issues through Support Command",
        "Use Auricrux explain, recommend, and execute workflows",
        "Close support loops with audit-safe documentation"
      ],
      courses: [
        {
          code: "FCA-SUP-601",
          title: "Support Command & Auricrux",
          lessons: 4,
          lab: "Live portal lab across /portal/support, /portal/projects, /portal/files",
          lessonTitles: [
            "Lesson 1 · Support request creation and project context",
            "Lesson 2 · Escalation routing and customer-safe communication",
            "Lesson 3 · Auricrux explain, recommend, and execute modes",
            "Lesson 4 · Closeout, follow-through, and audit documentation"
          ]
        }
      ],
      linkedSurface: "/portal/support",
      linkedLabel: "Open Field Support Continuity"
    },
    {
      key: "fca-academy-progress-tracking",
      title: "FCA Academy & Progress Tracking Guide",
      credential: "FCA How-To Track · Academy Operator",
      audience: "Learners, trainers, and workforce development leads using FCA Academy",
      duration: "3 lessons · ~30 minutes",
      format: "Self-paced how-to tied to /academy routes and learner dashboard",
      goal: "Navigate the Academy catalog, enroll in courses, and track progress alongside live portal work.",
      outcomes: [
        "Browse pathway, topic, and course catalog structure",
        "View public syllabi and understand enrollment gates",
        "Track learner progress on the Academy dashboard",
        "Connect Academy lessons to live portal lab surfaces"
      ],
      courses: [
        {
          code: "FCA-ACAD-701",
          title: "Academy & Progress Tracking",
          lessons: 3,
          lab: "Live route walkthrough using /academy/catalog, /academy/dashboard, /academy/programs",
          lessonTitles: [
            "Lesson 1 · Catalog navigation — pathway, topic, and course",
            "Lesson 2 · Syllabus visibility, enrollment gates, and prerequisites",
            "Lesson 3 · Dashboard progress, credentials, and portal lab linkage"
          ]
        }
      ],
      linkedSurface: "/academy/dashboard",
      linkedLabel: "Open Learner Dashboard"
    },
    {
      key: "contractor-business-formation-legal",
      title: "Contractor Business Formation & Legal Setup",
      credential: "FCA Licensure Track · Business Formation Operator",
      audience: "New contractors, owner-operators, and qualifying individuals forming a Virginia entity",
      duration: "4 modules",
      format: "Self-paced + portal legal lab + Virginia SCC/DPOR alignment",
      goal: "Form and document a legally sound contracting business in Virginia and load credentials into FCA Contractor Legal Command.",
      outcomes: [
        "Choose appropriate entity structure for your contracting business",
        "Complete Virginia SCC LLC formation steps and store certificates",
        "Obtain EIN, banking, and operating agreement discipline",
        "Track licenses, insurance, and compliance checklist in /portal/legal"
      ],
      courses: [
        {
          code: "LEGAL-FORM-201",
          title: "Business Formation & Legal Setup",
          lessons: 4,
          lab: "Portal legal lab at /portal/legal and file spine at /portal/files",
          lessonTitles: [
            "Module 1 · Choosing the right business structure (LLC, S-Corp, sole prop)",
            "Module 2 · Virginia LLC formation — SCC filing, registered agent, certificate",
            "Module 3 · Federal EIN, banking, NAICS, and local licenses",
            "Module 4 · Operating agreement, insurance, and FCA legal workspace setup"
          ]
        }
      ],
      linkedSurface: "/portal/legal",
      linkedLabel: "Open Contractor Legal Command"
    },
    {
      key: "contractor-construction-law-essentials",
      title: "Construction Law Essentials for Contractors",
      credential: "FCA Licensure Track · Construction Law Foundations",
      audience: "Owners, PMs, and estimators handling owner and subcontract agreements",
      duration: "4 modules",
      format: "Law fundamentals + template library + portal agreement tracker",
      goal: "Understand Virginia contracting law basics, consumer protection, liens, and documentation discipline inside FCA.",
      outcomes: [
        "Draft and track owner contracts and change orders",
        "Manage subcontractor agreements and COI collection",
        "Execute conditional and unconditional lien waiver discipline",
        "Tie legal records to project files, billing, and audit spine"
      ],
      courses: [
        {
          code: "LEGAL-CONST-301",
          title: "Construction Law Essentials",
          lessons: 4,
          lab: "Agreement and waiver lab at /portal/legal; files at /portal/files; billing at /portal/billing",
          lessonTitles: [
            "Module 1 · Contract fundamentals and Virginia consumer protection",
            "Module 2 · Subcontracts, insurance, and indemnity",
            "Module 3 · Mechanic's liens and waiver sequencing",
            "Module 4 · Closeout documentation and dispute prevention"
          ]
        }
      ],
      linkedSurface: "/portal/legal",
      linkedLabel: "Open Legal Workspace"
    }
  ],
  pathways: [
    {
      title: "Apprenticeship pathway",
      description: "Field-readiness training tied to support, safety, files, and project continuity.",
      route: "/portal/support",
      label: "Open Field Support Continuity",
    },
    {
      title: "Operations degree pathway",
      description: "Platform, bid, project, and billing coordination taught through one operating spine.",
      route: "/portal/platform",
      label: "Open Platform Dashboard",
    },
    {
      title: "FCA How-To pathway",
      description: "Route-by-route operator guides for bids, projects, files, billing, legal, support, and Academy.",
      route: "/academy/catalog?pathway=professional",
      label: "Open FCA How-To Catalog",
    }
  ]
};

for (const program of academyCatalog.programs) {
  for (const course of program.courses || []) {
    if (course.lessonMedia?.length) continue;
    const count = course.lessons || (course.lessonTitles?.length ?? 0);
    course.lessonMedia = Array.from({ length: count }, (_, index) => ({
      lessonIndex: index + 1,
      lessonKey: `${program.key}-${course.code}-L${String(index + 1).padStart(2, "0")}`,
      title: course.lessonTitles?.[index] || `Lesson ${index + 1}`,
      lectureVideoUrl: null,
      lectureAudioUrl: null,
      labDemoVideoUrl: null,
      performanceEvalVideoUrl: null,
      productionStatus: "pending",
    }));
  }
}
