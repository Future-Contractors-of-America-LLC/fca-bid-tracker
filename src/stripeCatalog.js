let catalogCache = null;
let catalogPromise = null;

export async function loadStripeCatalog() {
  if (catalogCache) return catalogCache;
  if (catalogPromise) return catalogPromise;

  catalogPromise = fetch("/config/stripe-catalog.json", { credentials: "same-origin" })
    .then((response) => {
      if (!response.ok) throw new Error("Unable to load Stripe catalog");
      return response.json();
    })
    .then((catalog) => {
      catalogCache = catalog;
      return catalog;
    })
    .catch(() => {
      catalogPromise = null;
      return null;
    });

  return catalogPromise;
}

export function workspaceEntryFromCatalog(catalog, planKey) {
  return catalog?.workspace?.[planKey] || null;
}

export function workspaceCheckoutFromCatalog(catalog, planKey) {
  return workspaceEntryFromCatalog(catalog, planKey)?.paymentLinkUrl || null;
}

export function academyCourseEntryFromCatalog(catalog, programKey) {
  return catalog?.academyCourses?.[programKey] || null;
}

export function academyCourseCheckoutFromCatalog(catalog, programKey) {
  return academyCourseEntryFromCatalog(catalog, programKey)?.paymentLinkUrl || null;
}

export function academyPathwayEntryFromCatalog(catalog, pathwayKey) {
  return catalog?.academyPathways?.[pathwayKey] || null;
}

export function academyPathwayCheckoutFromCatalog(catalog, pathwayKey) {
  return academyPathwayEntryFromCatalog(catalog, pathwayKey)?.paymentLinkUrl || null;
}
