const TABLE_NAME = "fcaWorkflow";
const PARTITION_KEY = "tenant";

let tableClientPromise = null;
const persistTimers = new Map();

function connectionString() {
  return (
    process.env.FCA_TABLE_STORAGE_CONNECTION ||
    process.env.AzureWebJobsStorage ||
    process.env.AZURE_WEBJOBS_STORAGE ||
    ""
  );
}

async function getTableClient() {
  if (!connectionString()) return null;
  if (!tableClientPromise) {
    tableClientPromise = (async () => {
      const { TableClient } = await import("@azure/data-tables");
      const client = TableClient.fromConnectionString(connectionString(), TABLE_NAME);
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

export function persistenceEnabled() {
  return Boolean(connectionString());
}

export async function loadTenantWorkflow(tenantId) {
  const client = await getTableClient();
  if (!client) return null;

  try {
    const entity = await client.getEntity(PARTITION_KEY, tenantId);
    if (!entity?.payload) return null;
    return JSON.parse(entity.payload);
  } catch (error) {
    if (error?.statusCode === 404) return null;
    console.warn("workflow persistence load failed", tenantId, error?.message || error);
    return null;
  }
}

export async function saveTenantWorkflow(tenantId, workflow) {
  const client = await getTableClient();
  if (!client) return false;

  try {
    await client.upsertEntity({
      partitionKey: PARTITION_KEY,
      rowKey: tenantId,
      payload: JSON.stringify(workflow),
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.warn("workflow persistence save failed", tenantId, error?.message || error);
    return false;
  }
}

export function scheduleTenantPersist(tenantId, readWorkflow) {
  if (!persistenceEnabled()) return;

  const existing = persistTimers.get(tenantId);
  if (existing) clearTimeout(existing);

  persistTimers.set(
    tenantId,
    setTimeout(() => {
      persistTimers.delete(tenantId);
      try {
        const workflow = readWorkflow();
        if (workflow) {
          saveTenantWorkflow(tenantId, workflow).catch(() => {});
        }
      } catch {
        /* ignore persist read errors */
      }
    }, 250),
  );
}

const hydratedTenants = new Set();
const hydrationPromises = new Map();

export async function ensureWorkflowHydrated(tenantId, applyWorkflow) {
  if (hydratedTenants.has(tenantId)) return;

  if (!hydrationPromises.has(tenantId)) {
    hydrationPromises.set(
      tenantId,
      (async () => {
        const loaded = await loadTenantWorkflow(tenantId);
        if (loaded) applyWorkflow(tenantId, loaded);
        hydratedTenants.add(tenantId);
      })(),
    );
  }

  await hydrationPromises.get(tenantId);
}
