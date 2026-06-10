import { resolveCustomerStateRepository } from "./customerStateRepository.js";

function buildDefaultState(session) {
  return {
    customer: {
      customerId: session.sub,
      email: session.email,
      company: session.company,
      role: session.role,
      workspaceLabel: session.workspaceLabel,
      selectedPlan: session.selectedPlan,
      enabledProducts: session.enabledProducts,
      enabledComms: session.enabledComms,
    },
    workspace: {
      title: "FCA Contractor Command Workspace",
      nextAction: "Review active projects, estimate posture, and file dependencies.",
      modules: ["projects", "bids", "files", "messages", "billing", "support"],
      operationalStatus: "customer-workspace-ready",
    },
    bids: [
      {
        id: "BID-1",
        package: "Demo Qualification Package",
        status: "review",
        blocker: "Customer approval pending",
        nextCommercialMove: "Route to approval",
        lastActionAt: null,
      },
    ],
    projects: [
      {
        id: "PRJ-001",
        name: `${session.company} Project Workspace`,
        stage: "Preconstruction",
        permitStatus: "Permit review pending",
        siteStatus: "Mobilization planning pending",
        nextAction: "Clear permit dependency and prepare execution handoff.",
        lastActionAt: null,
      },
    ],
    academy: {
      title: "FCA Academy",
      readinessStatus: "academy-route-enabled",
      learnersReadyForAssignment: 2,
      activePrograms: ["onboarding", "safety-readiness", "estimating-basics", "field-document-control"],
      nextAction: "Assign learners and preserve continuity into project mobilization.",
      trainingDependenciesRepaired: false,
      enterpriseReadinessActive: session.selectedPlan === "enterprise",
      lastActionAt: null,
    },
    auricrux: {
      executiveMode: "continuity-active",
      nextRecommendedAction: "Advance project blockers, preserve file evidence, and carry plan-backed execution into billing and training.",
      currentBlocker: "Permit dependency remains the highest leverage blocker.",
      commandDeck: ["open-projects", "review-files", "check-billing-readiness", "assign-academy-follow-through"],
    },
    meta: {
      persistenceMode: "filesystem",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

const repository = resolveCustomerStateRepository({ buildDefaultState });

export async function readCustomerState(session) {
  return repository.read(session);
}

export async function writeCustomerState(session, state) {
  return repository.write(session, state);
}

export async function updateCustomerState(session, mutator) {
  const current = await readCustomerState(session);
  const next = typeof mutator === "function" ? mutator(current) : current;
  return writeCustomerState(session, next);
}

export function readCustomerStateRepositoryMode() {
  return repository.mode;
}
