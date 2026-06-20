import { academyCatalog } from "./academyCatalog.js";
import {
  formatAddonLabel,
  formatPlanLabel,
  planMeetsMinimum,
  resolveProgramCatalogMeta,
} from "./academyCatalogTaxonomy.js";

export function evaluateEnrollmentAccess({ session, programKey, enrollments = [] }) {
  const program = academyCatalog.programs.find((item) => item.key === programKey);
  const meta = resolveProgramCatalogMeta({ key: programKey, ...(program || {}) });
  const enrollment = meta.enrollment || {};
  const gates = [];
  const blockers = [];

  if (enrollment.requiresAuth && !session?.email && !session?.customerId) {
    blockers.push({ code: "auth", message: "Sign in to enroll in this course.", actionHref: "/login", actionLabel: "Sign in" });
  }

  if (enrollment.minimumPlan && !planMeetsMinimum(session?.selectedPlan, enrollment.minimumPlan)) {
    blockers.push({
      code: "plan",
      message: `Requires ${formatPlanLabel(enrollment.minimumPlan)} or higher.`,
      actionHref: "/pricing",
      actionLabel: "Review plans",
    });
  }

  if (enrollment.addonKey && session?.enabledProducts && session.enabledProducts.lms === false) {
    blockers.push({
      code: "lms",
      message: "Academy LMS access is not enabled on your workspace.",
      actionHref: "/pricing",
      actionLabel: "Enable Academy",
    });
  }

  if (enrollment.addonKey) {
    gates.push({
      code: "addon",
      label: formatAddonLabel(enrollment.addonKey),
      detail: "Included with eligible subscriptions or available as a workspace add-on.",
    });
  }

  const prerequisiteKeys = enrollment.prerequisiteProgramKeys || [];
  const completedKeys = new Set(
    (enrollments || [])
      .filter((item) => (item.progressPercent || 0) >= 100 || item.status === "completed")
      .map((item) => item.programKey),
  );

  for (const prerequisiteKey of prerequisiteKeys) {
    const prerequisite = academyCatalog.programs.find((item) => item.key === prerequisiteKey);
    if (!completedKeys.has(prerequisiteKey)) {
      blockers.push({
        code: "prerequisite",
        message: `Complete ${prerequisite?.title || prerequisiteKey} before enrolling.`,
        actionHref: `/academy/programs/${prerequisiteKey}`,
        actionLabel: "View prerequisite",
      });
    } else {
      gates.push({
        code: "prerequisite-met",
        label: `Prerequisite met: ${prerequisite?.title || prerequisiteKey}`,
      });
    }
  }

  if (enrollment.minimumPlan) {
    gates.push({
      code: "plan",
      label: `Minimum plan: ${formatPlanLabel(enrollment.minimumPlan)}`,
    });
  }

  return {
    canEnroll: blockers.length === 0,
    syllabusPublic: enrollment.syllabusPublic !== false,
    blockers,
    gates,
    meta,
  };
}
