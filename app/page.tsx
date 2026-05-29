export default function Home() {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>

      {/* HEADER */}
      <h1 style={{ fontSize: "36px", marginBottom: "10px" }}>
        Future Contractors of America
      </h1>

      <p style={{ fontSize: "18px", color: "#555" }}>
        The Operating System for Construction.
      </p>

      <hr style={{ margin: "30px 0" }} />

      {/* SYSTEM OVERVIEW */}
      <div style={{ marginBottom: "40px" }}>
        <h2>Platform Overview</h2>

        <p>
          FCA integrates education, operations, and execution into one unified system.
        </p>

        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "20px"
        }}>
          <div>SaaS</div>
          <div>Academy</div>
          <div>Operations</div>
          <div>Auricrux</div>
        </div>
      </div>

      {/* PRIMARY ACTIONS */}
      <div style={{ marginBottom: "30px" }}>
        <a href="/login">
          <button style={{
            padding: "12px 20px",
            fontSize: "16px",
            marginRight: "10px"
          }}>
            Enter FCA
          </button>
        </a>

        <a href="/demo">
          <button style={{
            padding: "12px 20px",

