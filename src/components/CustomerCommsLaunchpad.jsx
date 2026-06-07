const channels = [
  { key: "chat", label: "Chat", hash: "#chat", detail: "Text-first coordination for fast project and customer follow-through." },
  { key: "sms", label: "SMS", hash: "#sms", detail: "Short-form field escalation and rapid customer follow-up." },
  { key: "phone", label: "Phone", hash: "#phone", detail: "Live recovery and urgent project coordination." },
  { key: "email", label: "Email", hash: "#email", detail: "Commercial, billing, document, and executive continuity." },
  { key: "teams", label: "Teams", hash: "#teams", detail: "Structured internal and customer collaboration space." },
  { key: "conference", label: "Conference", hash: "#conference", detail: "Multi-party operating reviews and executive walkthroughs." },
  { key: "lecture", label: "Lecture", hash: "#lecture", detail: "Academy-led training, workforce instruction, and rollout continuity." },
];

export default function CustomerCommsLaunchpad({ session, title = "Open live communication lanes" }) {
  if (!session?.authenticated) return null;

  const enabledComms = session.enabledComms || {
    chat: true,
    sms: true,
    phone: true,
    email: true,
    teams: true,
    conference: true,
    lecture: true,
  };

  return (
    <div
      style={{
        border: "1px solid #dbe3ef",
        borderRadius: 16,
        padding: 18,
        background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)",
        boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
        marginBottom: 24,
      }}
    >
      <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Authenticated communications launchpad</div>
      <h2 style={{ marginTop: 0, marginBottom: 10 }}>{title}</h2>
      <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 14 }}>
        {session.workspaceLabel} can open real communications lanes inside the live customer shell. Each lane routes into the shared Auricrux messages workspace with the correct focus preserved.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {channels.map((channel) => {
          const enabled = enabledComms[channel.key] !== false;
          return (
            <div key={channel.key} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#fff" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>
                {channel.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "#111827" }}>
                {enabled ? "Enabled" : "Pending"}
              </div>
              <div style={{ color: "#475569", lineHeight: 1.6, marginBottom: 12 }}>{channel.detail}</div>
              <a
                href={enabled ? `/portal/messages${channel.hash}` : "/portal/profile"}
                style={{
                  display: "inline-block",
                  textDecoration: "none",
                  background: enabled ? "#111827" : "#cbd5e1",
                  color: enabled ? "#fff" : "#475569",
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontWeight: 700,
                  pointerEvents: enabled ? "auto" : "none",
                }}
              >
                {enabled ? `Open ${channel.label}` : `${channel.label} Unavailable`}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
