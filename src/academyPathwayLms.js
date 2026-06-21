/** Per-pathway mini-LMS branding - each pathway feels like its own LMS, operated by Auricrux. */

export const PATHWAY_LMS_CONFIG = {
  apprenticeship: {
    key: "apprenticeship",
    heroTitle: "Apprenticeship Academy",
    heroSubtitle: "NCCER-style trade pathways from Core Level 1 through Level 10 specialization - nine trades, one Auricrux-led field standard.",
    accent: "#b45309",
    accentSoft: "#fffbeb",
    border: "#fde68a",
    icon: "trade",
    operatedBy: "Auricrux",
    dashboardRoute: "/academy/dashboard#apprenticeship",
    catalogRoute: "/academy/catalog?pathway=apprenticeship",
    features: ["Level progression", "Skills demonstrations", "Field labs", "NCCER-aligned modules"],
  },
  degree: {
    key: "degree",
    heroTitle: "Degree Programs",
    heroSubtitle: "39 FCA Matrix-aligned associate and bachelor pathways with Ivy League-standard curricula and semester progression.",
    accent: "#1d4ed8",
    accentSoft: "#eff6ff",
    border: "#bfdbfe",
    icon: "degree",
    operatedBy: "Auricrux",
    dashboardRoute: "/academy/dashboard#degree",
    catalogRoute: "/academy/catalog?pathway=degree",
    features: ["120-credit BS tracks", "60-credit AAS tracks", "Gen-ed core", "Transcript and GPA"],
  },
  certification: {
    key: "certification",
    heroTitle: "Certification Institute",
    heroSubtitle: "Professional credentials aligned with OSHA, USGBC, AIA, NCCER, AACE, and leading construction associations.",
    accent: "#047857",
    accentSoft: "#ecfdf5",
    border: "#a7f3d0",
    icon: "cert",
    operatedBy: "Auricrux",
    dashboardRoute: "/academy/dashboard#certification",
    catalogRoute: "/academy/catalog?pathway=certification",
    features: ["Agency-aligned prep", "CEU documentation", "Applied field labs", "Renewal tracking"],
  },
  licensure: {
    key: "licensure",
    heroTitle: "Licensure Prep Center",
    heroSubtitle: "All 50 states plus DC, Virginia DPOR, NASCLA business law, and trade licensure - multi-state shared courses linked to every board.",
    accent: "#7c3aed",
    accentSoft: "#f5f3ff",
    border: "#ddd6fe",
    icon: "licensure",
    operatedBy: "Auricrux",
    dashboardRoute: "/academy/dashboard#licensure",
    catalogRoute: "/academy/catalog?pathway=licensure",
    features: ["50-state GC prep", "NASCLA multi-state", "DPOR Virginia", "Trade exam prep"],
  },
  professional: {
    key: "professional",
    heroTitle: "Professional Development",
    heroSubtitle: "Deep continuing education - leadership, ethics, finance, safety, contract admin, mentoring, and executive readiness.",
    accent: "#0f766e",
    accentSoft: "#f0fdfa",
    border: "#99f6e4",
    icon: "professional",
    operatedBy: "Auricrux",
    dashboardRoute: "/academy/dashboard#professional",
    catalogRoute: "/academy/catalog?pathway=professional",
    features: ["CE credit hours", "Leadership tracks", "Ethics and compliance", "Workforce readiness"],
  },
  "fca-how-to": {
    key: "fca-how-to",
    heroTitle: "FCA Operator Guides",
    heroSubtitle: "How-to pathways tied to live Contractor Command surfaces - workspace, bids, projects, files, billing, legal, and Auricrux support.",
    accent: "#dc2626",
    accentSoft: "#fef2f2",
    border: "#fecaca",
    icon: "fca",
    operatedBy: "Auricrux",
    dashboardRoute: "/academy/dashboard#fca-how-to",
    catalogRoute: "/academy/catalog?pathway=fca-how-to",
    features: ["Live portal labs", "Open enrollment", "Operator prerequisites", "SaaS-embedded learning"],
  },
};

export function getPathwayLmsConfig(pathwayKey) {
  return PATHWAY_LMS_CONFIG[pathwayKey] || null;
}

export function listPathwayLmsConfigs() {
  return Object.values(PATHWAY_LMS_CONFIG);
}
