import { findCapability } from "../capabilityCatalog";
import { openAuricruxAssistant } from "../auricruxAssistant";
import {
  portalButtonPrimary,
  portalButtonSecondary,
  portalCardStyle,
  portalEyebrowStyle,
  portalTokens,
} from "../portalDesignTokens";

const depthTone = {
  live: { ink: "#15803d", label: "Live tool" },
  guided: { ink: "#1d4ed8", label: "Guided / automatable" },
  expanding: { ink: "#b45309", label: "Expanding — open & automatable" },
};

/**
 * Makes the matched capability from the canonical catalog obvious on every tool page.
 */
export default function CapabilityModuleBanner({ href }) {
  const item = findCapability(href);
  if (!item) return null;
  const tone = depthTone[item.depth] || depthTone.expanding;

  return (
    <div style={{ ...portalCardStyle, marginBottom: 16, borderLeft: `4px solid ${tone.ink}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 240px" }}>
          <div style={{ ...portalEyebrowStyle, color: tone.ink }}>{tone.label}</div>
          <div style={{ fontWeight: 800, marginTop: 6 }}>{item.label}</div>
          <p style={{ color: portalTokens.body, lineHeight: 1.55, marginBottom: 0, fontSize: 14 }}>
            {item.customerPromise}
            {item.formats?.length ? ` Formats: ${item.formats.join(", ")}.` : ""}
            {" "}Auricrux can teach, advise, and automate this.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a href="/portal/capabilities" style={portalButtonSecondary}>All capabilities</a>
          <button
            type="button"
            style={{ ...portalButtonPrimary, border: "none", cursor: "pointer" }}
            onClick={() => openAuricruxAssistant(`Teach and automate: ${item.label}. ${item.customerPromise}`)}
          >
            Ask Auricrux
          </button>
        </div>
      </div>
    </div>
  );
}
