/** Account source identifiers — centralize demo/fallback labels for auth UI. */
export const DEMO_ACCOUNT_SOURCES = new Set(["seeded-local-fallback", "local-fallback"]);

export function isDemoAccountSource(accountSource) {
  return DEMO_ACCOUNT_SOURCES.has(accountSource);
}
