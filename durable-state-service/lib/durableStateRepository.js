import { createFilesystemDurableStateRepository } from "./repositories/filesystemDurableStateRepository.js";
import { createExternalDatabaseReadyRepository } from "./repositories/externalDatabaseReadyRepository.js";

export function resolveDurableStateRepository() {
  const mode = process.env.FCA_DURABLE_SERVICE_REPOSITORY_MODE || "filesystem";

  if (mode === "database-ready") {
    return createExternalDatabaseReadyRepository();
  }

  return createFilesystemDurableStateRepository();
}
