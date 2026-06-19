const TABLE_NAME = "FcaRuntimeSpine";
const PARTITION = "spine";

let clientPromise = null;

function connectionString() {
  return (
    process.env.FCA_TABLE_STORAGE_CONNECTION ||
    process.env.AzureWebJobsStorage ||
    process.env.AZURE_WEBJOBS_STORAGE ||
    ""
  );
}

function persistenceEnabled() {
  return Boolean(connectionString());
}

async function getClient() {
  if (!persistenceEnabled()) return null;
  if (!clientPromise) {
    clientPromise = (async () => {
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
  return clientPromise;
}

async function loadCollection(collectionName) {
  const client = await getClient();
  if (!client) return null;

  try {
    const entity = await client.getEntity(PARTITION, collectionName);
    if (!entity?.payload) return null;
    return JSON.parse(entity.payload);
  } catch (error) {
    if (error?.statusCode === 404) return null;
    console.warn("fcaRuntime load failed", collectionName, error?.message || error);
    return null;
  }
}

async function saveCollection(collectionName, items) {
  const client = await getClient();
  if (!client) return false;

  try {
    await client.upsertEntity(
      {
        partitionKey: PARTITION,
        rowKey: collectionName,
        payload: JSON.stringify(items),
        updatedAt: new Date().toISOString(),
      },
      "Replace",
    );
    return true;
  } catch (error) {
    console.warn("fcaRuntime save failed", collectionName, error?.message || error);
    return false;
  }
}

module.exports = {
  persistenceEnabled,
  loadCollection,
  saveCollection,
};
