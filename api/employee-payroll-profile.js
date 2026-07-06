import { app } from "@azure/functions";
import { requireAuth, withSessionRefresh } from "./auth-boundary.js";
import { getEmployeePayrollProfile, isEmployeeRole, upsertEmployeePayrollProfile } from "./_lib/internalOpsStore.js";

const FORBIDDEN = {
  status: 403,
  jsonBody: { ok: false, error: "Employee or admin access required." },
};

function resolveTargetEmail(session, queryEmail) {
  const requester = String(session?.email || "").trim().toLowerCase();
  const requested = String(queryEmail || "").trim().toLowerCase();
  return requested || requester;
}

app.http("employee-payroll-profile", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "employee/payroll-profile",
  handler: async (request) => {
    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;
    if (!isEmployeeRole(auth.session?.role) && !String(auth.session?.role || "").toLowerCase().includes("admin") && !String(auth.session?.role || "").toLowerCase().includes("owner")) {
      return FORBIDDEN;
    }

    const emailFromQuery = request.query.get("email") || "";
    const targetEmail = resolveTargetEmail(auth.session, emailFromQuery);

    if (request.method === "GET") {
      return withSessionRefresh(
        {
          status: 200,
          jsonBody: {
            ok: true,
            item: getEmployeePayrollProfile(auth.tenantId, targetEmail),
            backingSource: "api-internal-ops-store",
          },
        },
        auth,
      );
    }

    const body = await request.json().catch(() => ({}));
    const item = upsertEmployeePayrollProfile(auth.tenantId, targetEmail, body || {}, { email: auth.session?.email, role: auth.session?.role });
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
