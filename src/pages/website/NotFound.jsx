import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import PublicActionRail from "../../components/PublicActionRail";
import { publicFallbackCtaCards, publicRouteCtas, shellJourney } from "../../websiteShell";
import { cardStyle, ctaPrimaryStyle, pageShellStyle } from "../../publicShellStyles";

export default function NotFound({ requestedPath = "/unknown-route" }) {
  return (
    <div style={pageShellStyle}>
      <ShellHeader
        eyebrow="FCA Route Fallback"
        title="We couldn’t find that page"
        subtitle="The requested route is not part of the current FCA shell. Use the guided next actions below to return to a supported customer, workspace, or platform path."
        primaryHref={publicRouteCtas.public.primaryHref}
        primaryLabel={publicRouteCtas.public.primaryLabel}
        secondaryHref={publicRouteCtas.public.secondaryHref}
        secondaryLabel={publicRouteCtas.public.secondaryLabel}
        journey={shellJourney}
        currentJourney="public"
      />

      <div style={{ ...cardStyle, marginTop: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: "#2563eb", marginBottom: 10 }}>
          Route fallback
        </div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Safe customer continuity is still available</h2>
        <p style={{ color: "#475569", lineHeight: 1.7, marginTop: 0 }}>
          We kept the shell active and preserved the supported paths below so visitors do not land on a dead end.
        </p>
        <div
          style={{
            marginTop: 12,
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #dbe3ef",
            background: "#f8fbff",
            color: "#0f172a",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
            fontSize: 13,
            wordBreak: "break-word",
          }}
        >
          Requested path: {requestedPath}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 24 }}>
        {publicFallbackCtaCards.map((card) => (
          <div key={card.href} style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>{card.title}</h3>
            <p>{card.detail}</p>
            <a href={card.href} style={ctaPrimaryStyle}>{card.label}</a>
          </div>
        ))}
      </div>

      <PublicActionRail
        title="Continue on a supported FCA route"
        detail="This fallback page keeps customer traffic moving toward supported FCA routes instead of silently sending unknown paths back to the home page."
      />

      <ShellFooter />
    </div>
  );
}
