import { ACADEMY_CATALOG_ACADEMY_TOTAL, ACADEMY_CATALOG_CTE_TOTAL, ACADEMY_CATALOG_EXPECTED_TOTAL, ACADEMY_CATALOG_VERSION } from "./academyDesignSystem";

/**
 * Catalog integrity for Academy surfaces.
 * - Default: commercial Academy only (excludes VDOE CTE)
 * - includeCte: true with CTE-only expected when browsing the CTE pathway
 */
export function getCatalogIntegrity(academyState, { includeCte = false, cteOnly = false } = {}) {
  const integrity = academyState?.catalogIntegrity;
  const total = academyState?.catalog?.totalPrograms ?? academyState?.catalog?.programs?.length ?? 0;
  const laneCounts = { ...(integrity?.laneProgramCounts || academyState?.summary?.laneProgramCounts || {}) };
  const cteCount = Number(laneCounts["vdoe-cte"] || 0);
  const actualRaw = integrity?.actualTotalPrograms ?? total;

  let expected = ACADEMY_CATALOG_ACADEMY_TOTAL;
  let actual = Math.max(0, actualRaw - cteCount);
  if (cteOnly) {
    expected = ACADEMY_CATALOG_CTE_TOTAL;
    actual = cteCount || ACADEMY_CATALOG_CTE_TOTAL;
  } else if (includeCte) {
    expected = ACADEMY_CATALOG_EXPECTED_TOTAL;
    actual = actualRaw;
  }

  if (!includeCte && !cteOnly && laneCounts["vdoe-cte"] != null) {
    delete laneCounts["vdoe-cte"];
  }

  return {
    version: integrity?.version || ACADEMY_CATALOG_VERSION,
    expectedTotal: expected,
    actualTotal: actual,
    aligned: actual === expected,
    laneProgramCounts: laneCounts,
    apiConnected: academyState?.backingSource !== "unavailable" && actualRaw > 0,
    cteIsolated: !includeCte || cteOnly,
    platformTotal: ACADEMY_CATALOG_EXPECTED_TOTAL,
  };
}

export function formatLaneCounts(laneProgramCounts = {}) {
  return Object.entries(laneProgramCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([lane, count]) => `${lane}: ${count}`)
    .join(" | ");
}
