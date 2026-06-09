const cardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 14,
  padding: 18,
  background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function CustomerOwnershipWitnessPanel({ session, stateMeta, projects = [], files = [], estimates = [] }) {
  const projectList = stateMeta?.projectIds || [];

  return (
    <div style={cardStyle}>
      <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Customer ownership witness</div>
      <h2 style={{ marginTop: 0, marginBottom: 10 }}>This workspace proves what the authenticated customer actually owns</h2>
      <div style={{ color: "#334155", lineHeight: 1.8 }}>
        <div><strong>Customer:</strong> {session?.company || stateMeta?.authenticatedCustomer || "Continuity shell visitor"}</div>
        <div><strong>Primary project:</strong> {stateMeta?.primaryProjectId || "A-117"}</div>
        <div><strong>Project ownership set:</strong> {projectList.join(", ") || "A-117"}</div>
        <div><strong>File scope:</strong> {stateMeta?.fileScope || "project-owned"}</div>
        <div><strong>Visible projects:</strong> {projects.length}</div>
        <div><strong>Visible files:</strong> {files.length}</div>
        <div><strong>Visible estimate packets:</strong> {estimates.length}</div>
      </div>
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {projects.map((project) => (
          <div key={project.id} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#f8fbff" }}>
            <div style={{ fontWeight: 700 }}>{project.canonicalProjectId}</div>
            <div style={{ color: "#475569", lineHeight: 1.6, marginTop: 6 }}>
              <div><strong>Customer:</strong> {project.customer}</div>
              <div><strong>Stage:</strong> {project.stage}</div>
              <div><strong>Files:</strong> {files.filter((file) => file.projectId === project.id).length}</div>
              <div><strong>Estimate:</strong> {estimates.find((estimate) => estimate.projectId === project.id)?.estimateStatus || "Not visible"}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
