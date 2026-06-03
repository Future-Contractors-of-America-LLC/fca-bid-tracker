import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import { auricruxCapabilities } from "../../websiteShell";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function AuricruxPage() {
  return (
    <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 1120, margin: "0 auto" }}>
      <ShellHeader
        eyebrow="Auricrux Operating Layer"
        title="Auricrux stays visible across the shell"
        subtitle="Auricrux is presented as the intelligence and execution layer that helps customers understand state, prioritize actions, and maintain continuity across FCA surfaces."
        primaryHref="/portal"
        primaryLabel="See Auricrux in Portal"
        secondaryHref="/platform"
        secondaryLabel="View Platform"
      />

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>What Auricrux is doing in this demo shell</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {auricruxCapabilities.map((item) => (
              <div key={item} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Visible surfaces</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.9 }}>
            <li>Persistent dock across the shell</li>
            <li>Portal next-action visibility</li>
            <li>Academy coaching continuity</li>
            <li>Founder demo narration support</li>
          </ul>
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Why this matters commercially</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
          Auricrux makes the shell feel active rather than static. Instead of showing disconnected pages, FCA can demonstrate an operating layer that gives context, next actions, and continuity as customers move between sales, execution, training, and account support surfaces.
        </p>
      </div>

      <ShellFooter />
    </div>
  );
}
