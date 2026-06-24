/** Weighted Go/No-Go scoring for construction bid qualification (iRecruit 80/60 model). */

const WEIGHTS = {
  plansReceived: 15,
  siteWalkComplete: 15,
  budgetConfirmed: 20,
  decisionMakerIdentified: 20,
  tradeLevelingComplete: 15,
  jurisdictionReviewed: 15,
};

export function scoreBidQualification(bid = {}) {
  const checklist = bid.checklist || {};
  let earned = 0;
  let possible = 0;
  const factors = [];

  for (const [key, weight] of Object.entries(WEIGHTS)) {
    possible += weight;
    const complete = checklist[key] === true;
    if (complete) earned += weight;
    factors.push({
      key,
      label: key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
      weight,
      complete,
    });
  }

  const numericScore = possible ? Math.round((earned / possible) * 100) : 0;
  let recommendation = "no-go";
  let tone = "red";
  if (numericScore >= 80) {
    recommendation = "go";
    tone = "green";
  } else if (numericScore >= 60) {
    recommendation = "review";
    tone = "amber";
  }

  return {
    numericScore,
    recommendation,
    tone,
    factors,
    summary:
      recommendation === "go"
        ? "Pursue - qualification posture supports estimate and proposal advancement."
        : recommendation === "review"
          ? "Review - close remaining checklist gaps before committing estimating capacity."
          : "No-go - defer or decline until qualification evidence improves.",
  };
}

export function detectPipelineStagnation(bid = {}, thresholds = { qualifyDays: 7, estimateDays: 14 }) {
  const updatedAt = bid.updatedAt || bid.lastActionAt;
  if (!updatedAt) return null;
  const ageMs = Date.now() - new Date(updatedAt).getTime();
  const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
  const status = (bid.qualification?.status || bid.status || "").toLowerCase();

  if (status.includes("qualified") || status.includes("estimate")) {
    if (ageDays >= thresholds.estimateDays) {
      return {
        level: "warn",
        ageDays,
        message: `Opportunity stagnant ${ageDays}d in estimate posture - route to proposal or record no-bid.`,
      };
    }
  } else if (ageDays >= thresholds.qualifyDays) {
    return {
      level: "info",
      ageDays,
      message: `Lead received ${ageDays}d ago - complete Go/No-Go scoring and qualification checklist.`,
    };
  }
  return null;
}
