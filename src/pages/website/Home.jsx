import PublicTopNav from "../../components/PublicTopNav";
import ShellFooter from "../../components/ShellFooter";
import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import PublicPackageRouteGroupsPanel from "../../components/PublicPackageRouteGroupsPanel";
import { filterVisibleActions } from "../../ctaBehavior";
import { publicHomeMessaging } from "../../systemContinuity";
import { websiteMarketReadiness } from "../../websiteMarketReadiness";
import { publicSurfaceLinks } from "../../websiteShell";
import { brandIdentity } from "../../brandIdentity";
import { PILOT_CHECKOUT_URL, STARTUP_CHECKOUT_URL } from "../../commercialOffers";
import {
  cardStyle,
  ctaPrimaryStyle,
  ctaSecondaryStyle,
  pageShellStyle,
  responsiveGrid,
} from "../../publicShellStyles";

const heroCtaOnDark = {
  ...ctaPrimaryStyle,
  background: "#fff",
  color: "#0f172a",
  border: "none",
};

const heroCtaSecondaryOnDark = {
  ...ctaSecondaryStyle,
  background: "transparent",
  color: "#e2e8f0",
  border: "1px solid rgba(226, 232, 240, 0.45)",
};

const programCards = [
  { tier: "Startup", price: "$99/mo", href: STARTUP_CHECKOUT_URL || "/intake?plan=startup", label: "Start Startup", external: Boolean(STARTUP_CHECKOUT_URL) },
  { tier: "Pilot", price: "$2,500", href: PILOT_CHECKOUT_URL, label: "Start Pilot", external: true },
  { tier: "Enterprise", price: "Custom", href: "/contact", label: "Book a walkthrough", external: false },
];

function BrandArtBand() {
  const fca = brandIdentity.fca.colors;
  const auricrux = brandIdentity.auricrux.colors;
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 20,
        marginBottom: 48,
        padding: "clamp(28px, 5vw, 48px)",
        background: `linear-gradient(135deg, ${fca.primarySoft} 0%, #fff 45%, ${auricrux.primarySoft} 100%)`,
        border: `1px solid ${fca.primary}22`,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: -40,
          top: -40,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${auricrux.primary}33 0%, transparent 70%)`,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: -60,
          bottom: -60,
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${fca.primary}28 0%, transparent 70%)`,
        }}
      />
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
        <FcaBrandMark />
        <AuricruxBrandMark />
      </div>
      <p style={{ position: "relative", marginTop: 20, marginBottom: 0, maxWidth: 640, color: "#475569", lineHeight: 1.7, fontSize: 17 }}>
        FCA is the contractor operating system. Auricrux is the intelligence layer inside it - guiding teams from first lead through delivery, billing, and training.
      </p>
    </div>
  );
}

