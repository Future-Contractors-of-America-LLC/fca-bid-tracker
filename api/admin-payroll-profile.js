import { app } from "@azure/functions";
import { requireAuth, withSessionRefresh } from "./auth-boundary.js";
import { getAdminPayrollProfile, isAdminRole, setAdminPayrollProfile } from "./_lib/internalOpsStore.js";

const ADMIN_REQUIRED = {
  status: 403,
  jsonBody: { ok: false, error: "Admin access required." },
};

app.http("admin-payroll-profile", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "admin/payroll-profile",
  handler: async (request) => {
    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;
    if (!isAdminRole(auth.session?.role)) return ADMIN_REQUIRED;

    if (request.method === "GET") {
      return withSessionRefresh(
        {
          status: 200,
          jsonBody: {
            ok: true,
            item: getAdminPayrollProfile(auth.tenantId),
            backingSource: "api-internal-ops-store",
          },
        },
        auth,
      );
    }

    const body = await request.json().catch(() => ({}));
    const item = setAdminPayrollProfile(auth.tenantId, body || {}, { email: auth.session?.email, role: auth.session?.role });
    return withSessionRefresh(
      {
        status: 200,
        jsonBody: {
          ok: true,
          item,
          backingSource: "api-internal-ops-store",
        },
      },
      auth,
    );
  },
});
