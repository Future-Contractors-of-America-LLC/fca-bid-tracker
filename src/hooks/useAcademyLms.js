import { useEffect, useMemo, useState } from "react";
import { fetchAcademyLms, mutateAcademyLms, exportAcademyTranscript } from "../api/academyClient";
import { appendAutomationLog } from "../sessionAutomationLog";
import { appendCommercialLog } from "../sessionCommercialLog";

function buildFallbackState() {
  return {
    learners: [],
    enrollments: [],
    certificates: [],
    catalog: { programs: [], totalPrograms: 0, lanes: [], pathways: [] },
    catalogIntegrity: { aligned: false, expectedTotalPrograms: 1212, actualTotalPrograms: 0 },
    summary: {
      learnerCount: 0,
      activeEnrollmentCount: 0,
      completedEnrollmentCount: 0,
      issuedCertificateCount: 0,
      updatedAt: null,
    },
    backingSource: "unavailable",
  };
}

export default function useAcademyLms() {
  const [academyState, setAcademyState] = useState(buildFallbackState);
  const [meta, setMeta] = useState({
    backingSource: "unavailable",
    persistenceState: "Academy API pending",
    lastSyncedAt: null,
  });

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const payload = await fetchAcademyLms();
        if (!active) return;
        setAcademyState(payload);
        setMeta({
          backingSource: payload.backingSource || "api-academy-store",
          persistenceState: "API academy LMS spine active",
          lastSyncedAt: new Date().toISOString(),
        });
      } catch {
        if (!active) return;
        setAcademyState(buildFallbackState());
        setMeta({
          backingSource: "unavailable",
          persistenceState: "Academy API unavailable",
          lastSyncedAt: null,
        });
      }
    }

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  return useMemo(() => ({
    academyState,
    meta,
    async assignProgram(learnerId, programKey, coach = "Auricrux", assignedProjectId = "", profile = {}) {
      const payload = await mutateAcademyLms("assign-program", {
        learnerId,
        programKey,
        coach,
        assignedProjectId,
        email: profile.email || (String(learnerId).includes("@") ? learnerId : undefined),
        fullName: profile.fullName,
        role: profile.role,
      });
      setAcademyState(payload);
      setMeta({ backingSource: payload.backingSource || "api-academy-store", persistenceState: "API academy assignment active", lastSyncedAt: new Date().toISOString() });
      appendAutomationLog({ type: "academy-assignment", title: `${learnerId} assigned to ${programKey}`, detail: `Auricrux assigned ${learnerId} into ${programKey} and preserved workforce continuity.`, route: "/academy" });
      appendCommercialLog({ type: "academy-assignment", title: `${learnerId} assignment activated`, detail: `Academy assignment now supports project readiness and customer delivery continuity.`, route: "/academy" });
      return payload;
    },
    async advanceProgress(enrollmentId, progressDelta = 20, nextLesson = "Advance next module") {
      const payload = await mutateAcademyLms("advance-progress", { enrollmentId, progressDelta, nextLesson });
      setAcademyState(payload);
      setMeta({ backingSource: payload.backingSource || "api-academy-store", persistenceState: "API academy progress active", lastSyncedAt: new Date().toISOString() });
      appendAutomationLog({ type: "academy-progress", title: `${enrollmentId} progressed`, detail: `Auricrux advanced academy progress for ${enrollmentId}.`, route: "/academy" });
      appendCommercialLog({ type: "academy-progress", title: `${enrollmentId} learner progress advanced`, detail: `Learner progress now supports mobilization and readiness continuity.`, route: "/academy" });
      return payload;
    },
    async completeModule(enrollmentId, { moduleNumber, moduleTitle, nextLesson, knowledgeCheckScore, instructorOverride } = {}) {
      const payload = await mutateAcademyLms("complete-module", {
        enrollmentId,
        moduleNumber,
        moduleTitle,
        nextLesson,
        knowledgeCheckScore,
        instructorOverride,
      });
      setAcademyState(payload);
      setMeta({ backingSource: payload.backingSource || "api-academy-store", persistenceState: "API academy module completion active", lastSyncedAt: new Date().toISOString() });
      appendAutomationLog({ type: "academy-module", title: `${enrollmentId} completed module ${moduleNumber}`, detail: moduleTitle || `Module ${moduleNumber} marked complete.`, route: "/academy" });
      return payload;
    },
    async issueCertificate(enrollmentId) {
      const payload = await mutateAcademyLms("issue-certificate", { enrollmentId });
      setAcademyState(payload);
      setMeta({ backingSource: payload.backingSource || "api-academy-store", persistenceState: "API academy certificate issuance active", lastSyncedAt: new Date().toISOString() });
      appendAutomationLog({ type: "academy-certificate", title: `${enrollmentId} certificate issued`, detail: `Auricrux issued the completion credential for ${enrollmentId}.`, route: "/academy" });
      appendCommercialLog({ type: "academy-certificate", title: `${enrollmentId} credential issued`, detail: `Credential issuance now reinforces customer trust and workforce readiness continuity.`, route: "/academy" });
      return payload;
    },

    async registerIepAccommodations(learnerId, accommodations, documentationRef = "IEP/504 on file") {
      const payload = await mutateAcademyLms("set-accommodations", { learnerId, accommodations, documentationRef });
      setAcademyState(payload);
      setMeta({ backingSource: payload.backingSource || "api-academy-store", persistenceState: "IEP accommodations saved", lastSyncedAt: new Date().toISOString() });
      return payload;
    },
    async startProctoredAssessment({ learnerId, enrollmentId, assessmentId, assessmentKind = "exams" }) {
      const payload = await mutateAcademyLms("start-proctored-assessment", { learnerId, enrollmentId, assessmentId, assessmentKind });
      setAcademyState(payload);
      return payload.proctorSession;
    },
    async submitAssessment({ learnerId, enrollmentId, assessmentId, assessmentKind = "quizzes", answers, proctorSessionId }) {
      const payload = await mutateAcademyLms("submit-assessment", { learnerId, enrollmentId, assessmentId, assessmentKind, answers, proctorSessionId });
      setAcademyState(payload);
      return payload.assessmentOutcome;
    },
    async checkPrerequisiteGates(learnerId, programKey) {
      const payload = await mutateAcademyLms("check-prerequisite-gates", { learnerId, programKey });
      setAcademyState(payload);
      return payload.prerequisiteGateResult;
    },
    async exportTranscript(learnerId) {
      const payload = await exportAcademyTranscript(learnerId);
      setAcademyState(payload);
      setMeta({ backingSource: payload.backingSource || "api-academy-store", persistenceState: "API academy transcript export active", lastSyncedAt: new Date().toISOString() });
      return payload;
    },
  }), [academyState, meta]);
}
