import {
  AAS_CONSTRUCTION_MANAGEMENT_TERMS,
  APPRENTICESHIP_TRADE_LEVELS,
  APPRENTICESHIP_TRADES,
  BS_CONSTRUCTION_MANAGEMENT_YEARS,
  BUSINESS_LAW_LICENSURE_UNITS,
  DPOR_LICENSURE_UNITS,
  ELECTRICAL_APPRENTICESHIP_LEVELS,
  ELECTRICAL_LICENSURE_UNITS,
  FCA_HOWTO_SEQUENCE,
  OSHA_CERT_UNITS,
  PROJECT_CONTROLS_CERT_UNITS,
} from "./academyOfferings.js";

const TRADE_JOURNEYMAN_CERT_KEYS = {
  electrical: "cert-electrical-journeyman-readiness",
  plumbing: "cert-plumbing-journeyman-readiness",
  hvac: "cert-hvac-journeyman-readiness",
  carpentry: "cert-carpentry-journeyman-readiness",
  masonry: "cert-masonry-journeyman-readiness",
  welding: "cert-welding-journeyman-readiness",
  pipefitting: "cert-pipefitting-journeyman-readiness",
  "sheet-metal": "cert-sheet-metal-journeyman-readiness",
  "fire-sprinkler": "cert-fire-sprinkler-journeyman-readiness",
};

const TRADE_LICENSURE_JOURNEYMAN_KEYS = {
  electrical: "lic-electrical-journeyman-exam-prep",
  plumbing: "lic-plumbing-journeyman-exam-prep",
  hvac: "lic-hvac-journeyman-exam-prep",
};

function step(order, title, description, programKeys = [], meta = {}) {
  return { order, title, description, programKeys: programKeys.filter(Boolean), ...meta };
}

export function getApprenticeshipCareerSequence(tradeKey = "electrical") {
  const trade = APPRENTICESHIP_TRADES.find((item) => item.key === tradeKey) || APPRENTICESHIP_TRADES[0];
  const coreLevels = tradeKey === "electrical"
    ? ELECTRICAL_APPRENTICESHIP_LEVELS.slice(0, 6)
    : (APPRENTICESHIP_TRADE_LEVELS[tradeKey] || APPRENTICESHIP_TRADE_LEVELS.electrical);

  const steps = coreLevels.map((level, index) => step(
    index + 1,
    level.title,
    `Complete all modules and knowledge checks at 80% or higher.`,
    [level.key],
    { phase: "apprenticeship", tradeKey },
  ));

  const selectionKey = `${tradeKey}-specialization-selection`;
  steps.push(step(
    steps.length + 1,
    `${trade.label} specialization selection`,
    "Choose your advanced track and receive formal specialization assignment.",
    [selectionKey],
    { phase: "apprenticeship", tradeKey },
  ));

  const journeymanCert = TRADE_JOURNEYMAN_CERT_KEYS[tradeKey];
  if (journeymanCert) {
    steps.push(step(
      steps.length + 1,
      `${trade.label} journeyman certification`,
      "Agency-aligned journeyman credential after apprenticeship completion.",
      [journeymanCert],
      { phase: "certification", tradeKey, bridgeFrom: "apprenticeship" },
    ));
  }

  const licKey = TRADE_LICENSURE_JOURNEYMAN_KEYS[tradeKey];
  if (licKey) {
    steps.push(step(
      steps.length + 1,
      `${trade.label} journeyman licensure exam prep`,
      "State board exam preparation - requirements vary by jurisdiction.",
      [licKey],
      { phase: "licensure", tradeKey, bridgeFrom: "certification" },
    ));
  }

  return { pathwayKey: "apprenticeship", tradeKey, tradeLabel: trade.label, steps };
}

export function getCertificationSequence(topicKey) {
  if (topicKey === "safety-osha") {
    return {
      pathwayKey: "certification",
      topicKey,
      title: "OSHA safety certification path",
      steps: OSHA_CERT_UNITS.map((unit) => step(unit.unit, unit.title, "Complete modules, labs, and knowledge checks.", [unit.key], { phase: "certification" })),
    };
  }
  if (topicKey === "project-controls") {
    return {
      pathwayKey: "certification",
      topicKey,
      title: "Project controls certification path",
      steps: PROJECT_CONTROLS_CERT_UNITS.map((unit) => step(unit.unit, unit.title, "PMI-aligned project controls progression.", [unit.key], { phase: "certification" })),
    };
  }
  return null;
}

