/**
 * Customer workspace preferences (profile, company settings, brand skin).
 * Persists to Azure Table when storage is configured; otherwise process memory.
 */

const STORE_KEY = "__FCA_CUSTOMER_PREFERENCES_STORE__";
const TABLE_PARTITION = "customer-prefs";

function getMemoryStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = { byKey: {} };
  }
  return globalThis[STORE_KEY];
}

function preferenceKey(identity = {}) {
  const email = String(identity.email || "").trim().toLowerCase();
  const customerId = String(identity.customerId || "").trim();
  return email || customerId || "";
}

function connectionString() {
  return (
    process.env.FCA_TABLE_STORAGE_CONNECTION ||
    process.env.AzureWebJobsStorage ||
    process.env.AZURE_WEBJOBS_STORAGE ||
    ""
  );
}

let tableClientPromise = null;

async function getTableClient() {
  if (!connectionString()) return null;
  if (!tableClientPromise) {
    tableClientPromise = (async () => {
      const { TableClient } = await import("@azure/data-tables");
      const client = TableClient.fromConnectionString(connectionString(), "fcaWorkflow");
      try {
        await client.createTable();
      } catch (error) {
        if (error?.statusCode !== 409) throw error;
      }
      return client;
    })();
  }
  return tableClientPromise;
}

function normalizePreferences(raw = {}) {
  return {
    company: typeof raw.company === "string" ? raw.company.trim() : undefined,
    workspaceLabel: typeof raw.workspaceLabel === "string" ? raw.workspaceLabel.trim() : undefined,
    role: typeof raw.role === "string" ? raw.role.trim() : undefined,
    profile: {
      fullName: String(raw.profile?.fullName || "").trim(),
      title: String(raw.profile?.title || "").trim(),
      phone: String(raw.profile?.phone || "").trim(),
    },
    companySettings: {
      supportEmail: String(raw.companySettings?.supportEmail || "").trim().toLowerCase(),
      phone: String(raw.companySettings?.phone || "").trim(),
      website: String(raw.companySettings?.website || "").trim(),
    },
    brandSkin: {
      companyName: String(raw.brandSkin?.companyName || "").trim(),
      welcomeMessage: String(raw.brandSkin?.welcomeMessage || "").trim(),
      accent: String(raw.brandSkin?.accent || "#1d4ed8").trim() || "#1d4ed8",
      surface: String(raw.brandSkin?.surface || "#eff6ff").trim() || "#eff6ff",
    },
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

export async function loadCustomerPreferences(identity = {}) {
  const key = preferenceKey(identity);
  if (!key) return null;

  const memory = getMemoryStore().byKey[key];
  const client = await getTableClient();
  if (client) {
    try {
      const entity = await client.getEntity(TABLE_PARTITION, key);
      if (entity?.payload) {
        const parsed = normalizePreferences(JSON.parse(entity.payload));
        getMemoryStore().byKey[key] = parsed;
        return parsed;
      }
    } catch (error) {
      if (error?.statusCode !== 404) {
        console.warn("customer preferences load failed", key, error?.message || error);
      }
    }
  }

  return memory ? normalizePreferences(memory) : null;
}

export async function saveCustomerPreferences(identity = {}, updates = {}) {
  const key = preferenceKey(identity);
  if (!key) throw new Error("Authenticated customer identity is required to save preferences.");

  const current = (await loadCustomerPreferences(identity)) || normalizePreferences({});
  const next = normalizePreferences({
    ...current,
    ...updates,
    profile: { ...current.profile, ...updates.profile },
    companySettings: { ...current.companySettings, ...updates.companySettings },
    brandSkin: { ...current.brandSkin, ...updates.brandSkin },
    updatedAt: new Date().toISOString(),
  });

  getMemoryStore().byKey[key] = next;

  const client = await getTableClient();
  let persisted = false;
  if (client) {
    try {
      await client.upsertEntity({
        partitionKey: TABLE_PARTITION,
        rowKey: key,
        payload: JSON.stringify(next),
        updatedAt: next.updatedAt,
      });
      persisted = true;
    } catch (error) {
      console.warn("customer preferences save failed", key, error?.message || error);
    }
  }

  return {
    preferences: next,
    backingSource: persisted ? "azure-table" : "process-memory",
  };
}
