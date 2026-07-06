import { readCteSafeProfile } from "./cteSafeModeConfig";

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","));
  return [headers.join(","), ...lines].join("\n");
}

function download(name, content, mime = "text/csv") {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(href);
}

export function exportVdoeCompetencyReport({ studentId, competencyRows = [], safetyRows = [], wblRows = [] } = {}) {
  const profile = readCteSafeProfile();
  const sid = studentId || profile.studentId;

  const scrRows = competencyRows.map((row) => ({
    studentId: sid,
    competencyId: row.competencyId || row.id || "",
    courseCode: row.courseCode || profile.courseCode,
    rating: row.rating ?? 1,
    verifiedByInstructorId: row.verifiedByInstructorId || profile.instructorId,
    completionTimestamp: row.completionTimestamp || "",
    evidenceFileHash: row.evidenceFileHash || "",
  }));

  const safetyExportRows = safetyRows.map((row) => ({
    studentId: sid,
    courseCode: row.courseCode || profile.courseCode,
    equipmentOrCategory: row.equipmentOrCategory || "GeneralLab",
    achievedPerfectScore: row.achievedPerfectScore === true ? "true" : "false",
    dateTested: row.dateTested || "",
    instructorWitnessSignoff: row.instructorWitnessSignoff || profile.instructorId,
  }));

  const wblExportRows = wblRows.map((row) => ({
    studentId: sid,
    wblType: row.wblType || "SchoolBasedEnterprise",
    associatedProjectId: row.associatedProjectId || "",
    hoursLogged: row.hoursLogged ?? 0,
    competenciesPracticedJson: JSON.stringify(row.competenciesPracticedJson || []),
    isVerifiedByInstructor: row.isVerifiedByInstructor === true ? "true" : "false",
  }));

  download(`vdoe-scr-${sid}.csv`, toCsv(scrRows.length ? scrRows : [{ studentId: sid, competencyId: "", courseCode: profile.courseCode, rating: "", verifiedByInstructorId: "", completionTimestamp: "", evidenceFileHash: "" }]));
  download(`vdoe-safety-${sid}.csv`, toCsv(safetyExportRows.length ? safetyExportRows : [{ studentId: sid, courseCode: profile.courseCode, equipmentOrCategory: "", achievedPerfectScore: "", dateTested: "", instructorWitnessSignoff: "" }]));
  download(`vdoe-wbl-${sid}.csv`, toCsv(wblExportRows.length ? wblExportRows : [{ studentId: sid, wblType: "", associatedProjectId: "", hoursLogged: "", competenciesPracticedJson: "", isVerifiedByInstructor: "" }]));

  return {
    ok: true,
    studentId: sid,
    generatedAt: new Date().toISOString(),
    counts: {
      competencies: scrRows.length,
      safety: safetyExportRows.length,
      wbl: wblExportRows.length,
    },
  };
}
