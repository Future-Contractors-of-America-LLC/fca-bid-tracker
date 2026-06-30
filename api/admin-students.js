import { app } from "@azure/functions";
import { CHPS_TENANT_CONFIG, requireAuth, withSessionRefresh } from "./auth-boundary.js";
import {
  listStudentAccounts,
  getStudentAccount,
  provisionStudentAccount,
  provisionStudentAccountsBulk,
  deactivateStudentAccount,
} from "./student-stores.js";

const ADMIN_ROLES = new Set(["admin", "Owner / Admin"]);

function isAdmin(session) {
  return session && ADMIN_ROLES.has(session.role);
}

const ADMIN_REQUIRED_RESPONSE = {
  status: 403,
  jsonBody: {
    status: 403,
    ok: false,
    error: "Admin access required.",
  },
};

app.http("admin-students-list", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "admin/students",
  handler: async (request) => {
    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;
    if (!isAdmin(auth.session)) return ADMIN_REQUIRED_RESPONSE;

    if (request.method === "GET") {
      const accounts = listStudentAccounts();
      return withSessionRefresh(
        {
          status: 200,
          jsonBody: {
            ok: true,
            accounts,
            count: accounts.length,
            backingSource: "api-student-store",
          },
        },
        auth,
      );
    }

    const activeCount = listStudentAccounts().length;
    if (activeCount >= CHPS_TENANT_CONFIG.maxStudentAccounts) {
      return withSessionRefresh(
        {
          status: 409,
          jsonBody: {
            ok: false,
            error: `CHPS pilot cap reached (${CHPS_TENANT_CONFIG.maxStudentAccounts} active student accounts).`,
          },
        },
        auth,
      );
    }

    // POST — provision a single new student account
    const body = await request.json().catch(() => ({}));
    try {
      const account = provisionStudentAccount({
        enrolledCourse: body?.enrolledCourse || null,
      });
      return withSessionRefresh(
        {
          status: 201,
          jsonBody: {
            ok: true,
            account,
            backingSource: "api-student-store",
          },
        },
        auth,
      );
    } catch (error) {
      return {
        status: 400,
        jsonBody: { ok: false, error: error?.message || "Student account provisioning failed." },
      };
    }
  },
});

app.http("admin-students-bulk", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "admin/students/bulk",
  handler: async (request) => {
    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;
    if (!isAdmin(auth.session)) return ADMIN_REQUIRED_RESPONSE;

    const body = await request.json().catch(() => ({}));
    const activeCount = listStudentAccounts().length;
    const remaining = Math.max(0, CHPS_TENANT_CONFIG.maxStudentAccounts - activeCount);
    if (remaining === 0) {
      return withSessionRefresh(
        {
          status: 409,
          jsonBody: {
            ok: false,
            error: `CHPS pilot cap reached (${CHPS_TENANT_CONFIG.maxStudentAccounts} active student accounts).`,
          },
        },
        auth,
      );
    }
    const count = Math.max(1, Math.min(remaining, Number(body?.count) || 1));

    try {
      const accounts = provisionStudentAccountsBulk(count, {
        enrolledCourse: body?.enrolledCourse || null,
      });
      return withSessionRefresh(
        {
          status: 201,
          jsonBody: {
            ok: true,
            accounts,
            count: accounts.length,
            backingSource: "api-student-store",
          },
        },
        auth,
      );
    } catch (error) {
      return {
        status: 400,
        jsonBody: { ok: false, error: error?.message || "Bulk provisioning failed." },
      };
    }
  },
});

app.http("admin-students-deactivate", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "admin/students/{id}",
  handler: async (request, context) => {
    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;
    if (!isAdmin(auth.session)) return ADMIN_REQUIRED_RESPONSE;

    const id = context?.triggerMetadata?.id || request.params?.id;
    if (!id) {
      return { status: 400, jsonBody: { ok: false, error: "Student account ID is required." } };
    }

    const account = getStudentAccount(id);
    if (!account) {
      return { status: 404, jsonBody: { ok: false, error: `Student account not found: ${id}` } };
    }

    const deactivated = deactivateStudentAccount(id);
    return withSessionRefresh(
      {
        status: 200,
        jsonBody: {
          ok: true,
          account: deactivated,
          backingSource: "api-student-store",
        },
      },
      auth,
    );
  },
});