export default function Home() {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
  const visibleSurfaceLinks = filterVisibleActions(publicSurfaceLinks, currentPath);

  return (
    <div style={{ ...pageShellStyle, background: "#ffffff", minHeight: "100vh", paddingTop: 0 }}>
      <PublicTopNav />

      <section
        style={{
          background: "linear-gradient(165deg, #0f172a 0%, #1e3a5f 42%, #0f172a 100%)",
          padding: "clamp(48px, 8vw, 88px) clamp(20px, 4vw, 40px)",
          marginBottom: 0,
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 32, marginBottom: 32 }}>
            <div style={{ flex: "1 1 360px" }}>
              <div style={{ color: "#93c5fd", fontWeight: 700, marginBottom: 12, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 12 }}>
                {publicHomeMessaging.header.eyebrow}
              </div>
              <h1 style={{ marginTop: 0, fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)", lineHeight: 1.1, fontWeight: 800, maxWidth: 720, color: "#f8fafc" }}>
                {publicHomeMessaging.header.title}
              </h1>
              <p style={{ color: "#cbd5e1", lineHeight: 1.75, maxWidth: 560, marginTop: 18, fontSize: 18 }}>
                {publicHomeMessaging.header.subtitle}
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
                <a href="/intake" style={heroCtaOnDark}>Get started</a>
                <a href="/login?next=/portal/platform" style={heroCtaSecondaryOnDark}>Sign in to workspace</a>
              </div>
            </div>
            <div style={{ flex: "0 1 auto", display: "grid", gap: 16, padding: 20, borderRadius: 18, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <div style={{ filter: "brightness(1.15)" }}>
                <FcaBrandMark compact showTagline={false} />
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.15)" }} />
              <AuricruxBrandMark compact />
            </div>
          </div>
        </div>
      </section>

      <div style={{ padding: "clamp(32px, 5vw, 56px) clamp(20px, 4vw, 40px)" }}>
        <BrandArtBand />

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: "clamp(1.35rem, 2.5vw, 1.85rem)" }}>Explore FCA</h2>
          <p style={{ color: "#64748b", marginBottom: 24, maxWidth: 560, lineHeight: 1.65 }}>
            Use the menu above for deeper dives - platform, features, pricing, Academy, and company resources.
          </p>
          <div style={responsiveGrid(260)}>
            {visibleSurfaceLinks.map((item) => (
              <article key={item.key} style={{ ...cardStyle, borderTop: `3px solid ${brandIdentity.fca.colors.primary}` }}>
                <h3 style={{ marginTop: 0, fontSize: 17 }}>{item.title}</h3>
                <p style={{ color: "#475569", lineHeight: 1.65, marginBottom: 14, fontSize: 14 }}>{item.detail}</p>
                <a href={item.href} style={{ ...ctaSecondaryStyle, display: "inline-block", fontSize: 14 }}>{item.ctaLabel}</a>
              </article>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ marginBottom: 20, fontSize: "clamp(1.25rem, 2.5vw, 1.65rem)" }}>Built for every stage of growth</h2>
          <div style={responsiveGrid(280)}>
            {websiteMarketReadiness.buyerJourneys.map((journey) => (
              <article
                key={journey.title}
                style={{
                  ...cardStyle,
                  background: `linear-gradient(180deg, ${brandIdentity.fca.colors.primarySoft} 0%, #fff 100%)`,
                }}
              >
                <div style={{ color: brandIdentity.fca.colors.primaryDark, fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  {journey.audience}
                </div>
                <h3 style={{ marginTop: 0, fontSize: 17 }}>{journey.title}</h3>
                <p style={{ color: "#475569", lineHeight: 1.65, fontSize: 14 }}>{journey.outcome}</p>
                <a href={journey.route} style={{ ...ctaPrimaryStyle, display: "inline-block", fontSize: 14, marginTop: 8 }}>{journey.label}</a>
              </article>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <div style={responsiveGrid(200)}>
            {websiteMarketReadiness.trustSignals.map((signal) => (
              <article key={signal.title} style={{ ...cardStyle, padding: 16 }}>
                <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: 6, fontSize: 15 }}>{signal.title}</div>
                <p style={{ color: "#64748b", lineHeight: 1.6, margin: 0, fontSize: 14 }}>{signal.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ marginBottom: 16 }}>Plans for every team</h2>
          <div style={responsiveGrid(240)}>
            {programCards.map((plan) => (
              <article key={plan.tier} style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <div style={{ color: "#64748b", fontWeight: 700, fontSize: 12, textTransform: "uppercase" }}>{plan.tier}</div>
                  <div style={{ fontSize: 28, fontWeight: 800 }}>{plan.price}</div>
                </div>
                <a
                  href={plan.href}
                  target={plan.external ? "_blank" : undefined}
                  rel={plan.external ? "noopener noreferrer" : undefined}
                  style={{ ...ctaPrimaryStyle, marginTop: "auto" }}
                >
                  {plan.label}
                </a>
              </article>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
            {websiteMarketReadiness.conversionActions.map((action) => (
              <a key={action.href} href={action.href} style={ctaSecondaryStyle}>{action.label}</a>
            ))}
          </div>
        </section>

        <PublicPackageRouteGroupsPanel
          eyebrow="Product depth"
          title="Everything in the FCA operating system"
          detail="Full route groups and product modules - explore before you sign in."
        />

        <ShellFooter />
      </div>
    </div>
  );
}
