import { app } from "@azure/functions";
import {
  buildAuthBoundary,
  buildServerSession,
  createSessionCookie,
  readSessionTokenFromCookieHeader,
  validateSessionToken,
} from "./auth-boundary.js";
import { loadCustomerPreferences, saveCustomerPreferences } from "./customer-preferences-store.js";

function buildAccountFromPayload(payload, preferences = null) {
  const prefs = preferences || {};
  return {
    email: payload.email,
    company: prefs.company || payload.company,
    role: prefs.role || payload.role,
    customerId: payload.customerId,
    workspaceLabel: prefs.workspaceLabel || payload.workspaceLabel,
    selectedPlan: payload.selectedPlan,
    enabledProducts: payload.enabledProducts,
    enabledComms: payload.enabledComms,
    profile: prefs.profile || null,
    companySettings: prefs.companySettings || null,
    brandSkin: prefs.brandSkin || null,
    preferencesUpdatedAt: prefs.updatedAt || null,
  };
}

app.http("customer-session", {
  methods: ["GET", "PATCH", "OPTIONS"],
  authLevel: "anonymous",
  route: "customer-session",
  handler: async (request) => {
    if (request.method === "OPTIONS") {
      return { status: 204, headers: { "Cache-Control": "no-store" } };
    }

    const cookieHeader = request.headers.get("cookie") || "";
    const token = readSessionTokenFromCookieHeader(cookieHeader);
    const payload = validateSessionToken(token);

    if (!payload) {
      return {
        status: 200,
        headers: { "Cache-Control": "no-store" },
        jsonBody: {
          ok: true,
          authenticated: false,
          session: buildServerSession(null),
          authBoundary: buildAuthBoundary(),
        },
      };
    }

    if (request.method === "GET") {
      const preferences = await loadCustomerPreferences(payload);
      const account = buildAccountFromPayload(payload, preferences);
      return {
        status: 200,
        headers: { "Cache-Control": "no-store" },
        jsonBody: {
          ok: true,
          authenticated: true,
          account,
          session: buildServerSession(account),
          authBoundary: buildAuthBoundary(),
          preferencesBackingSource: preferences ? "customer-preferences-store" : "session-cookie",
        },
      };
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    try {
      const saved = await saveCustomerPreferences(payload, {
        company: body.company,
        workspaceLabel: body.workspaceLabel,
        role: body.role,
        profile: body.profile,
        companySettings: body.companySettings,
        brandSkin: body.brandSkin,
      });

      const account = buildAccountFromPayload(
        {
          ...payload,
          company: saved.preferences.company || payload.company,
          workspaceLabel: saved.preferences.workspaceLabel || payload.workspaceLabel,
          role: saved.preferences.role || payload.role,
        },
        saved.preferences,
      );

      // Refresh cookie claims so company/role/workspace survive reloads.
      const { cookie } = createSessionCookie({
        ...payload,
        company: account.company,
        workspaceLabel: account.workspaceLabel,
        role: account.role,
      });

      return {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "Set-Cookie": cookie,
        },
        jsonBody: {
          ok: true,
          authenticated: true,
          account,
          session: buildServerSession(account),
          authBoundary: buildAuthBoundary(),
          backingSource: saved.backingSource,
        },
      };
    } catch (error) {
      return {
        status: 400,
        headers: { "Cache-Control": "no-store" },
        jsonBody: {
          ok: false,
          error: error?.message || "Unable to save customer preferences.",
          authBoundary: buildAuthBoundary(),
        },
      };
    }
  },
});
