import { app } from "@azure/functions";
import { requireServiceApiKey } from "./lib/apiKeyAuth.js";
import { normalizeCustomerState } from "./lib/defaultState.js";
import { resolveDurableStateRepository } from "./lib/durableStateRepository.js";

const repository = resolveDurableStateRepository();

function badRequest(message) {
  return {
    status: 400,
    jsonBody: {
      ok: false,
      error: message,
    },
  };
}

app.http("customer-state", {
  methods: ["GET", "PUT"],
  authLevel: "anonymous",
  route: "customer-state/{customerId}",
  handler: async (request, context) => {
    const auth = requireServiceApiKey(request);
    if (!auth.ok) return auth.response;

    const customerId = context?.triggerMetadata?.customerId || request.params?.customerId;
    if (!customerId) {
      return badRequest("customerId route parameter is required.");
    }

    try {
      if (request.method === "GET") {
        const state = await repository.read(customerId);
        if (!state) {
          return {
            status: 404,
            jsonBody: {
              ok: false,
              error: "Customer state not found.",
              customerId,
              repositoryMode: repository.mode,
            },
          };
        }

        return {
          status: 200,
          jsonBody: {
            ok: true,
            customerId,
            repositoryMode: repository.mode,
            state,
          },
        };
      }

      const payload = await request.json().catch(() => null);
      if (!payload || typeof payload !== "object") {
        return badRequest("A valid JSON customer state payload is required.");
      }

      const saved = await repository.write(customerId, normalizeCustomerState(customerId, payload));
      return {
        status: 200,
        jsonBody: {
          ok: true,
          customerId,
          repositoryMode: repository.mode,
          state: saved,
        },
      };
    } catch (error) {
      return {
        status: 503,
        jsonBody: {
          ok: false,
          error: error?.message || "Durable state service request failed.",
          customerId,
          repositoryMode: repository.mode,
        },
      };
    }
  },
});
