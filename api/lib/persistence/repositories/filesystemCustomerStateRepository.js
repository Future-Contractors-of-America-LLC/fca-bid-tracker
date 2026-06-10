import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const ROOT_DIR = process.env.FCA_STATE_STORE_DIR || join(tmpdir(), "fca_customer_state_store");

function ensureRootDir() {
  mkdirSync(ROOT_DIR, { recursive: true });
}

function resolveCustomerFile(customerId) {
  ensureRootDir();
  return join(ROOT_DIR, `${String(customerId || "unknown-customer")}.json`);
}

export function createFilesystemCustomerStateRepository({ buildDefaultState }) {
  return {
    mode: "filesystem",
    read(session) {
      const file = resolveCustomerFile(session.sub);
      if (!existsSync(file)) {
        const seeded = buildDefaultState(session);
        this.write(session, seeded);
        return seeded;
      }

      try {
        const parsed = JSON.parse(readFileSync(file, "utf8"));
        return {
          ...buildDefaultState(session),
          ...parsed,
          customer: {
            ...buildDefaultState(session).customer,
            ...(parsed.customer || {}),
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
            ...(parsed.meta || {}),
            persistenceMode: "filesystem",
          },
        };
      } catch {
        const seeded = buildDefaultState(session);
        this.write(session, seeded);
        return seeded;
      }
    },
    write(session, state) {
      const file = resolveCustomerFile(session.sub);
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
          persistenceMode: "filesystem",
          updatedAt: new Date().toISOString(),
        },
      };

      writeFileSync(file, JSON.stringify(nextState, null, 2), "utf8");
      return nextState;
    },
  };
}
