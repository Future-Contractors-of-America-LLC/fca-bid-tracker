export const adminGovernance = {
  controls: [
    {
      title: "Tenant rollout governance",
      purpose: "Keep rollout state, activation posture, and tenant-level execution readiness visible inside the operating shell.",
      route: "/portal/admin",
      label: "Open Admin",
      artifacts: ["Tenant rollout status", "Activation checklist", "Workspace readiness note", "Executive next action"],
    },
    {
      title: "Seat and role governance",
      purpose: "Track seats, role assignments, and access expectations for delivery, billing, Academy, and support continuity.",
      route: "/portal/profile",
      label: "Open Profile",
      artifacts: ["Seat map", "Role assignment", "Access review", "Identity continuity note"],
    },
    {
      title: "Commercial and expansion governance",
      purpose: "Tie plan state, revenue posture, Academy readiness, and customer expansion into one control surface.",
      route: "/pricing",
      label: "Plans & Rollout",
      artifacts: ["Selected plan", "Expansion trigger", "Commercial review note", "Upgrade posture"],
    },
  ],
  readinessSignals: [
    "Tenant activation posture",
    "Seat assignment completeness",
    "Role-linked execution readiness",
    "Commercial expansion visibility",
  ],
  governanceActions: [
    {
      title: "Open platform dashboard",
      href: "/portal/platform",
      label: "Open Platform Dashboard",
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
  triadPilot: {
    minimumMarginThresholdPct: 14,
    executionBudgetOverrunPausePct: 10,
    invoiceRequiresDigitalSignature: true,
    commandTowerRoute: "/portal/command-tower",
    personas: {
      revenue: "Auricrux Revenue Persona",
      field: "Auricrux Field Guardian",
      governance: "Auricrux Governance Persona",
    },
    instructions: [
      "If lead is Won and margin is compliant, execute project setup automatically.",
      "If field task exceeds budgeted hours by 10%, pause work, alert PM, and draft scope clarification memo.",
      "Do not auto-generate invoice without digital signature proof-of-work.",
    ],
  },
  module26RevenueAutonomy: {
    mode: "auricrux-only",
    baselineHumanIntervention: "zero",
    strategyConstraints: {
      minimumBidMarginPct: 12,
      minimumTargetAnnualRevenueUsd: 5000000,
      prohibitedTargetFlags: ["active-litigation", "regulatory-blacklist"],
    },
    governanceControls: {
      revenueKillSwitchEnabled: true,
      allowAccountFreeze: true,
      aggressivenessModes: ["conservative", "balanced", "assertive"],
    },
    humanEscalationProtocol: {
      enabled: true,
      riskThresholdScore: 75,
      defaultEscalationOwner: "Founder",
      autoScheduleWindowHours: 24,
      triggers: [
        "strategic-partnership-negotiation",
        "brand-reputation-risk",
        "legal-complexity-high",
        "deal-value-over-threshold",
      ],
    },
    revenueLoop: {
      prospectToAcademyToGovernanceToLicensee: true,
      autoUpgradeOnCertificationCompletion: true,
    },
  },
  module27TalentAutonomy: {
    mode: "auricrux-only",
    baselineHumanIntervention: "zero",
    talentPersona: "Auricrux Talent Persona",
    stewardshipPersona: "Auricrux Workforce Stewardship Persona",
    credentialGate: {
      requiredCoreCertification: "FCA Core Certification",
      blockUnverifiedCandidates: true,
    },
    predictiveProvisioning: {
      planningHorizonMonths: 6,
      proactiveGapTriggerEnabled: true,
    },
    behavioralPrinciples: {
      safetyOwnership: "Own jobsite safety as a personal standard.",
      accountability: "Close loops without supervision.",
      teamHumility: "Elevate team outcomes above ego.",
    },
    cultureWeighting: {
      enabled: true,
      defaultWeights: {
        safetyOwnership: 0.35,
        accountability: 0.35,
        teamHumility: 0.30,
      },
    },
    zeroTouchInterview: {
      minimumGoScorePct: 95,
      autonomousSchedulingEnabled: true,
    },
    humanEscalationProtocol: {
      enabled: true,
      salaryNegotiationThresholdUsd: 150000,
      escalatePerformanceDisciplinary: true,
      escalateCultureFitDisputes: true,
      defaultEscalationOwner: "Founder",
    },
  },
  phase4Ecosystem: {
    marketplace: {
      sandboxValidationRequired: true,
      minimumSandboxScore: 80,
      forbiddenCapabilities: ["direct-production-write", "raw-pii-export"],
      mandatoryChecks: [
        "constitutional-margin-threshold",
        "human-intervention-routing",
        "financial-integrity-gates",
      ],
    },
    federatedLearning: {
      anonymizationRequired: true,
      blockedPiiFields: ["companyName", "workerName", "email", "phone", "address", "projectName"],
      minimumInsightConfidence: 0.7,
    },
    talentExchange: {
      passportPortableAcrossTenants: true,
      minimumVerificationSignalCount: 1,
      acceptedProofSources: ["PortalAudit", "Academy", "FieldMilestones"],
    },
    autonomousCompliance: {
      certificateProofHashRequired: true,
      autoPromptOnRegulationChange: true,
      complianceCertificateAudience: ["Regulator", "Surety", "Bonding"],
    },
  },
  projectStageGates: [
    {
      fromStage: "Mobilization",
      toStage: "Construction",
      requirements: [
        {
          type: "file-tag-approved",
          tags: ["safety", "submittal"],
          message: "Safety submittal package must be approved before Construction stage.",
        },
        {
          type: "file-tag-approved",
          tags: ["bond"],
          message: "Bond documentation must be verified before Construction stage.",
        },
      ],
    },
  ],
  changeOrderGovernance: {
    enterpriseMinimumMarkupPct: 15,
    hardStopUnsignedDays: 7,
    approvalHierarchy: [
      {
        maxAmount: 5000,
        approverRole: "Project Manager",
        reason: "Standard field variance within delegated PM authority.",
      },
      {
        maxAmount: 50000,
        approverRole: "Project Director",
        reason: "Material commercial impact requiring senior delivery approval.",
      },
      {
        maxAmount: Number.POSITIVE_INFINITY,
        approverRole: "CFO",
        reason: "High-value exposure requiring enterprise financial oversight.",
      },
    ],
  },
  planAccessGovernance: {
    enforceCurrentSetOnly: true,
    supersededWarning: "OUTDATED / SUPERSEDED DRAWING. Redirecting to current contractual plan set.",
    tradeDisciplineAccess: {
      General: ["General", "Architectural", "Structural", "MEP", "Civil", "Interiors"],
      Architect: ["Architectural", "Interiors", "General"],
      Structural: ["Structural", "General"],
      Mechanical: ["MEP", "General"],
      Electrical: ["MEP", "General"],
      Plumbing: ["MEP", "General"],
      Civil: ["Civil", "General"],
      Interior: ["Interiors", "Architectural", "General"],
    },
  },
  auditGovernance: {
    anomalyThresholds: {
      overnightDownloadVolume: 500,
      changeOrderOutlierPct: 30,
      rfiRejectionBottleneckPct: 60,
    },
    gateRequirements: {
      finalPayment: ["lien-waiver", "safety-checklist"],
    },
    complianceReportProfiles: [
      {
        id: "co-over-50k-q2",
        title: "Change Orders over $50k in Q2",
        audience: "Bank / Surety / Insurer",
      },
      {
        id: "safety-bypass",
        title: "Field task safety checklist bypass",
        audience: "Safety Officer",
      },
      {
        id: "budget-without-co",
        title: "Budget modifications without linked CO",
        audience: "Executive Audit",
      },
    ],
  },
  financeGovernance: {
    liquidity: {
      baselineCorporateCashUsd: 12000000,
      minimumReserveUsd: 2500000,
      warningRunwayMonths: 3,
    },
    bondCapacity: {
      aggregateLimitUsd: 85000000,
      singleProjectLimitUsd: 20000000,
      warningUtilizationPct: 82,
      hardStopUtilizationPct: 92,
    },
    paymentControls: {
      paymentAmountBlockThresholdUsd: 100000,
      minimumHealthIndexPct: 50,
      requiresExecutiveReviewRole: "CFO",
    },
    entityProfiles: [
      {
        id: "fca-midwest-llc",
        legalName: "FCA Midwest LLC",
        jurisdictions: ["IN", "IL", "OH"],
        unionReportingRequired: true,
        defaultTaxRatePct: 6.5,
      },
      {
        id: "fca-south-llc",
        legalName: "FCA South LLC",
        jurisdictions: ["TN", "GA", "NC", "SC"],
        unionReportingRequired: false,
        defaultTaxRatePct: 5.8,
      },
      {
        id: "fca-west-llc",
        legalName: "FCA West LLC",
        jurisdictions: ["AZ", "NV", "CO", "CA"],
        unionReportingRequired: true,
        defaultTaxRatePct: 7.25,
      },
    ],
    complianceProfiles: {
      davisBacon: {
        enabled: true,
        minimumFringePct: 18,
      },
      certifiedPayroll: {
        weeklyCutoffDay: "Friday",
        requiredArtifacts: ["field-hours", "worker-credential", "wage-classification"],
      },
    },
  },
  operationsGovernance: {
    interventionThresholds: {
      minHealthIndexPct: 62,
      criticalHealthIndexPct: 55,
      maxRfisPerProject: 18,
      maxScheduleSlipDays: 7,
      maxCapacityGapCrewUnits: 0,
    },
    resourceLeveling: {
      minimumRecoveryDaysForOverride: 2,
      overrideApprovalRole: "Operations Director",
      financeNotificationRole: "CFO",
    },
    forecastGuardrails: {
      minimumThreeMonthCashUsd: 4000000,
      legalExposureWarningUsd: 1800000,
    },
  },
  securityGovernance: {
    rbacAbac: {
      rolePermissions: {
        Owner: ["dashboard:view", "finance:approve", "policy:manage", "audit:view"],
        PM: ["dashboard:view", "change-order:create", "rfi:manage", "task:assign", "audit:view"],
        Superintendent: ["dashboard:view", "task:manage", "daily-log:manage", "rfi:view"],
        Subcontractor: ["task:view", "drawing:view", "rfi:view"],
      },
      attributeRules: {
        projectAssignmentRequired: true,
        activeCredentialRequired: true,
        mfaRequiredForFinancialActions: true,
      },
    },
    jitAccess: {
      highRiskPrivileges: ["finance:final-payment-release", "budget:baseline-change", "policy:production-update"],
      defaultTtlMinutes: 45,
      maxTtlMinutes: 120,
      approverRole: "CFO",
    },
  },
  complianceSentinel: {
    dormantAdminDays: 90,
    insuranceExpiryWarningDays: 30,
    flagShadowWorkflowPatterns: ["bypass", "offline", "manual override", "out of band"],
  },
  policyAsCode: {
    changeOrder: {
      externalPdfSignoffRequiredOverUsd: 10000,
      signoffFileTagTokens: ["change-order-signoff", "external-signoff", "owner-signoff"],
    },
    fieldTasks: {
      blockNewAssignmentForExpiringCredentialDays: 30,
      enforceSubcontractorInsuranceForAssignment: true,
    },
  },
  academyGovernance: {
    qualificationEngine: {
      authorityGates: [
        {
          action: "finance:approve-payment-over-threshold",
          thresholdUsd: 50000,
          requiredCredential: "Financial Governance & Ethics",
          requiredRole: ["Owner", "PM"],
        },
        {
          action: "change-order:approve-over-threshold",
          thresholdUsd: 50000,
          requiredCredential: "Financial Governance & Ethics",
          requiredRole: ["Owner", "PM"],
        },
        {
          action: "field-supervision:safety-signoff",
          requiredCredential: "Advanced Field Safety Leadership",
          requiredRole: ["Superintendent", "Field Supervisor"],
        },
      ],
      rolePathwayRequirements: {
        owner: ["Financial Governance & Ethics", "Executive Risk & Compliance"],
        pm: ["Critical Path Recovery", "Change Order Governance", "Advanced BIM Coordination"],
        superintendent: ["Advanced Field Safety Leadership", "Daily Log Mastery", "Material Delivery Orchestration"],
        "field supervisor": ["Advanced Field Safety Leadership", "Crew Productivity Management"],
      },
      justInTimeMicroLearning: {
        changeOrderFirstUse: {
          id: "jit-co-first-use",
          title: "2-Min Change Order Governance Walkthrough",
          durationMinutes: 2,
          linkedCourse: "Change Order Governance",
          linkedHref: "/academy/pathway?pathway=operator-guides&topic=change-order-governance",
        },
      },
    },
    workforceModeling: {
      skillsGapThresholdPct: 70,
      upcomingDemandWindowsDays: [30, 60, 90],
      criticalCompetencies: ["Advanced BIM Coordination", "High-Rise Steel Connection", "OSHA 30"],
    },
    subcontractorAcademyProgram: {
      enabled: true,
      label: "FCA-Certified Subcontractor Readiness",
      requiredBaselineCredentials: ["OSHA 10", "Field Reporting Basics"],
    },
  },
  dataRetention: {
    projectRecordsYears: 10,
    moveToColdStorageAfterYears: 10,
    auditTrailYears: 10,
    personallyIdentifiableInfoYears: 7,
  },
};
