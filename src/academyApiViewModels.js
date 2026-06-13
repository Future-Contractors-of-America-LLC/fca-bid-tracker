import { academyCatalog } from "./academyCatalog";

export const cohortCatalog = [
  {
    cohortId: "COHORT-OPS-2026-SUMMER-A",
    programKey: "ops-core",
    title: "Operations Command Cohort",
    cadence: "Tuesday / Thursday executive seminar",
    startDate: "2026-07-07",
    seatLimit: 24,
    faculty: "Auricrux Executive Faculty",
  },
  {
    cohortId: "COHORT-PRECON-2026-SUMMER-A",
    programKey: "precon-estimating",
    title: "Preconstruction Strategy Cohort",
    cadence: "Monday / Wednesday estimating studio",
    startDate: "2026-07-06",
    seatLimit: 18,
    faculty: "Auricrux Preconstruction Faculty",
  },
  {
    cohortId: "COHORT-CTRL-2026-SUMMER-A",
    programKey: "project-controls",
    title: "Project Controls Governance Cohort",
    cadence: "Wednesday governance lab",
    startDate: "2026-07-08",
    seatLimit: 20,
    faculty: "Auricrux Project Controls Faculty",
  },
  {
    cohortId: "COHORT-FIELD-2026-SUMMER-A",
    programKey: "field-readiness",
    title: "Field Mobilization Cohort",
    cadence: "Friday field-readiness clinic",
    startDate: "2026-07-10",
    seatLimit: 30,
    faculty: "Auricrux Field Readiness Faculty",
  },
];

export function buildApiBackedTranscript(academyState = {}) {
  const learners = academyState.learners || [];
  const enrollments = academyState.enrollments || [];
  const certificates = academyState.certificates || [];

  return academyCatalog.programs.map((program) => {
    const programEnrollments = enrollments.filter((item) => item.programKey === program.key);
    const matchingEnrollment = programEnrollments[0] || null;
    const matchingLearner = matchingEnrollment ? learners.find((item) => item.learnerId === matchingEnrollment.learnerId) : learners.find((item) => item.assignedProgramKey === program.key) || null;
    const certificate = matchingEnrollment ? certificates.find((item) => item.enrollmentId === matchingEnrollment.enrollmentId) : null;

    const percentComplete = Number(matchingEnrollment?.progressPercent ?? matchingLearner?.progressPercent ?? 0);
    const completedLessons = Math.round((percentComplete / 100) * (program.courses.reduce((sum, course) => sum + course.lessonsData.length, 0)));
    const totalLessons = program.courses.reduce((sum, course) => sum + course.lessonsData.length, 0);

    return {
      programKey: program.key,
      title: program.title,
      credentialTitle: program.credential,
      completedLessons,
      totalLessons,
      completedCourses: matchingEnrollment?.status === "completed" ? program.courses.length : 0,
      totalCourses: program.courses.length,
      percentComplete,
      credentialReady: percentComplete >= 100,
      cohortTitle: cohortCatalog.find((item) => item.programKey === program.key)?.title || "No cohort assigned",
      cohortStatus: matchingEnrollment?.status || "not-enrolled",
      issuedCredential: certificate ? {
        credentialId: certificate.certificateId,
        issuedAt: certificate.issuedAt,
        issuer: "Auricrux Academic Control",
        honors: certificate.status === "issued" ? "Completed with API-backed issuance" : certificate.status,
      } : null,
      enrollmentId: matchingEnrollment?.enrollmentId || null,
      learnerId: matchingEnrollment?.learnerId || matchingLearner?.learnerId || null,
    };
  });
}

export function buildApiBackedCredentialLedger(academyState = {}) {
  return buildApiBackedTranscript(academyState).map((entry) => ({
    programKey: entry.programKey,
    title: entry.title,
    credentialTitle: entry.credentialTitle,
    readiness: entry.credentialReady ? "Ready for issuance" : "In progress",
    issuedStatus: entry.issuedCredential ? "Issued" : "Pending",
    issuedCredential: entry.issuedCredential,
    cohortStatus: entry.cohortStatus,
    percentComplete: entry.percentComplete,
    enrollmentId: entry.enrollmentId,
  }));
}

export function buildApiBackedCohorts(academyState = {}) {
  const enrollments = academyState.enrollments || [];
  return cohortCatalog.map((cohort) => {
    const enrollment = enrollments.find((item) => item.programKey === cohort.programKey && item.status !== "completed") || enrollments.find((item) => item.programKey === cohort.programKey) || null;
    return {
      ...cohort,
      enrollment,
    };
  });
}
