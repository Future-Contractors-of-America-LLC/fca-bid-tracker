import { useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import PortalSliceAuricrux from "../../components/portal/PortalSliceAuricrux";
import {
  ACCOUNT_ACTS,
  CAPABILITIES,
  CAPABILITY_DOMAINS,
  buildAuricruxCapabilityBrief,
} from "../../capabilityCatalog";
import { openAuricruxAssistant } from "../../auricruxAssistant";
import {
  portalButtonPrimary,
  portalButtonSecondary,
  portalCardStyle,
  portalEyebrowStyle,
  portalInputStyle,
  portalTokens,
} from "../../portalDesignTokens";

const depthColor = {
  live: { border: "#bbf7d0", bg: "#f0fdf4", ink: "#15803d", label: "Live" },
  guided: { border: "#bfdbfe", bg: "#eff6ff", ink: "#1d4ed8", label: "Guided / automatable" },
  expanding: { border: "#fde68a", bg: "#fffbeb", ink: "#b45309", label: "Expanding (visible)" },
};

export default function PortalCapabilities() {
  const [query, setQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const brief = useMemo(() => buildAuricruxCapabilityBrief(query), [query]);

  const domains = useMemo(() => {
    return CAPABILITY_DOMAINS.map((domain) => ({
      ...domain,
      items: CAPABILITIES.filter((item) => {
        if (item.domain !== domain.id) return false;
        if (domainFilter !== "all" && domainFilter !== domain.id) return false;
        if (!query.trim()) return true;
        const blob = `${item.label} ${item.customerPromise} ${(item.formats || []).join(" ")} ${(item.competitorsCovered || []).join(" ")}`.toLowerCase();
        return blob.includes(query.trim().toLowerCase());
      }),
    })).filter((domain) => domain.items.length > 0);
  }, [query, domainFilter]);

  return (
    <PortalShell
      title="Construction OS capabilities"
      subtitle="FCA shows every construction capability we claim, and Auricrux can teach, advise, and automate it."
      activeHref="/portal/capabilities"
      currentJourney="lead"
      navDensity="full"
      showRouteOverlay={false}
    >
      <PortalSliceAuricrux
        title="Auricrux · full OS doctrine"
        targetObjectType="CapabilityMap"
        targetObjectId="FCA-ALL"
        sourceRoute="/portal/capabilities"
        rationale={brief.doctrine}
        nextAction="Ask Auricrux to open, explain, or automate any capability below."
        actionHref="/portal/auricrux"
        actionLabel="Ask Auricrux"
        liveRecommend
      />

      <div style={{ ...portalCardStyle, marginBottom: 16, borderLeft: `4px solid ${portalTokens.primary}` }}>
        <div style={portalEyebrowStyle}>Coverage</div>
        <div style={{ fontWeight: 800, fontSize: 22, marginTop: 6 }}>{brief.total} capabilities · {brief.domains} domains</div>
        <p style={{ color: portalTokens.body, lineHeight: 1.6, marginBottom: 12 }}>
          {brief.doctrine}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={() => openAuricruxAssistant()} style={{ ...portalButtonPrimary, border: "none", cursor: "pointer" }}>
            Ask Auricrux about any capability
          </button>
          <a href="/portal/profile" style={portalButtonSecondary}>Customize how my account acts</a>
          <a href="/portal/platform" style={portalButtonSecondary}>Workspace hub</a>
        </div>
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>How your account acts</div>
        <h3 style={{ marginTop: 6, marginBottom: 12 }}>Identity, branding, entitlements, communications, security</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          {ACCOUNT_ACTS.map((act) => (
            <a key={act.title} href={act.href} style={{ ...portalCardStyle, marginBottom: 0, textDecoration: "none", color: "inherit" }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>{act.title}</div>
              <div style={{ color: portalTokens.body, fontSize: 13, lineHeight: 1.5 }}>{act.detail}</div>
            </a>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search: BIM, takeoff, payroll, OSHA, IFC, punch, banking…"
          style={{ ...portalInputStyle, flex: "1 1 280px", minWidth: 220 }}
        />
        <select
          value={domainFilter}
          onChange={(event) => setDomainFilter(event.target.value)}
          style={{ ...portalInputStyle, width: "auto" }}
        >
          <option value="all">All domains</option>
          {CAPABILITY_DOMAINS.map((domain) => (
            <option key={domain.id} value={domain.id}>{domain.label}</option>
          ))}
        </select>
      </div>

      {domains.map((domain) => (
        <section key={domain.id} id={domain.id} style={{ marginBottom: 22, scrollMarginTop: 88 }}>
          <div style={{ ...portalEyebrowStyle, marginBottom: 6 }}>{domain.label}</div>
          <p style={{ color: portalTokens.body, marginTop: 0, marginBottom: 12 }}>{domain.summary}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            {domain.items.map((item) => {
              const tone = depthColor[item.depth] || depthColor.expanding;
              return (
                <article
                  key={item.id}
                  style={{
                    ...portalCardStyle,
                    marginBottom: 0,
                    border: `1px solid ${tone.border}`,
                    background: tone.bg,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, fontSize: 16 }}>{item.label}</h3>
                    <span style={{ color: tone.ink, fontWeight: 700, fontSize: 12 }}>{tone.label}</span>
                  </div>
                  <p style={{ color: portalTokens.body, lineHeight: 1.55, fontSize: 14 }}>{item.customerPromise}</p>
                  {item.formats?.length ? (
                    <div style={{ fontSize: 12, color: portalTokens.muted, marginBottom: 8 }}>
                      Formats: {item.formats.join(" · ")}
                    </div>
                  ) : null}
                  {item.automations?.length ? (
                    <div style={{ fontSize: 12, color: portalTokens.muted, marginBottom: 8 }}>
                      Auricrux automations: {item.automations.join(" · ")}
                    </div>
                  ) : null}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <a href={item.href} style={portalButtonPrimary}>Open</a>
                    <button
                      type="button"
                      style={{ ...portalButtonSecondary, cursor: "pointer" }}
                      onClick={() => openAuricruxAssistant(`Teach and automate: ${item.label}. ${item.customerPromise}`)}
                    >
                      Ask Auricrux
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </PortalShell>
  );
}
