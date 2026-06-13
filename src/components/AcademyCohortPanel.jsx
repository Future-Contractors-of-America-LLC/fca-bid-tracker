import { buildProgramHref } from "../academyCatalog";
import { buildApiBackedCohorts } from "../academyApiViewModels";
import useAcademyLms from "../hooks/useAcademyLms";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const buttonStyle = {
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
};

export default function AcademyCohortPanel({ refreshKey = null }) {
  const { academyState, assignProgram, withdrawEnrollment } = useAcademyLms();
  const cohorts = buildApiBackedCohorts(academyState);
  const learners = academyState.learners || [];

  function resolveLearnerIdForProgram(programKey) {
    return learners.find((learner) => learner.assignedProgramKey === programKey)?.learnerId || learners[0]?.learnerId || null;
  }

  return (
    <div style={cardStyle} key={refreshKey || "academy-cohorts"}>
      <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Cohort operations</div>
      <h2 style={{ marginTop: 0, marginBottom: 10 }}>Enrollment, seat posture, and program cadence now read and mutate through the Academy API</h2>
      <div style={{ display: "grid", gap: 16 }}>
        {cohorts.map((cohort) => {
          const isEnrolled = cohort.enrollment && cohort.enrollment.status !== "withdrawn";
          const learnerId = cohort.enrollment?.learnerId || resolveLearnerIdForProgram(cohort.programKey);
          return (
            <div key={cohort.cohortId} style={{ border: "1px solid #dbe3ef", borderRadius: 14, padding: 16, background: "#f8fbff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ color: "#2563eb", fontWeight: 700 }}>{cohort.title}</div>
                  <div style={{ color: "#334155", lineHeight: 1.7, marginTop: 6 }}>
                    <div><strong>Cadence:</strong> {cohort.cadence}</div>
                    <div><strong>Start date:</strong> {cohort.startDate}</div>
                    <div><strong>Faculty:</strong> {cohort.faculty}</div>
                    <div><strong>Seat limit:</strong> {cohort.seatLimit}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700 }}>{cohort.enrollment?.status || "not-enrolled"}</div>
                  <div style={{ color: "#475569" }}>{cohort.cohortId}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
                <a href={buildProgramHref(cohort.programKey)} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>Open program pathway</a>
                {isEnrolled ? (
                  <button type="button" onClick={() => cohort.enrollment?.enrollmentId && withdrawEnrollment(cohort.enrollment.enrollmentId)} style={{ ...buttonStyle, border: "1px solid #f59e0b", background: "#fffbeb", color: "#92400e" }}>Withdraw from cohort</button>
                ) : (
                  <button
                    type="button"
                    disabled={!learnerId}
                    onClick={() => learnerId && assignProgram(learnerId, cohort.programKey)}
                    style={{ ...buttonStyle, border: "1px solid #2563eb", background: learnerId ? "#2563eb" : "#cbd5e1", color: "#fff" }}
                  >
                    Enroll in cohort
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
