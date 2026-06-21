import { ACADEMY_CATALOG_EXPECTED_TOTAL, ACADEMY_CATALOG_VERSION } from "./academyDesignSystem";

export function getCatalogIntegrity(academyState) {
  const integrity = academyState?.catalogIntegrity;
  const total = academyState?.catalog?.totalPrograms ?? academyState?.catalog?.programs?.length ?? 0;
  const laneCounts = integrity?.laneProgramCounts || academyState?.summary?.laneProgramCounts || {};
  return {
    version: integrity?.version || ACADEMY_CATALOG_VERSION,
    expectedTotal: integrity?.expectedTotalPrograms || ACADEMY_CATALOG_EXPECTED_TOTAL,
    actualTotal: integrity?.actualTotalPrograms ?? total,
    aligned: integrity?.aligned ?? (total === ACADEMY_CATALOG_EXPECTED_TOTAL),
    laneProgramCounts: laneCounts,
    apiConnected: total > 0 && academyState?.backingSource !== "unavailable",
  };
}

export function formatLaneCounts(laneProgramCounts = {}) {
  return Object.entries(laneProgramCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([lane, count]) => `${lane}: ${count}`)
    .join(" | ");
}