export function getLicensureSequence(topicKey) {
  if (topicKey === "electrical-licensure") {
    return {
      pathwayKey: "licensure",
      topicKey,
      title: "Electrical licensure exam prep",
      steps: ELECTRICAL_LICENSURE_UNITS.map((unit) => step(unit.unit, unit.title, "Board-aligned exam preparation.", [unit.key], { phase: "licensure" })),
    };
  }
  if (topicKey === "state-va") {
    return {
      pathwayKey: "licensure",
      topicKey,
      title: "Virginia DPOR contractor licensing",
      steps: DPOR_LICENSURE_UNITS.map((unit) => step(unit.unit, unit.title, "Virginia DPOR classification exam prep.", [unit.key], { phase: "licensure" })),
    };
  }
  if (topicKey === "business-law-compliance") {
    return {
      pathwayKey: "licensure",
      topicKey,
      title: "NASCLA and business law licensure",
      steps: BUSINESS_LAW_LICENSURE_UNITS.map((unit) => step(unit.unit, unit.title, "Multi-state business and law exam alignment.", [unit.key], { phase: "licensure" })),
    };
  }
  return null;
}

export function getDegreeSequence(topicKey) {
  if (topicKey === "aas-construction-management") {
    return {
      pathwayKey: "degree",
      topicKey,
      title: "AAS Construction Management (60 credits)",
      steps: AAS_CONSTRUCTION_MANAGEMENT_TERMS.map((term) => step(
        term.term,
        `Term ${term.term}`,
        `${term.courses.length} courses - complete in sequence.`,
        term.courses,
        { phase: "degree", degreeLevel: "AAS" },
      )),
    };
  }
  if (topicKey === "bs-construction-management") {
    return {
      pathwayKey: "degree",
      topicKey,
      title: "BS Construction Management (120 credits)",
      steps: BS_CONSTRUCTION_MANAGEMENT_YEARS.map((year) => step(
        year.year,
        year.label,
        `${year.courseCount} courses in year ${year.year}.`,
        [],
        { phase: "degree", degreeLevel: "BS", advisory: true },
      )),
    };
  }
  return null;
}

export function getFcaHowToSequence() {
  return {
    pathwayKey: "fca-how-to",
    title: "FCA operator guide sequence",
    steps: FCA_HOWTO_SEQUENCE.map((item) => step(
      item.order,
      item.title,
      "Auricrux-led Contractor Command operator training.",
      [item.key],
      { phase: "fca-how-to", topicKey: item.topicKey },
    )),
  };
}

export function getPathwayRecommendedSequence(pathwayKey, options = {}) {
  const { topicKey, tradeKey } = options;
  if (pathwayKey === "apprenticeship") {
    return getApprenticeshipCareerSequence(tradeKey || topicKey || "electrical");
  }
  if (pathwayKey === "certification" && topicKey) {
    return getCertificationSequence(topicKey);
  }
  if (pathwayKey === "licensure" && topicKey) {
    return getLicensureSequence(topicKey);
  }
  if (pathwayKey === "degree" && topicKey) {
    return getDegreeSequence(topicKey);
  }
  if (pathwayKey === "fca-how-to") {
    return getFcaHowToSequence();
  }
  return null;
}

export function resolveSequenceStepStatus(stepDef, enrollments = []) {
  const keys = stepDef.programKeys || [];
  if (!keys.length) return { status: "advisory", progressPercent: 0 };
  const matches = enrollments.filter((item) => keys.includes(item.programKey));
  if (!matches.length) return { status: "not-started", progressPercent: 0 };
  const best = matches.reduce((a, b) => (b.progressPercent || 0) > (a.progressPercent || 0) ? b : a);
  if ((best.progressPercent || 0) >= 100) return { status: "complete", progressPercent: 100, enrollment: best };
  if ((best.progressPercent || 0) > 0) return { status: "in-progress", progressPercent: best.progressPercent, enrollment: best };
  return { status: "enrolled", progressPercent: best.progressPercent || 0, enrollment: best };
}

export const APPRENTICESHIP_TRADE_OPTIONS = APPRENTICESHIP_TRADES.map((trade) => ({
  key: trade.key,
  label: trade.label,
}));
