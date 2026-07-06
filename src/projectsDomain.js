export function parseCurrency(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  const numeric = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

export function formatUsd(value) {
  return `$${Math.round(value || 0).toLocaleString()}`;
}

export function inferProjectHealth({ scheduleVariance, costVariance, riskExposure }) {
  const score = Math.max(0, Math.min(100, Math.round(100 - (scheduleVariance * 0.35 + costVariance * 0.4 + riskExposure * 0.25))));
  const level = score >= 80 ? "Green" : score >= 60 ? "Yellow" : "Red";
  return { score, level };
}

export function negativeMessageRisk(messages, projectId) {
  if (!projectId || !messages.length) return 0;
  const riskTerms = /(delay|dispute|frustrat|claim|risk|escalat|behind|late|overrun|hold)/i;
  const related = messages.filter((item) => {
    const hay = `${item.subject || ""} ${item.message || ""} ${item.preview || ""}`.toLowerCase();
    return hay.includes(String(projectId).toLowerCase());
  });
  if (!related.length) return 0;
  const hits = related.filter((item) => riskTerms.test(`${item.subject || ""} ${item.message || ""} ${item.preview || ""}`)).length;
  return Math.min(100, Math.round((hits / related.length) * 100));
}

export function checkGateRequirement(requirement, context) {
  if (requirement.type === "file-tag-approved") {
    const hit = (context.projectFiles || []).find((file) => {
      const hay = `${file.name || ""} ${file.category || ""} ${file.status || ""} ${file.evidenceStatus || ""}`.toLowerCase();
      const tags = requirement.tags || [];
      return tags.every((tag) => hay.includes(String(tag).toLowerCase())) && /(approved|verified|ready)/i.test(hay);
    });
    return {
      pass: Boolean(hit),
      message: hit ? `Approved evidence found: ${hit.name}` : requirement.message,
    };
  }

  if (requirement.type === "project-flag") {
    const value = context.project?.[requirement.field];
    const pass = String(value || "").toLowerCase().includes(String(requirement.valueContains || "").toLowerCase());
    return {
      pass,
      message: pass ? `${requirement.field} satisfied.` : requirement.message,
    };
  }

  return { pass: true, message: "Requirement type not configured." };
}

export function findStageGate(currentStage, targetStage, governance) {
  const rules = governance?.projectStageGates || [];
  return rules.find((rule) => rule.fromStage === currentStage && rule.toStage === targetStage) || null;
}

export function latestByDate(items, dateFieldCandidates = ["updatedAt", "time", "date", "createdAt"]) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return [...items]
    .sort((a, b) => {
      const da = dateFieldCandidates.map((field) => Date.parse(a?.[field] || "")).find((value) => Number.isFinite(value)) || 0;
      const db = dateFieldCandidates.map((field) => Date.parse(b?.[field] || "")).find((value) => Number.isFinite(value)) || 0;
      return db - da;
    })[0];
}
