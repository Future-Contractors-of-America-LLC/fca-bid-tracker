/** API copy of src/legal/entityInfo.js — synced via prepare-api-functions.mjs */
/** Canonical FCA legal entity - single source for policies, DMCA, contact, and contractor legal references */
export const FCA_ENTITY = {
  legalName: "Future Contractors of America LLC",
  tradeNames: ["FCA", "Auricrux", "FCA Contractor Command"],
  stateOfFormation: "Virginia",
  principalOffice: {
    street: "22310 Old Vaughan Road",
    city: "Dinwiddie",
    state: "VA",
    postalCode: "23841",
    country: "United States",
  },
  emails: {
    legal: "legal@futurecontractorsofamerica.com",
    privacy: "privacy@futurecontractorsofamerica.com",
    security: "security@futurecontractorsofamerica.com",
    dmca: "dmca@futurecontractorsofamerica.com",
    support: "support@futurecontractorsofamerica.com",
    info: "info@futurecontractorsofamerica.com",
    sales: "sales@futurecontractorsofamerica.com",
  },
  website: "https://futurecontractorsofamerica.com",
};

export function formatPrincipalOffice(multiline = false) {
  const { street, city, state, postalCode } = FCA_ENTITY.principalOffice;
  if (multiline) {
    return `${FCA_ENTITY.legalName}\n${street}\n${city}, ${state} ${postalCode}`;
  }
  return `${street}, ${city}, ${state} ${postalCode}`;
}
