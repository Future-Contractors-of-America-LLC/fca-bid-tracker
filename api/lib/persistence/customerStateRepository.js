import { createFilesystemCustomerStateRepository } from "./repositories/filesystemCustomerStateRepository.js";
import { createExternalDurableCustomerStateRepository } from "./repositories/externalDurableCustomerStateRepository.js";

export function resolveCustomerStateRepository({ buildDefaultState }) {
  const mode = process.env.FCA_STATE_REPOSITORY_MODE || "filesystem";

  if (mode === "external-durable") {
    return createExternalDurableCustomerStateRepository({ buildDefaultState });
  }

  return createFilesystemCustomerStateRepository({ buildDefaultState });
}
