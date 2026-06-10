import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const ROOT_DIR = process.env.FCA_STATE_STORE_DIR || join(tmpdir(), "fca_customer_state_store");

function ensureRootDir() {
  mkdirSync(ROOT_DIR, { recursive: true });
}

function resolveCustomerFile(customerId) {
  ensureRootDir();
  return join(ROOT_DIR, `${String(customerId || "unknown-customer")}.json`);
}

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
      persistenceMode: "host-local-filesystem-starter",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

export function readCustomerState(session) {
  const file = resolveCustomerFile(session.sub);
  if (!existsSync(file)) {
    const seeded = buildDefaultState(session);
    writeCustomerState(session, seeded);
    return seeded;
  }

  try {
    const parsed = JSON.parse(readFileSync(file, "utf8"));
    return {
      ...buildDefaultState(session),
      ...parsed,
      customer: {
        ...buildDefaultState(session).customer,
        ...(parsed.customer || {}),
        customerId: session.sub,
        email: session.email,
        company: session.company,
        role: session.role,
        workspaceLabel: session.workspaceLabel,
        selectedPlan: session.selectedPlan,
        enabledProducts: session.enabledProducts,
        enabledComms: session.enabledComms,
      },
      meta: {
        ...buildDefaultState(session).meta,
        ...(parsed.meta || {}),
        persistenceMode: "host-local-filesystem-starter",
      },
    };
  } catch {
    const seeded = buildDefaultState(session);
    writeCustomerState(session, seeded);
    return seeded;
  }
}

export function writeCustomerState(session, state) {
  const file = resolveCustomerFile(session.sub);
  const nextState = {
    ...state,
    customer: {
      ...(state.customer || {}),
      customerId: session.sub,
      email: session.email,
      company: session.company,
      role: session.role,
      workspaceLabel: session.workspaceLabel,
      selectedPlan: session.selectedPlan,
      enabledProducts: session.enabledProducts,
      enabledComms: session.enabledComms,
    },
    meta: {
      ...(state.meta || {}),
      persistenceMode: "host-local-filesystem-starter",
      updatedAt: new Date().toISOString(),
    },
  };

  writeFileSync(file, JSON.stringify(nextState, null, 2), "utf8");
  return nextState;
}

export function updateCustomerState(session, mutator) {
  const current = readCustomerState(session);
  const next = typeof mutator === "function" ? mutator(current) : current;
  return writeCustomerState(session, next);
}
