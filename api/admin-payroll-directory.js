import { app } from "@azure/functions";
import { requireAuth, withSessionRefresh } from "./auth-boundary.js";
import { getAdminPayrollDirectory, isAdminRole, setAdminPayrollDirectory } from "./_lib/internalOpsStore.js";

const ADMIN_REQUIRED = {
  status: 403,
  jsonBody: { ok: false, error: "Admin access required." },
};

app.http("admin-payroll-directory", {
  methods: ["GET", "PUT"],
  authLevel: "anonymous",
  route: "internal-admin/payroll-directory",
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
            items: getAdminPayrollDirectory(auth.tenantId),
            backingSource: "api-internal-ops-store",
          },
        },
        auth,
      );
    }

    const body = await request.json().catch(() => ({}));
    const items = setAdminPayrollDirectory(auth.tenantId, body?.items || [], { email: auth.session?.email, role: auth.session?.role });
    return withSessionRefresh(
      {
        status: 200,
        jsonBody: {
          ok: true,
          items,
          backingSource: "api-internal-ops-store",
        },
      },
      auth,
    );
  },
});
