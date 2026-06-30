/**
 * Auricrux live feature permission helper.
 *
 * Auricrux "live" features (real-time AI assistant, live agent queries) are only
 * enabled for CTE program accounts. All other roles (student, instructor, admin)
 * receive Auricrux in read-only/static mode.
 *
 * This applies across the entire FCA ecosystem per CHPS SOPIPA compliance requirements.
 */

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
  return user.cteProgramEnabled === true;
}

/**
 * Returns the static card content to show when live Auricrux is disabled.
 */
export const AURICRUX_LIVE_DISABLED_MESSAGE =
  "Auricrux AI is available for CTE program participants. Contact your instructor to learn more.";
