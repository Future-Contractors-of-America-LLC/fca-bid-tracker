import { app } from "@azure/functions";
import { resolveAuthenticatedSession } from "./lib/auth/requestAuth.js";
import { requireProductEntitlement } from "./lib/auth/entitlements.js";
import { readCustomerState, readCustomerStateRepositoryMode } from "./lib/persistence/customerStateStore.js";

app.http("customer-workspace-summary", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer-workspace-summary",
  handler: async (request) => {
    const auth = resolveAuthenticatedSession(request);
    if (!auth.ok) {
      return auth.response;
    }

    const entitlement = requireProductEntitlement(auth.session, "saas");
    if (!entitlement.ok) {
      return entitlement.response;
    }

    try {
      const state = await readCustomerState(auth.session);

      return {
        status: 200,
        jsonBody: {
          ok: true,
          surface: "saas",
          customer: state.customer,
          workspace: state.workspace,
          bids: state.bids,
          projects: state.projects,
          entitlements: auth.session.enabledProducts,
          persistence: {
            ...state.meta,
            repositoryMode: readCustomerStateRepositoryMode(),
          },
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 503,
        jsonBody: {
          ok: false,
          error: error?.message || "Customer workspace state could not be loaded.",
        },
      };
    }
  },
});
