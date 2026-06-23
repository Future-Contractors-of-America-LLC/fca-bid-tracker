import PublicTopNav from "../../components/PublicTopNav";
import ShellFooter from "../../components/ShellFooter";
import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import ProductIllustration from "../../components/ProductIllustration";
import { filterVisibleActions } from "../../ctaBehavior";
import { publicHomeMessaging } from "../../systemContinuity";
import { websiteMarketReadiness } from "../../websiteMarketReadiness";
import { publicSurfaceLinks } from "../../websiteShell";
import { academyClassrooms, websiteEnterpriseProof } from "../../productBlueprint";
import { brandIdentity } from "../../brandIdentity";
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

const homeExploreLinks = publicSurfaceLinks.filter((item) => item.key !== "pricing");

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
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
        <FcaBrandMark />
        <AuricruxBrandMark />
      </div>
      <p style={{ position: "relative", marginTop: 20, marginBottom: 0, maxWidth: 640, color: "#475569", lineHeight: 1.7, fontSize: 17 }}>
        FCA is the contractor operating system. Auricrux is the intelligence layer inside it, guiding teams from first lead through delivery, billing, and training.
      </p>
    </div>
  );
}

export default function Home() {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
  const visibleSurfaceLinks = filterVisibleActions(homeExploreLinks, currentPath);

  return (
    <div style={{ ...pageShellStyle, background: "#ffffff", minHeight: "100vh", paddingTop: 0, maxWidth: "none", margin: 0, width: "100%" }}>
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
                <a href="/contact" style={heroCtaSecondaryOnDark}>Talk to our team</a>
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

      <div style={{ padding: "clamp(32px, 5vw, 56px) clamp(20px, 4vw, 40px)", maxWidth: 1280, margin: "0 auto", boxSizing: "border-box" }}>
        <BrandArtBand />

        <div style={{ marginBottom: 48 }}>
          <ProductIllustration variant="home" />
        </div>

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: "clamp(1.35rem, 2.5vw, 1.85rem)" }}>What FCA delivers</h2>
          <p style={{ color: "#64748b", marginBottom: 24, maxWidth: 620, lineHeight: 1.65 }}>
            One operating system for bids, projects, billing, customer communication, and workforce training.
          </p>
          <div style={responsiveGrid(260)}>
            {visibleSurfaceLinks.map((item) => (
              <a
                key={item.key}
                href={item.href}
                style={{ ...cardStyle, borderTop: `3px solid ${brandIdentity.fca.colors.primary}`, textDecoration: "none", color: "inherit", display: "block" }}
              >
                <h3 style={{ marginTop: 0, fontSize: 17 }}>{item.title}</h3>
                <p style={{ color: "#475569", lineHeight: 1.65, marginBottom: 0, fontSize: 14 }}>{item.detail}</p>
              </a>
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
                <p style={{ color: "#475569", lineHeight: 1.65, fontSize: 14, marginBottom: 12 }}>{journey.outcome}</p>
                <a href={journey.route} style={{ ...ctaPrimaryStyle, display: "inline-block", fontSize: 14 }}>{journey.label}</a>
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
          <h2 style={{ marginBottom: 20, fontSize: "clamp(1.25rem, 2.5vw, 1.65rem)" }}>Enterprise proof</h2>
          <div style={responsiveGrid(280)}>
            {websiteEnterpriseProof.map((item) => (
              <article key={item.title} style={cardStyle}>
                <h3 style={{ marginTop: 0, fontSize: 17 }}>{item.title}</h3>
                <p style={{ color: "#475569", lineHeight: 1.65, fontSize: 14, marginBottom: 0 }}>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ marginBottom: 20, fontSize: "clamp(1.25rem, 2.5vw, 1.65rem)" }}>Academy classrooms</h2>
          <div style={responsiveGrid(280)}>
            {academyClassrooms.map((classroom) => (
              <article key={classroom.title} style={cardStyle}>
                <div style={{ color: brandIdentity.fca.colors.primaryDark, fontWeight: 800, fontSize: 12, marginBottom: 8 }}>{classroom.credential}</div>
                <h3 style={{ marginTop: 0, fontSize: 17 }}>{classroom.title}</h3>
                <p style={{ color: "#475569", lineHeight: 1.65, fontSize: 14, marginBottom: 12 }}>{classroom.cadence} · {classroom.delivery}</p>
                <a href={classroom.linkedSurface} style={{ ...ctaSecondaryStyle, display: "inline-block", fontSize: 14 }}>{classroom.linkedLabel}</a>
              </article>
            ))}
          </div>
        </section>

        <ShellFooter />
      </div>
    </div>
  );
}
