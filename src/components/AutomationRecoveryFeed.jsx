import { readAutomationLog } from "../sessionAutomationLog";

const shellStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 16,
  padding: 18,
  background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
  marginBottom: 24,
};

const itemStyle = {
  borderBottom: "1px solid #dbe3ef",
  padding: "12px 0",
};

export default function AutomationRecoveryFeed({ title = "Automation recovery feed", detail = "Recent Auricrux session mutations and recovery actions remain visible across routes so state repair does not disappear after a single click." }) {
  const items = readAutomationLog();

  if (!items.length) return null;

  return (
    <div style={shellStyle}>
      <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Cross-route automation memory</div>
      <h2 style={{ marginTop: 0, marginBottom: 8 }}>{title}</h2>
      <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>{detail}</div>

      {items.map((item, index) => (
        <div key={item.id} style={{ ...itemStyle, borderBottom: index === items.length - 1 ? "none" : itemStyle.borderBottom }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontWeight: 700, color: "#111827" }}>{item.title}</div>
            <div style={{ fontSize: 12, color: "#2563eb", fontWeight: 700 }}>{item.type}</div>
          </div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginTop: 4 }}>{item.detail}</div>
          <div style={{ color: "#64748b", fontSize: 13, marginTop: 6 }}>{item.route} · {item.createdAt}</div>
        </div>
      ))}
    </div>
  );
}
