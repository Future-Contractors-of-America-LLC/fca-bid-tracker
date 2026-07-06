import { app } from "@azure/functions";
import { requireAuth, withSessionRefresh } from "./auth-boundary.js";
import { getInternalEmployeeDirectory, isAdminRole, setInternalEmployeeDirectory } from "./_lib/internalOpsStore.js";

const ADMIN_REQUIRED = {
  status: 403,
  jsonBody: { ok: false, error: "Admin access required." },
};

app.http("internal-employee-directory", {
  methods: ["GET", "PUT"],
  authLevel: "anonymous",
  route: "admin/internal-employee-directory",
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
            items: getInternalEmployeeDirectory(auth.tenantId),
            backingSource: "api-internal-ops-store",
          },
        },
        auth,
      );
    }

    const body = await request.json().catch(() => ({}));
    const items = setInternalEmployeeDirectory(auth.tenantId, body?.items || [], { email: auth.session?.email, role: auth.session?.role });
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
