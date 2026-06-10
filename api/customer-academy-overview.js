import { app } from "@azure/functions";
import { resolveAuthenticatedSession } from "./lib/auth/requestAuth.js";
import { requireProductEntitlement } from "./lib/auth/entitlements.js";
import { readCustomerState } from "./lib/persistence/customerStateStore.js";

app.http("customer-academy-overview", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer-academy-overview",
  handler: async (request) => {
    const auth = resolveAuthenticatedSession(request);
    if (!auth.ok) {
      return auth.response;
    }

    const entitlement = requireProductEntitlement(auth.session, "lms");
    if (!entitlement.ok) {
      return entitlement.response;
    }

    const state = readCustomerState(auth.session);

    return {
      status: 200,
      jsonBody: {
        ok: true,
        surface: "lms",
        customer: state.customer,
        academy: state.academy,
        entitlements: auth.session.enabledProducts,
        persistence: state.meta,
        timestamp: new Date().toISOString(),
      },
    };
  },
});
