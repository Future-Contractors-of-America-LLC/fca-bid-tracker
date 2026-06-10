import { normalizeCustomerState } from "../defaultState.js";

function ensureConfig() {
  const baseUrl = process.env.FCA_DATABASE_READY_STATE_API_URL;
  const apiKey = process.env.FCA_DATABASE_READY_STATE_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("Database-ready durable repository is not configured.");
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    apiKey,
  };
}

async function parseResponse(response) {
  return response.json().catch(() => null);
}

export function createExternalDatabaseReadyRepository() {
  return {
    mode: "database-ready",
    async read(customerId) {
      const { baseUrl, apiKey } = ensureConfig();
      const response = await fetch(`${baseUrl}/customer-state/${encodeURIComponent(customerId)}`, {
        method: "GET",
        headers: {
          "x-fca-state-api-key": apiKey,
        },
      });

      if (response.status === 404) return null;
      if (!response.ok) {
        const payload = await parseResponse(response);
        throw new Error(payload?.error || `Database-ready state read failed with status ${response.status}.`);
      }

      const payload = await parseResponse(response);
      return normalizeCustomerState(customerId, payload?.state || payload);
    },
    async write(customerId, state) {
      const { baseUrl, apiKey } = ensureConfig();
      const normalized = normalizeCustomerState(customerId, state);
      const response = await fetch(`${baseUrl}/customer-state/${encodeURIComponent(customerId)}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-fca-state-api-key": apiKey,
        },
        body: JSON.stringify(normalized),
      });

      if (!response.ok) {
        const payload = await parseResponse(response);
        throw new Error(payload?.error || `Database-ready state write failed with status ${response.status}.`);
      }

      const payload = await parseResponse(response);
      return normalizeCustomerState(customerId, payload?.state || normalized);
    },
  };
}
