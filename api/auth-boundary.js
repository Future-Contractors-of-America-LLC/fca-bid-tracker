export const AUTH_BOUNDARY = {
  productionAuthReady: false,
  activeMode: "sandbox-seeded-validation",
  identityProvider: "not-configured",
  tenantIsolation: "planned",
  sessionValidation: "local-shell-only",
  nextBuildStep: "Deploy tenant-backed identity, secure session validation, and role enforcement.",
};

export function buildAuthBoundary(overrides = {}) {
  return {
    ...AUTH_BOUNDARY,
    ...overrides,
    timestamp: new Date().toISOString(),
  };
}

export function buildSandboxSession(account = null) {
  if (!account) {
    return {
      authenticated: false,
      sessionSource: "none",
      customer: null,
    };
  }

  return {
    authenticated: true,
    sessionSource: "seeded-sandbox",
    customer: {
      email: account.email,
      company: account.company,
      role: account.role,
      customerId: account.customerId,
      workspaceLabel: account.workspaceLabel,
      selectedPlan: account.selectedPlan,
      enabledProducts: account.enabledProducts,
      enabledComms: account.enabledComms,
    },
  };
}
