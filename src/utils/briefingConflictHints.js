/** Cross-document conflict hints for governed briefings (Helonic-style matrix). */

export function buildBriefingConflictHints(file = {}, projectFiles = []) {
  const hints = [];
  const discipline = String(file.discipline || file.category || "").toLowerCase();
  const name = String(file.name || "").toLowerCase();

  const specFiles = projectFiles.filter((item) => /spec|submittal|contract/i.test(`${item.name} ${item.category}`));
  const drawingFiles = projectFiles.filter((item) => /plan|dwg|sheet|drawing/i.test(`${item.name} ${item.category}`));

  if (/arch|a-/.test(discipline + name) && specFiles.length) {
    hints.push({
      id: "spec-drawing-drift",
      severity: "medium",
      message: "Compare architectural sheet call-outs against registered spec sections before estimate lock.",
      relatedCount: specFiles.length,
    });
  }

  if (/struct|s-/.test(discipline + name) && drawingFiles.length > 1) {
    hints.push({
      id: "struct-coordination",
      severity: "high",
      message: "Structural plan set should be cross-checked with MEP penetrations and RFI history.",
      relatedCount: drawingFiles.length,
    });
  }

  if (file.briefingDetectedGaps?.length) {
    hints.push({
      id: "briefing-gaps",
      severity: "high",
      message: `${file.briefingDetectedGaps.length} governed gap(s) flagged in this briefing - resolve before award.`,
      relatedCount: file.briefingDetectedGaps.length,
    });
  }

  return hints;
}
