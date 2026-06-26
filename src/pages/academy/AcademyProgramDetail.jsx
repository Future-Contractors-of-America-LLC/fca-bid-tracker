import { useEffect, useMemo, useState } from "react";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import useAcademyLms from "../../hooks/useAcademyLms";
import useCustomerSession from "../../hooks/useCustomerSession";
import { fetchAcademyProgram } from "../../api/academyClient";
import { evaluateEnrollmentAccess } from "../../academyEnrollmentAccess";
import { findCatalogPlacement } from "../../academyOfferings";
import { resolveProgramCatalogMeta, formatAddonLabel, formatPlanLabel, getPathwayByKey, getTopicByKey, getCertificationAgencyAlignment, getApprenticeshipCompliance, getDegreeAccreditationFootnote } from "../../academyCatalogTaxonomy";
import AcademyCourseChrome from "../../components/academy/AcademyCourseChrome";
import { academyPageStyle } from "../../academyDesignSystem";
import { academyCheckoutHref } from "../../commerceCheckout";
import AcademyBuyButton from "../../components/AcademyBuyButton";
import { academyCtaSets, shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { pageShellStyle } from "../../publicShellStyles";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

function moduleStatus(moduleNumber, enrollment) {
  const completed = enrollment?.completedModuleNumbers || [];
  if (completed.includes(moduleNumber)) return "complete";
  const next = (enrollment?.completedModules || 0) + 1;
  if (moduleNumber === next) return "current";
  if (moduleNumber <= (enrollment?.completedModules || 0) + 1) return "available";
  return "locked";
}

export default function AcademyProgramDetail({ routeParams = {} }) {
  const programId = routeParams.programId;
  const { session } = useCustomerSession();
  const { academyState, assignProgram } = useAcademyLms();
  const [programDetail, setProgramDetail] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [enrollBusy, setEnrollBusy] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const learnerId = session?.email || session?.customerId;

  const enrollment = useMemo(
    () => (academyState.enrollments || []).find((item) => item.programKey === programId && (!learnerId || item.learnerId === learnerId)),
    [academyState.enrollments, programId, learnerId],
  );

  useEffect(() => {
    if (!programId) return;
    setLoadError("");
    fetchAcademyProgram(programId)
      .then((payload) => setProgramDetail(payload))
      .catch((error) => setLoadError(error.message || "Unable to load program."));
  }, [programId]);

  const program = programDetail?.program;
  const modules = programDetail?.modules || [];
  const completionRequirements = programDetail?.completionRequirements;
  const catalogMeta = program ? resolveProgramCatalogMeta({ key: programId, ...program }) : null;
  const placement = catalogMeta ? findCatalogPlacement(catalogMeta.pathwayKey, catalogMeta.topicKey) : null;
  const access = evaluateEnrollmentAccess({
    session,
    programKey: programId,
    enrollments: academyState.enrollments || [],
  });

  const complianceFootnotes = useMemo(() => {
    if (!program || !catalogMeta) return [];
    const lines = [];
    const { pathwayKey, topicKey } = catalogMeta;
    if (pathwayKey === "certification") {
      const agency = program.issuingAgency || getCertificationAgencyAlignment(topicKey)?.primary;
      if (agency) lines.push({ label: "Certification alignment", value: `${agency}${program.governingBodies?.length ? ` · ${program.governingBodies.join(", ")}` : ""}` });
      if (program.renewalPolicy) lines.push({ label: "Renewal policy", value: program.renewalPolicy });
    }
    if (pathwayKey === "apprenticeship") {
      const trade = getApprenticeshipCompliance(topicKey);
      if (program.apprenticeshipSponsor || trade?.sponsor) lines.push({ label: "Apprenticeship alignment", value: program.apprenticeshipSponsor || trade.sponsor });
      if (program.journeymanHours || trade?.hours) lines.push({ label: "Journeyman OJT target", value: `${(program.journeymanHours || trade.hours).toLocaleString()} hours (varies by sponsor/state)` });
      if (program.ratioRequirements) lines.push({ label: "Supervision ratio", value: program.ratioRequirements });
      if (program.curriculumAlignment) lines.push({ label: "Curriculum", value: program.curriculumAlignment });
    }
    if (pathwayKey === "degree") {
      const acc = getDegreeAccreditationFootnote(program.degreeLevel || catalogMeta.degreeLevel);
      lines.push({ label: "Accreditation alignment", value: program.accreditationBody || acc.accreditationBody });
      lines.push({ label: "Institutional status", value: program.regionalAccreditation || acc.regionalAccreditation });
      lines.push({ label: "Credit articulation", value: program.creditArticulation || acc.creditArticulation });
    }
    if (pathwayKey === "licensure") {
      if (program.licensureBoard) lines.push({ label: "Licensure board", value: program.licensureBoard });
      if (program.stateCode) lines.push({ label: "Jurisdiction", value: program.stateCode });
      if (program.examPrerequisites) lines.push({ label: "Exam prerequisites", value: program.examPrerequisites });
      if (program.renewalPolicy) lines.push({ label: "Renewal policy", value: program.renewalPolicy });
      if (program.licensureScope === "multi-state") lines.push({ label: "Scope", value: "Multi-state shared prep course" });
    }
    return lines;
  }, [program, catalogMeta]);

  async function enrollNow() {
    if (!programId) return;
    if (!access.canEnroll) {
      const firstBlocker = access.blockers[0];
      setActionMessage(firstBlocker?.message || "Enrollment requirements not met.");
      return;
    }
    if (!learnerId) {
      setActionMessage("Sign in to enroll in this course.");
      return;
    }
    setEnrollBusy(true);
    setActionMessage("");
    try {
      await assignProgram(learnerId, programId, "Auricrux", "", {
        email: learnerId,
        fullName: session?.displayName || session?.companyName || session?.customerName,
      });
      setActionMessage("Enrollment active. Start with module 1 below.");
    } catch (error) {
      setActionMessage(error.message || "Unable to enroll in this program.");
    } finally {
      setEnrollBusy(false);
    }
  }

  return (
    <div style={{ ...pageShellStyle, ...academyPageStyle() }}>
      <ShellHeader
        compact
        eyebrow="Auricrux School of Construction"
        title={program?.title || "Program"}
        subtitle={program?.completionRule || program?.deliveryModel || "Module-based training with knowledge checks and practical labs."}
        primaryHref="/academy/dashboard"
        primaryLabel="Learner dashboard"
        secondaryHref="/academy/catalog"
        secondaryLabel="Back to catalog"
        journey={shellJourney}
        currentJourney="academy"
      />

      <AcademyCourseChrome
        program={program}
        modules={modules}
        enrollment={enrollment}
        pathwayKey={catalogMeta?.pathwayKey}
        topicKey={catalogMeta?.topicKey}
        showSidebar
      >
        {loadError ? (
          <div style={{ ...cardStyle, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b" }}>{loadError}</div>
        ) : null}

        {program ? (
          <div style={{ ...cardStyle, marginBottom: 0 }}>
            <div style={{ color: "#1d4ed8", fontWeight: 700, marginBottom: 6 }}>{program.credential}</div>
            {catalogMeta ? (
              <p style={{ color: "#475569", lineHeight: 1.7, marginTop: 0 }}>
                <strong>Pathway:</strong> {getPathwayByKey(catalogMeta.pathwayKey)?.label || catalogMeta.pathwayKey}
                {" · "}
                <strong>Topic:</strong> {getTopicByKey(catalogMeta.topicKey)?.label || catalogMeta.topicKey}
                {" · "}
                <strong>Modules:</strong> {modules.length || program.duration}
              </p>
            ) : (
              <p style={{ color: "#475569", lineHeight: 1.7 }}>
                <strong>Pathway:</strong> {program.pathway || "General"} | <strong>Track:</strong> {program.track || "Core"} | <strong>Level:</strong> {program.level || "-"} | <strong>Modules:</strong> {program.duration}
                {program.courseCode ? <> | <strong>Course:</strong> {program.courseCode}</> : null}
                {program.creditHours ? <> | <strong>Credits:</strong> {program.creditHours}</> : null}
              </p>
            )}
            {placement ? (
              <p style={{ marginTop: 0 }}>
                <a href={`/academy/catalog?pathway=${catalogMeta.pathwayKey}&topic=${catalogMeta.topicKey}`} style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>
                  Back to {placement.topic.label} in {placement.pathway.label}
                </a>
              </p>
            ) : null}
            {program.deliveryModel || program.format ? (
              <p style={{ color: "#334155", lineHeight: 1.65 }}>{program.deliveryModel || program.format}</p>
            ) : null}
            {program.goal ? <p style={{ color: "#334155", lineHeight: 1.65 }}>{program.goal}</p> : null}
            {Array.isArray(program.outcomes) && program.outcomes.length > 0 ? (
              <ul style={{ paddingLeft: 20, lineHeight: 1.85, color: "#334155" }}>
                {program.outcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            ) : null}

            {complianceFootnotes.length > 0 ? (
              <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <div style={{ fontWeight: 700, color: "#166534", marginBottom: 8 }}>Compliance and alignment</div>
                <dl style={{ margin: 0, lineHeight: 1.75, color: "#334155", fontSize: 14 }}>
                  {complianceFootnotes.map((item) => (
                    <div key={item.label} style={{ marginBottom: 8 }}>
                      <dt style={{ fontWeight: 700, color: "#0f172a", display: "inline" }}>{item.label}: </dt>
                      <dd style={{ display: "inline", margin: 0 }}>{item.value}</dd>
                    </div>
                  ))}
                </dl>
                <p style={{ fontSize: 12, color: "#64748b", marginBottom: 0, marginTop: 10 }}>
                  Alignment statements describe curriculum preparation. FCA Academy does not issue licenses, degrees, or registered apprenticeship credentials.
                </p>
              </div>
            ) : null}

            <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Public syllabus</div>
              <p style={{ color: "#475569", lineHeight: 1.65, marginTop: 0 }}>
                Full curriculum and module objectives are visible below. Enrollment unlocks progress tracking, knowledge checks, and credential completion.
              </p>
              {access.gates.length > 0 ? (
                <ul style={{ paddingLeft: 20, lineHeight: 1.8, color: "#334155", marginBottom: 0 }}>
                  {access.gates.map((gate) => (
                    <li key={`${gate.code}-${gate.label}`}>{gate.label}{gate.detail ? ` — ${gate.detail}` : ""}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            {enrollment ? (
              <div style={{ marginTop: 12 }}>
                <div style={{ color: "#334155", marginBottom: 8 }}>
                  <strong>Your progress:</strong> {enrollment.progressPercent}% | {enrollment.completedModules}/{enrollment.totalModules} modules
                </div>
                <div style={{ height: 10, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                  <div style={{ width: `${enrollment.progressPercent}%`, height: "100%", background: "#2563eb" }} />
                </div>
                {enrollment.progressPercent < 100 ? (
                  <a
                    href={`/academy/programs/${programId}/modules/${(enrollment.completedModules || 0) + 1}`}
                    style={{ display: "inline-block", marginTop: 12, border: "1px solid #2563eb", background: "#2563eb", color: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, textDecoration: "none" }}
                  >
                    Continue: Module {(enrollment.completedModules || 0) + 1}
                  </a>
                ) : (
                  <a href="/academy/credentials" style={{ display: "inline-block", marginTop: 12, color: "#15803d", fontWeight: 700, textDecoration: "none" }}>
                    Program complete - view credential
                  </a>
                )}
              </div>
            ) : (
              <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-start" }}>
                {access.blockers.length > 0 ? (
                  <div style={{ marginBottom: 12, padding: 12, borderRadius: 10, background: "#fffbeb", border: "1px solid #fde68a", width: "100%" }}>
                    <div style={{ fontWeight: 700, color: "#92400e", marginBottom: 8 }}>Enrollment requirements</div>
                    <ul style={{ paddingLeft: 20, lineHeight: 1.8, color: "#78350f", margin: 0 }}>
                      {access.blockers.map((blocker) => (
                        <li key={blocker.code}>
                          {blocker.message}{" "}
                          {blocker.actionHref ? (
                            <a href={blocker.actionHref} style={{ color: "#b45309", fontWeight: 600 }}>{blocker.actionLabel}</a>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div style={{ color: "#64748b", marginBottom: 4, width: "100%" }}>
                    Purchase to unlock full access, or enroll when your workspace already includes this program.
                  </div>
                )}
                <AcademyBuyButton
                  programKey={programId}
                  retailPrice={program.retailPrice}
                  lane={program.lane || catalogMeta?.pathwayKey}
                  buyerEmail={session?.email}
                />
                <button
                  type="button"
                  disabled={enrollBusy || !access.canEnroll}
                  onClick={enrollNow}
                  style={{
                    border: "1px solid #2563eb",
                    background: access.canEnroll ? "#fff" : "#f8fafc",
                    color: access.canEnroll ? "#2563eb" : "#94a3b8",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontWeight: 700,
                    cursor: access.canEnroll ? "pointer" : "not-allowed",
                  }}
                >
                  {enrollBusy ? "Enrolling..." : access.canEnroll ? "Enroll (included access)" : "Enrollment locked"}
                </button>
                {catalogMeta?.enrollment?.minimumPlan ? (
                  <div style={{ fontSize: 13, color: "#64748b", width: "100%" }}>
                    Minimum plan: {formatPlanLabel(catalogMeta.enrollment.minimumPlan)}
                    {catalogMeta.enrollment.addonKey ? ` · ${formatAddonLabel(catalogMeta.enrollment.addonKey)}` : ""}
                  </div>
                ) : null}
              </div>
            )}
            {actionMessage ? <div style={{ marginTop: 10, color: "#15803d" }}>{actionMessage}</div> : null}
          </div>
        ) : null}

        {completionRequirements ? (
          <div style={{ ...cardStyle, marginBottom: 16, background: "#f8fafc" }}>
            <h3 style={{ marginTop: 0 }}>Completion requirements</h3>
            <ul style={{ paddingLeft: 20, lineHeight: 1.85, color: "#334155", marginBottom: 0 }}>
              {Object.entries(completionRequirements).map(([key, value]) => (
                <li key={key}>{value}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div style={{ ...cardStyle, background: "#eff6ff", border: "1px solid #bfdbfe" }}>
          <h3 style={{ marginTop: 0, color: "#0c2340" }}>Course announcements</h3>
          <p style={{ color: "#475569", lineHeight: 1.7, marginTop: 0 }}>
            Select a module from the course navigation panel to open Auricrux lectures, skills demonstrations, labs, and knowledge checks.
            Syllabus objectives remain public; enrollment unlocks graded progress and credentials.
          </p>
        </div>
      </AcademyCourseChrome>

      <ShellFooter ctaSet={academyCtaSets.home} />
    </div>
  );
}
