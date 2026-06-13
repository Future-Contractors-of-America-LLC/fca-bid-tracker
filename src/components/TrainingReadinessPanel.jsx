import { resolveTrainingReadinessSnapshot } from "../academyProgressStore";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function TrainingReadinessPanel({ session, activeProject }) {
  const snapshot = resolveTrainingReadinessSnapshot(session, activeProject);

  return (
    <div style={cardStyle}>
      <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Training readiness</div>
      <h2 style={{ marginTop: 0, marginBottom: 10 }}>Project-linked training posture is now visible in the workspace</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 16, color: "#334155", lineHeight: 1.7 }}>
        <div>
          <strong>Tenant</strong>
          <div>{snapshot.tenantLabel}</div>
        </div>
        <div>
          <strong>Project</strong>
          <div>{snapshot.projectLabel}</div>
        </div>
        <div>
          <strong>Readiness</strong>
          <div>{snapshot.readinessLabel}</div>
        </div>
        <div>
          <strong>Average completion</strong>
          <div>{snapshot.completionAverage}%</div>
        </div>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {snapshot.programSnapshots.map((program) => (
          <div key={program.key} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 12, background: "#f8fbff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{program.title}</div>
                <div style={{ color: "#475569" }}>{program.credential}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700 }}>{program.percentComplete}%</div>
                <div style={{ color: "#475569" }}>{program.completedLessons}/{program.totalLessons} lessons</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
