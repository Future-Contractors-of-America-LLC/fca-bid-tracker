import { app } from "@azure/functions";
import { resolveAuthenticatedSession } from "./lib/auth/requestAuth.js";
import { requireProductEntitlement } from "./lib/auth/entitlements.js";
import { updateCustomerState, readCustomerStateRepositoryMode } from "./lib/persistence/customerStateStore.js";

function applyBidAction(currentBids = [], payload = {}) {
  return currentBids.map((bid) => {
    if (bid.id !== payload.bidId) return bid;

    const next = {
      ...bid,
      lastActionAt: new Date().toISOString(),
    };

    switch (payload.action) {
      case "clear-blocker":
        next.blocker = "No active blocker";
        next.nextCommercialMove = payload.detail || "Approval path restored.";
        break;
      case "route-to-approval":
        next.status = "Awaiting Approval";
        next.nextCommercialMove = payload.detail || "Routed to approval.";
        break;
      case "mark-won":
        next.status = "Won";
        next.blocker = "Conversion cleared";
        next.nextCommercialMove = payload.detail || "Won commercial state active.";
        break;
      case "mark-budget-fit":
        next.nextCommercialMove = payload.detail || "Budget fit confirmed.";
        break;
      case "advance-qualification":
        next.status = "Qualified";
        next.nextCommercialMove = payload.detail || "Qualification advanced.";
        break;
      case "route-to-estimate":
        next.status = "Qualified";
        next.blocker = "No active blocker";
        next.nextCommercialMove = payload.detail || "Routed to estimate.";
        break;
      default:
        next.nextCommercialMove = payload.detail || next.nextCommercialMove;
        break;
    }

    return next;
  });
}

app.http("customer-bid-action", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer-bid-action",
  handler: async (request) => {
    const auth = resolveAuthenticatedSession(request);
    if (!auth.ok) return auth.response;

    const entitlement = requireProductEntitlement(auth.session, "saas");
    if (!entitlement.ok) return entitlement.response;

    const payload = await request.json().catch(() => null);
    if (!payload?.bidId || !payload?.action) {
      return {
        status: 400,
        jsonBody: {
          ok: false,
          error: "bidId and action are required.",
        },
      };
    }

    try {
      const nextState = await updateCustomerState(auth.session, (current) => ({
        ...current,
        bids: applyBidAction(current.bids || [], payload),
        workspace: {
          ...current.workspace,
          nextAction: payload.detail || current.workspace?.nextAction,
        },
        auricrux: {
          ...current.auricrux,
          nextRecommendedAction: payload.detail || current.auricrux?.nextRecommendedAction,
        },
      }));

      return {
        status: 200,
        jsonBody: {
          ok: true,
          surface: "saas",
          workflow: "bid",
          accepted: true,
          customerId: auth.session.sub,
          company: auth.session.company,
          bidId: payload.bidId,
          action: payload.action,
          detail: payload.detail || "Bid workflow action accepted.",
          bids: nextState.bids,
          persistence: {
            ...nextState.meta,
            repositoryMode: readCustomerStateRepositoryMode(),
          },
          executionMode: "protected-backend-persistence-starter",
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 503,
        jsonBody: {
          ok: false,
          error: error?.message || "Bid workflow persistence failed.",
        },
      };
    }
  },
});
