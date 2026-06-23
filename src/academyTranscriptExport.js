export const TRANSCRIPT_COMPLIANCE_DISCLAIMER =
  "Programs reflect curriculum alignment and exam preparation only. FCA Academy is not a regionally accredited degree-granting institution, registered apprenticeship sponsor, or state licensing authority. Board acceptance and credential issuance are determined by the governing agency.";

export function resolveProgramComplianceLine(program = {}, catalogPrograms = []) {
  const catalog = catalogPrograms.find((item) => item.key === program.programKey) || {};
  const lane = program.lane || catalog.lane;
  const lines = [];

  if (lane === "certification") {
    const agency = catalog.issuingAgency || program.issuingAgency;
    if (agency) lines.push(`Certification alignment: ${agency}`);
    if (catalog.governingBodies?.length) lines.push(`Governing bodies: ${catalog.governingBodies.join(", ")}`);
  }
  if (lane === "apprenticeship") {
    const sponsor = catalog.apprenticeshipSponsor || program.apprenticeshipSponsor;
    if (sponsor) lines.push(`Apprenticeship alignment: ${sponsor}`);
    if (catalog.journeymanHours) lines.push(`OJT hours target: ${catalog.journeymanHours.toLocaleString()}`);
  }
  if (lane === "degree") {
    const acc = catalog.accreditationBody || program.accreditationBody;
    if (acc) lines.push(`Academic alignment: ${acc}`);
    if (catalog.regionalAccreditation) lines.push(catalog.regionalAccreditation);
  }
  if (lane === "licensure") {
    const board = catalog.licensureBoard || program.licensureBoard;
    if (board) lines.push(`Licensure board alignment: ${board}`);
    if (catalog.stateCode) lines.push(`Jurisdiction: ${catalog.stateCode}`);
    if (catalog.licensureScope === "multi-state") lines.push("Multi-state exam prep scope");
  }
  if (program.ceuHours) lines.push(`CEU hours: ${program.ceuHours}`);

  return lines;
}

export function buildTranscriptComplianceFootnotes(transcript, catalogPrograms = []) {
  const programs = transcript?.programs || [];
  return programs
    .map((program) => ({
      programKey: program.programKey,
      programTitle: program.programTitle,
      lines: program.complianceAlignment
        ? Object.entries(program.complianceAlignment).filter(([, value]) => value).map(([key, value]) => {
          if (Array.isArray(value)) return `${key}: ${value.join(", ")}`;
          return `${key}: ${value}`;
        })
        : resolveProgramComplianceLine(program, catalogPrograms),
    }))
    .filter((entry) => entry.lines.length > 0);
}

export function triggerTranscriptPdfPrint() {
  document.body.classList.add("fca-print-transcript");
  requestAnimationFrame(() => {
    window.print();
    setTimeout(() => document.body.classList.remove("fca-print-transcript"), 500);
  });
}

export function resolveCatalogComplianceHint(programKey, catalogPrograms = []) {
  const program = catalogPrograms.find((item) => item.key === programKey);
  if (!program) return [];
  const meta = program;
  if (meta.lane === "certification" && meta.issuingAgency) {
    return [`Aligned with ${meta.issuingAgency}`];
  }
  if (meta.lane === "apprenticeship" && meta.apprenticeshipSponsor) {
    return [meta.apprenticeshipSponsor];
  }
  if (meta.lane === "degree" && meta.accreditationBody) {
    return [meta.accreditationBody];
  }
  if (meta.lane === "licensure" && meta.licensureBoard) {
    return [meta.licensureBoard];
  }
  return [];
}

export function certificateComplianceFootnote(programKey, catalogPrograms = []) {
  const program = catalogPrograms.find((item) => item.key === programKey);
  if (!program) return TRANSCRIPT_COMPLIANCE_DISCLAIMER;
  const hints = resolveCatalogComplianceHint(programKey, catalogPrograms);
  if (!hints.length) return TRANSCRIPT_COMPLIANCE_DISCLAIMER;
  return `${hints.join(" | ")}. ${TRANSCRIPT_COMPLIANCE_DISCLAIMER}`;
}
