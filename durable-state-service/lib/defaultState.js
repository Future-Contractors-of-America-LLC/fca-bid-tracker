export function buildDefaultCustomerState(customerId = "unknown-customer") {
  return {
    customer: {
      customerId,
      email: null,
      company: null,
      role: null,
      workspaceLabel: null,
      selectedPlan: null,
      enabledProducts: {
        saas: true,
        lms: true,
        auricrux: true,
      },
      enabledComms: {
        chat: true,
        sms: true,
        phone: true,
        email: true,
        teams: true,
        conference: true,
        lecture: true,
      },
    },
    workspace: {
      title: "FCA Contractor Command Workspace",
      nextAction: "Review active projects, estimate posture, and file dependencies.",
      modules: ["projects", "bids", "files", "messages", "billing", "support"],
      operationalStatus: "customer-workspace-ready",
    },
    bids: [],
    projects: [],
    academy: {
      title: "FCA Academy",
      readinessStatus: "academy-route-enabled",
      learnersReadyForAssignment: 0,
      activePrograms: [],
      nextAction: "Assign learners and preserve continuity into project mobilization.",
      trainingDependenciesRepaired: false,
      enterpriseReadinessActive: false,
      lastActionAt: null,
    },
    auricrux: {
      executiveMode: "continuity-active",
      nextRecommendedAction: "Advance blockers and preserve continuity across the product spine.",
      currentBlocker: "No blocker recorded.",
      commandDeck: ["open-projects", "review-files", "check-billing-readiness", "assign-academy-follow-through"],
    },
    meta: {
      persistenceMode: "durable-service-filesystem",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

export function normalizeCustomerState(customerId, state = {}) {
  const base = buildDefaultCustomerState(customerId);
  return {
    ...base,
    ...state,
    customer: {
      ...base.customer,
      ...(state.customer || {}),
      customerId,
    },
    meta: {
      ...base.meta,
      ...(state.meta || {}),
      updatedAt: new Date().toISOString(),
    },
  };
}
