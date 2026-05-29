import AuricruxPanel from "../../components/AuricruxPanel";

export default function Dashboard() {
  return (
    <div>
      <h2>FCA Command Center</h2>

      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>

        <div style={{border: "1px solid #ccc", padding: "10px"}}>
          <h3>Projects</h3>
          <p>No active projects</p>
        </div>

        <div style={{border: "1px solid #ccc", padding: "10px"}}>
          <h3>Academy</h3>
          <p>Training modules loading...</p>
        </div>

      </div>

      <AuricruxPanel />
    </div>
  );
}
