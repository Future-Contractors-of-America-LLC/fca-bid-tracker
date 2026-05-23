export default function Home() {
  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Future Contractors of America</h1>

      <p>
        Unified Construction Platform: SaaS + Academy + Portal
      </p>
      <div style={{ marginTop: "20px" }}>
        <a href="/tyler-entry/">Open Bid Entry (Product UI)</a>
      </div>
      <div style={{ marginTop: "10px" }}>
        <a href="/tyler-status/">Open Bid Status (Product UI)</a>
      </div>

      <div style={{ marginTop: "30px" }}>
        <a href="/portal">Go to Customer Portal</a>
      </div>

      <div style={{ marginTop: "10px" }}>
        <a href="/academy">Go to Academy</a>
      </div>
    </div>
  );
}