import { app } from "@azure/functions";
import crypto from "node:crypto";

const DPA_AUDIT_KEY = "__FCA_CHPS_DPA_SIGNATURES__";
const DPA_VERSION = "1.0";
const INVITE_TOKEN = "chps-innovative-learning-2026";

function getSignatureStore() {
  if (!globalThis[DPA_AUDIT_KEY]) {
    globalThis[DPA_AUDIT_KEY] = [];
  }
  return globalThis[DPA_AUDIT_KEY];
}

function hashIp(request) {
  const ip =
    request.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers?.get?.("x-real-ip") ||
    "";
  if (!ip) return null;
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function validateInvite(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("invite") || "";
  return token === INVITE_TOKEN;
}

app.http("chps-dpa-signature", {
  methods: ["GET", "POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "chps-dpa-signature",
  handler: async (request) => {
    if (request.method === "OPTIONS") {
      return { status: 204 };
    }

    if (request.method === "GET") {
      const signed = getSignatureStore().some((e) => e.party === "chps" && e.status === "executed");
      return {
        status: 200,
        jsonBody: {
          ok: true,
          dpaVersion: DPA_VERSION,
          providerPreSigned: true,
          chpsSigned: signed,
          documentPath: "/legal/chps-dpa-sign.html",
        },
      };
    }

    if (!validateInvite(request)) {
      return {
        status: 403,
        jsonBody: { ok: false, error: "Invalid or missing invite token." },
      };
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return { status: 400, jsonBody: { ok: false, error: "Valid JSON body required." } };
    }

    const signatoryName = String(payload?.signatoryName || "").trim();
    const signatoryTitle = String(payload?.signatoryTitle || "").trim();
    const signatoryEmail = String(payload?.signatoryEmail || "").trim().toLowerCase();
    const signatureDataUrl = String(payload?.signatureDataUrl || "").trim();
    const authorized = payload?.authorizedToBind === true;

    if (!authorized) {
      return {
        status: 400,
        jsonBody: { ok: false, error: "You must confirm authority to bind Colonial Heights Public Schools." },
      };
    }
    if (!signatoryName || !signatoryTitle || !signatoryEmail) {
      return {
        status: 400,
        jsonBody: { ok: false, error: "Name, title, and district email are required." },
      };
    }
    if (!signatureDataUrl.startsWith("data:image/")) {
      return {
        status: 400,
        jsonBody: { ok: false, error: "A drawn signature is required." },
      };
    }

    const entry = {
      id: `DPA-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      party: "chps",
      status: "executed",
      dpaVersion: DPA_VERSION,
      signatoryName,
      signatoryTitle,
      signatoryEmail,
      signatureDataUrl,
      ipHash: hashIp(request),
      timestamp: new Date().toISOString(),
    };

    getSignatureStore().unshift(entry);

    return {
      status: 200,
      jsonBody: {
        ok: true,
        confirmationId: entry.id,
        message:
          "DPA countersignature recorded. FCA will email a countersigned PDF copy and update district records.",
        notifyEmail: "auricrux@futurecontractorsofamerica.com",
        timestamp: entry.timestamp,
      },
    };
  },
});
