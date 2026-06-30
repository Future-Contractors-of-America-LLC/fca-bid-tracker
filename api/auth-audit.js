import crypto from "node:crypto";

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
  const entry = {
    id: `AUTH-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    eventType,
    role: role || null,
    sessionIdPrefix: sessionIdPrefix(token),
    ipHash: hashIp(ip),
    reason: reason || null,
    timestamp: new Date().toISOString(),
  };
  log.unshift(entry);
  // Keep log bounded to last 2000 entries in memory
  if (log.length > 2000) log.splice(2000);
  return entry;
}

export function listAuthAuditEvents({ limit = 100 } = {}) {
  return getAuditLog().slice(0, limit);
}
