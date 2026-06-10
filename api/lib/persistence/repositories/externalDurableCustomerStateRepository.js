function ensureDurableConfig() {
  const baseUrl = process.env.FCA_DURABLE_STATE_API_URL;
  const apiKey = process.env.FCA_DURABLE_STATE_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("External durable state repository is not configured.");
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    apiKey,
  };
}

async function parseResponse(response) {
  const payload = await response.json().catch(() => null);
  return payload;
}

export function createExternalDurableCustomerStateRepository({ buildDefaultState }) {
  return {
    mode: "external-durable",
    async read(session) {
      const { baseUrl, apiKey } = ensureDurableConfig();
      const response = await fetch(`${baseUrl}/customer-state/${encodeURIComponent(session.sub)}`, {
        method: "GET",
        headers: {
          "x-fca-state-api-key": apiKey,
        },
      });

      if (response.status === 404) {
        const seeded = buildDefaultState(session);
        return this.write(session, seeded);
      }

      if (!response.ok) {
        const payload = await parseResponse(response);
        throw new Error(payload?.error || `Durable state read failed with status ${response.status}.`);
      }

      const payload = await parseResponse(response);
      const state = payload?.state || payload;

      return {
        ...buildDefaultState(session),
        ...state,
        customer: {
          ...buildDefaultState(session).customer,
          ...(state?.customer || {}),
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
          ...(state?.meta || {}),
          persistenceMode: "external-durable",
        },
      };
    },
    async write(session, state) {
      const { baseUrl, apiKey } = ensureDurableConfig();
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
          persistenceMode: "external-durable",
          updatedAt: new Date().toISOString(),
        },
      };

      const response = await fetch(`${baseUrl}/customer-state/${encodeURIComponent(session.sub)}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-fca-state-api-key": apiKey,
        },
        body: JSON.stringify(nextState),
      });

      if (!response.ok) {
        const payload = await parseResponse(response);
        throw new Error(payload?.error || `Durable state write failed with status ${response.status}.`);
      }

      const payload = await parseResponse(response);
      return payload?.state || nextState;
    },
  };
}
