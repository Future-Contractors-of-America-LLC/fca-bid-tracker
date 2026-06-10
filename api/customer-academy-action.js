import { app } from "@azure/functions";
import { resolveAuthenticatedSession } from "./lib/auth/requestAuth.js";
import { requireProductEntitlement } from "./lib/auth/entitlements.js";
import { updateCustomerState } from "./lib/persistence/customerStateStore.js";

function applyAcademyAction(currentAcademy = {}, payload = {}) {
  const next = {
    ...currentAcademy,
    lastActionAt: new Date().toISOString(),
  };

  switch (payload.action) {
    case "repair-academy-dependencies":
      next.trainingDependenciesRepaired = true;
      next.readinessStatus = "academy-dependencies-repaired";
      next.nextAction = payload.detail || "Academy dependencies repaired.";
      break;
    case "activate-enterprise-academy-readiness":
      next.enterpriseReadinessActive = true;
      next.readinessStatus = "enterprise-academy-readiness-active";
      next.nextAction = payload.detail || "Enterprise academy readiness active.";
      break;
    default:
      next.nextAction = payload.detail || next.nextAction;
      break;
  }

  return next;
}

app.http("customer-academy-action", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer-academy-action",
  handler: async (request) => {
    const auth = resolveAuthenticatedSession(request);
    if (!auth.ok) return auth.response;

    const entitlement = requireProductEntitlement(auth.session, "lms");
    if (!entitlement.ok) return entitlement.response;

    const payload = await request.json().catch(() => null);
    if (!payload?.action) {
      return {
        status: 400,
        jsonBody: {
          ok: false,
          error: "action is required.",
        },
      };
    }

    const nextState = updateCustomerState(auth.session, (current) => ({
      ...current,
      academy: applyAcademyAction(current.academy || {}, payload),
      auricrux: {
        ...current.auricrux,
        nextRecommendedAction: payload.detail || current.auricrux?.nextRecommendedAction,
      },
    }));

    return {
      status: 200,
      jsonBody: {
        ok: true,
        surface: "lms",
        workflow: "academy",
        accepted: true,
        customerId: auth.session.sub,
        company: auth.session.company,
        action: payload.action,
        detail: payload.detail || "Academy workflow action accepted.",
        academy: nextState.academy,
        persistence: nextState.meta,
        executionMode: "protected-backend-persistence-starter",
        timestamp: new Date().toISOString(),
      },
    };
  },
});
