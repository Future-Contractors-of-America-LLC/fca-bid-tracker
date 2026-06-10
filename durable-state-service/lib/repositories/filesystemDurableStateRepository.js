import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { normalizeCustomerState } from "../defaultState.js";

const ROOT_DIR = process.env.FCA_DURABLE_SERVICE_STATE_DIR || join(tmpdir(), "fca_durable_state_service");

function ensureRootDir() {
  mkdirSync(ROOT_DIR, { recursive: true });
}

function resolveCustomerFile(customerId) {
  ensureRootDir();
  return join(ROOT_DIR, `${String(customerId || "unknown-customer")}.json`);
}

export function createFilesystemDurableStateRepository() {
  return {
    mode: "filesystem",
    async read(customerId) {
      const file = resolveCustomerFile(customerId);
      if (!existsSync(file)) {
        return null;
      }

      const parsed = JSON.parse(readFileSync(file, "utf8"));
      return normalizeCustomerState(customerId, parsed);
    },
    async write(customerId, state) {
      const file = resolveCustomerFile(customerId);
      const normalized = normalizeCustomerState(customerId, state);
      writeFileSync(file, JSON.stringify(normalized, null, 2), "utf8");
      return normalized;
    },
  };
}
