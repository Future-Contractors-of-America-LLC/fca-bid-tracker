/**
 * Auricrux live feature permission helper.
 *
 * Auricrux "live" features (real-time AI assistant, live campaign orchestration)
 * are enabled for commercial accounts when Auricrux product access is active and
 * the account is not in CTE shadow mode.
 */

function envFlagEnabled(value = "") {
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

function normalizeRole(role = "") {
  return String(role || "").trim().toLowerCase().replace(/_/g, "-");
}

function isCteShadowAccount(user = null) {
  const role = normalizeRole(user?.role);
  return user?.cteProgramEnabled === true || user?.accountMode === "cte-shadow" || role === "cte-student" || role === "student" || role === "minor";
}

/**
 * Returns true if Auricrux live (real-time AI) features should be enabled for the given user.
 *
 * @param {object|null} user - The current user/session object.
 * @param {string} [user.role] - User role (e.g. 'student', 'cte-instructor', 'cte-student', 'admin').
 * @param {boolean} [user.cteProgramEnabled] - Whether the account has CTE program access.
 * @returns {boolean}
 */
export function auricruxLiveEnabled(user) {
  if (!user) return false;
  if (envFlagEnabled(import.meta?.env?.VITE_FCA_FORCE_LIVE_MODE)) return true;
  if (isCteShadowAccount(user)) return false;
  if (user?.enabledProducts?.auricrux === false) return false;
  return true;
}

/**
 * Returns the static card content to show when live Auricrux is disabled.
 */
export const AURICRUX_LIVE_DISABLED_MESSAGE =
  "Auricrux live mode is unavailable for this account. Enable commercial Auricrux access and exit CTE shadow mode.";
