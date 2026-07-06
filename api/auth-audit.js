import crypto from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { writeTamperEvidentSecurityEvent } = require("./_lib/runtime/securityHardeningControls.cjs");

/**
 * Auth event audit logger for FCA/CHPS compliance.
 *
 * event_type: login_success | login_failure | logout | session_expired | session_idle_timeout
 * Stores role, sessionIdPrefix (first 8 chars of hashed session token), ipHash (SHA-256 of IP).
 * Raw IP and PII are never stored.
 */

const AUTH_AUDIT_KEY = "__FCA_AUTH_AUDIT_LOG__";

function getAuditLog() {
  if (!globalThis[AUTH_AUDIT_KEY]) {
    globalThis[AUTH_AUDIT_KEY] = [];
  }
  return globalThis[AUTH_AUDIT_KEY];
}

function hashIp(ip) {
  if (!ip) return null;
  return crypto.createHash("sha256").update(String(ip)).digest("hex").slice(0, 16);
}

function sessionIdPrefix(token) {
  if (!token) return null;
  return crypto.createHash("sha256").update(String(token)).digest("hex").slice(0, 8);
}

function resolveIp(request) {
  if (!request) return null;
  return (
    request.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers?.get?.("x-real-ip") ||
    null
  );
}

/**
 * Write an auth audit event.
 *
 * @param {object} opts
 * @param {'login_success'|'login_failure'|'logout'|'session_expired'|'session_idle_timeout'} opts.eventType
 * @param {string|null} opts.role
 * @param {string|null} opts.token - raw session token (hashed before storage)
 * @param {object|null} opts.request - Azure Functions request object (for IP extraction)
 * @param {string|null} opts.reason - optional detail
 */
export function writeAuthAuditEvent({ eventType, role = null, token = null, request = null, reason = null }) {
  const log = getAuditLog();
  const ip = resolveIp(request);
  const securityEvent = writeTamperEvidentSecurityEvent({
    eventType: `auth_${eventType}`,
    action: "auth-boundary",
    actorType: "human-user",
    principal: {
      authenticated: eventType === "login_success",
      actorType: "human-user",
      role: role || "anonymous",
      route: "auth-boundary",
      tenantHash: null,
      actorHash: sessionIdPrefix(token) || hashIp(ip) || null,
      trustState: eventType === "login_success" ? "continuously-validated" : "untrusted",
    },
    resourcePath: "/customer-login",
    outcome: eventType === "login_success" ? "allowed" : "blocked",
    severity: eventType === "login_success" ? "info" : "medium",
    reason,
    payload: { eventType, role, ipHash: hashIp(ip), sessionIdPrefix: sessionIdPrefix(token) },
    request,
  });
  const entry = {
    id: `AUTH-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    eventType,
    role: role || null,
    sessionIdPrefix: sessionIdPrefix(token),
    ipHash: hashIp(ip),
    reason: reason || null,
    timestamp: new Date().toISOString(),
    tamperEvident: true,
    previousHash: securityEvent.previousHash,
    eventHash: securityEvent.eventHash,
    immutableSink: securityEvent.immutableSink,
  };
  log.unshift(entry);
  // Keep log bounded to last 2000 entries in memory
  if (log.length > 2000) log.splice(2000);
  return entry;
}

export function listAuthAuditEvents({ limit = 100 } = {}) {
  return getAuditLog().slice(0, limit);
}

export function listAuthAuditEnvelope({ limit = 100 } = {}) {
  const items = listAuthAuditEvents({ limit });
  return {
    status: 200,
    ok: true,
    error: null,
    tamperEvident: true,
    items,
  };
}
