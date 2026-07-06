import { app } from "@azure/functions";
import { requireAuth, withSessionRefresh } from "./auth-boundary.js";
import { isAdminRole, listInternalOpsAudit } from "./_lib/internalOpsStore.js";

const ADMIN_REQUIRED = {
  status: 403,
  jsonBody: { ok: false, error: "Admin access required." },
};

app.http("internal-record-audit", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "admin/internal-record-audit",
  handler: async (request) => {
    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;
    if (!isAdminRole(auth.session?.role)) return ADMIN_REQUIRED;

    const items = listInternalOpsAudit(auth.tenantId);
    return withSessionRefresh(
      {
        status: 200,
        jsonBody: {
          ok: true,
          items,
          count: items.length,
          backingSource: "api-internal-ops-store",
        },
      },
      auth,
    );
  },
});
