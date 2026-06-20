/** Contractor legal document templates, compliance checklists, and license types */
export const CONTRACTOR_LEGAL_STORAGE_KEY = "fca_contractor_legal_workspace_v1";

export const licenseTypes = [
  { id: "va-dpor-class-a", label: "Virginia DPOR Class A Contractor", jurisdiction: "Virginia", renewMonths: 24 },
  { id: "va-dpor-class-b", label: "Virginia DPOR Class B Contractor", jurisdiction: "Virginia", renewMonths: 24 },
  { id: "va-dpor-residential", label: "Virginia DPOR Residential Building", jurisdiction: "Virginia", renewMonths: 24 },
  { id: "trade-electrical", label: "Electrical trade license", jurisdiction: "Virginia", renewMonths: 36 },
  { id: "trade-plumbing", label: "Plumbing trade license", jurisdiction: "Virginia", renewMonths: 36 },
  { id: "osha-30", label: "OSHA 30-Hour Construction", jurisdiction: "Federal", renewMonths: 0 },
  { id: "general-liability", label: "General liability insurance (COI)", jurisdiction: "Policy", renewMonths: 12 },
  { id: "workers-comp", label: "Workers compensation insurance", jurisdiction: "Policy", renewMonths: 12 },
];

export const documentTemplates = [
  {
    id: "subcontractor-agreement",
    title: "Subcontractor Agreement",
    category: "Agreements",
    jurisdiction: "Virginia",
    summary: "Master subcontract terms: scope, payment, insurance, indemnity, lien waiver flow, termination.",
    docPath: "docs/legal/contractor/SUBCONTRACTOR_AGREEMENT_TEMPLATE.md",
    fileCategory: "Legal - Subcontract",
  },
  {
    id: "owner-contract-residential",
    title: "Owner / Homeowner Contract (VA Residential)",
    category: "Agreements",
    jurisdiction: "Virginia",
    summary: "Residential construction contract with DPOR-aligned consumer protection notices and change-order references.",
    docPath: "docs/legal/contractor/OWNER_CONTRACT_VA_RESIDENTIAL_TEMPLATE.md",
    fileCategory: "Legal - Owner Contract",
  },
  {
    id: "conditional-lien-waiver",
    title: "Conditional Lien Waiver (Progress Payment)",
    category: "Lien Waivers",
    jurisdiction: "Virginia",
    summary: "Conditional waiver effective upon receipt of specified progress payment.",
    docPath: "docs/legal/contractor/LIEN_WAIVER_CONDITIONAL_TEMPLATE.md",
    fileCategory: "Legal - Lien Waiver",
  },
  {
    id: "unconditional-lien-waiver",
    title: "Unconditional Lien Waiver (Final Payment)",
    category: "Lien Waivers",
    jurisdiction: "Virginia",
    summary: "Unconditional waiver after cleared final payment — use only after funds verified.",
    docPath: "docs/legal/contractor/LIEN_WAIVER_UNCONDITIONAL_TEMPLATE.md",
    fileCategory: "Legal - Lien Waiver",
  },
  {
    id: "coi-tracking",
    title: "Certificate of Insurance Tracking Sheet",
    category: "Insurance",
    jurisdiction: "Multi-state",
    summary: "Track GL, WC, auto, umbrella limits, additional insured, and expiration dates for subs and vendors.",
    docPath: "docs/legal/contractor/COI_TRACKING_CHECKLIST.md",
    fileCategory: "Legal - Insurance",
  },
  {
    id: "change-order",
    title: "Change Order Authorization",
    category: "Agreements",
    jurisdiction: "Virginia",
    summary: "Written scope, price, and schedule adjustment with owner and contractor signatures.",
    docPath: "docs/legal/contractor/CHANGE_ORDER_TEMPLATE.md",
    fileCategory: "Legal - Change Order",
  },
  {
    id: "va-llc-formation",
    title: "Virginia LLC Formation Checklist",
    category: "Formation",
    jurisdiction: "Virginia",
    summary: "SCC filing, registered agent, EIN, operating agreement, and banking — aligned to FCA Academy Module 2.",
    docPath: "docs/legal/contractor/BUSINESS_FORMATION_VA_LLC_CHECKLIST.md",
    fileCategory: "Legal - Formation",
  },
  {
    id: "osha-jobsite-log",
    title: "OSHA Jobsite Safety Documentation Log",
    category: "Compliance",
    jurisdiction: "Federal",
    summary: "Toolbox talks, inspections, incidents, and corrective actions linked to project audit spine.",
    docPath: "docs/legal/contractor/OSHA_JOBSITE_LOG_TEMPLATE.md",
    fileCategory: "Legal - Safety",
  },
];

export const complianceChecklist = [
  { id: "entity-formed", label: "Legal entity formed and active with Virginia SCC", category: "Formation", academyLink: "/academy/programs/contractor-business-formation-legal/modules/2" },
  { id: "ein-obtained", label: "Federal EIN obtained and used for business banking", category: "Formation", academyLink: "/academy/programs/contractor-business-formation-legal/modules/3" },
  { id: "operating-agreement", label: "Operating agreement executed and stored", category: "Formation", academyLink: "/academy/programs/contractor-business-formation-legal/modules/4" },
  { id: "dpor-license", label: "Virginia DPOR contractor license current (if applicable)", category: "Licensure", academyLink: "/academy/programs/virginia-dpor-residential-license-prep/modules/1" },
  { id: "gl-insurance", label: "General liability insurance active with adequate limits", category: "Insurance" },
  { id: "wc-insurance", label: "Workers compensation coverage in place", category: "Insurance" },
  { id: "coi-subs", label: "Subcontractor COIs collected and reviewed", category: "Insurance" },
  { id: "owner-contract", label: "Written owner contract before starting residential work", category: "Agreements", academyLink: "/academy/programs/virginia-dpor-residential-license-prep/modules/2" },
  { id: "permit-records", label: "Permit and jurisdiction records on project file spine", category: "Compliance", academyLink: "/academy/programs/virginia-dpor-residential-license-prep/modules/3" },
  { id: "lien-waiver-process", label: "Lien waiver process defined for progress and final pay", category: "Lien Waivers" },
  { id: "osha-program", label: "Site safety program and incident documentation active", category: "Safety", academyLink: "/academy/programs/osha30-certification-prep/modules/1" },
];

export const defaultContractorLegalState = {
  entityName: "",
  entityType: "LLC",
  stateOfFormation: "Virginia",
  licenses: [],
  agreements: [],
  lienWaivers: [],
  checklist: complianceChecklist.map((item) => ({ id: item.id, completed: false, notes: "" })),
};

export function emptyLicense() {
  return {
    id: `lic-${Date.now()}`,
    typeId: "va-dpor-class-a",
    number: "",
    holder: "",
    issued: "",
    expires: "",
    status: "active",
    notes: "",
  };
}

export function emptyAgreement() {
  return {
    id: `agr-${Date.now()}`,
    title: "",
    counterparty: "",
    projectId: "",
    status: "draft",
    signedDate: "",
    templateId: "owner-contract-residential",
    notes: "",
  };
}

export function emptyLienWaiver() {
  return {
    id: `lw-${Date.now()}`,
    type: "conditional",
    projectId: "",
    payee: "",
    amount: "",
    paymentDate: "",
    status: "pending",
    linkedInvoiceId: "",
    notes: "",
  };
}
