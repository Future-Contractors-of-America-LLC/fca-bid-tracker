import PublicTopNav from "../../components/PublicTopNav";
import ShellFooter from "../../components/ShellFooter";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import { publicHomeMessaging } from "../../systemContinuity";
import { PILOT_CHECKOUT_URL, STARTUP_CHECKOUT_URL } from "../../commercialOffers";
import {
  cardStyle,
  ctaPrimaryStyle,
  ctaSecondaryStyle,
  heroCardStyle,
  pageShellStyle,
  responsiveGrid,
} from "../../publicShellStyles";

const proofPoints = [
  { value: "One platform", label: "Website, SaaS workspace, customer portal, and Academy in one company account." },
  { value: "Lead to closeout", label: "Leads, estimates, projects, plan room, billing, and support on one spine." },
  { value: "Enterprise-ready", label: "Multi-office rollouts with governed admin controls and dedicated success coverage." },
];

const capabilityCards = [
  {
    title: "Lead pipeline",
    detail: "Capture opportunities, qualify bids, and move work from first contact to signed contract.",
    href: "/leads/",
  },
  {
    title: "Job sites",
    detail: "Track active projects, milestones, RFIs, and next actions from every job.",
    href: "/portal/projects",
  },
  {
    title: "Plan room",
    detail: "Share drawings, specs, and submittals with your team and customers.",
    href: "/portal/files",
  },
  {
    title: "Academy",
    detail: "Electrical apprenticeship pathways, safety programs, and supervisor credentials.",
    href: "/academy",
  },
  {
    title: "Billing",
    detail: "Invoices, payment status, and revenue follow-through in your customer portal.",
    href: "/portal/billing",
  },
  {
    title: "Customer success",
    detail: "Branded communications and support cases tied to active work.",
    href: "/portal/support",
  },
];

const programCards = [
  {
    tier: "Startup",
    price: "$99/mo",
    detail: "For owner-operators winning their first commercial accounts.",
    href: STARTUP_CHECKOUT_URL || "/intake?plan=startup",
    label: "Start Startup plan",
    external: Boolean(STARTUP_CHECKOUT_URL),
  },
  {
    tier: "Pilot",
    price: "$2,500",
    detail: "White-glove onboarding for teams standardizing bids, jobs, and field communication.",
    href: PILOT_CHECKOUT_URL,
    label: "Start Pilot",
    external: true,
  },
  {
    tier: "Enterprise",
    price: "Custom",
    detail: "Multi-office rollouts with advanced controls and dedicated success coverage.",
    href: "/contact",
    label: "Book a walkthrough",
    external: false,
  },
];

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
  border: "1px solid rgba(226, 232, 240, 0.4)",
};

export default function Home() {
  return (
    <div style={{ ...pageShellStyle, background: "#ffffff", minHeight: "100vh", paddingTop: 0 }}>
      <PublicTopNav />

      <section style={heroCardStyle}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ color: "#93c5fd", fontWeight: 700, marginBottom: 12, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12 }}>
            Commercial contractor operating system
          </div>
          <h1 style={{ marginTop: 0, fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.15, fontWeight: 800, maxWidth: 820 }}>
            {publicHomeMessaging.header.title}
          </h1>
          <p style={{ color: "#cbd5e1", lineHeight: 1.75, maxWidth: 640, marginTop: 16, fontSize: 18 }}>
            {publicHomeMessaging.header.subtitle}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
            <a href="/intake" style={heroCtaOnDark}>Get started</a>
            <a href="/login" style={heroCtaSecondaryOnDark}>Sign in</a>
          </div>
        </div>
      </section>

      <div style={{ padding: "0 clamp(20px, 4vw, 40px)" }}>
        <section style={{ ...responsiveGrid(200), marginBottom: 40 }}>
          {proofPoints.map((point) => (
            <article key={point.value} style={{ ...cardStyle, borderLeft: "3px solid #1d4ed8" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>{point.value}</div>
              <p style={{ color: "#475569", lineHeight: 1.7, margin: 0 }}>{point.label}</p>
            </article>
          ))}
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ marginBottom: 8, fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)" }}>Everything your contracting business needs</h2>
          <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: 24, maxWidth: 720 }}>
            Each module connects to the same company workspace on web and mobile. Use the header to explore platform, pricing, Academy, and company resources.
          </p>
          <div style={responsiveGrid(280)}>
            {capabilityCards.map((item) => (
              <article key={item.title} style={cardStyle}>
                <h3 style={{ marginTop: 0, fontSize: 17 }}>{item.title}</h3>
                <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: item.href ? 12 : 0 }}>{item.detail}</p>
                {item.href ? (
                  <a href={item.href} style={{ ...ctaSecondaryStyle, display: "inline-block", fontSize: 14 }}>
                    Open {item.title}
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ marginBottom: 16, fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)" }}>Plans for every stage of growth</h2>
          <div style={responsiveGrid(260)}>
            {programCards.map((plan) => (
              <article key={plan.tier} style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ color: "#64748b", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>{plan.tier}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>{plan.price}</div>
                </div>
                <p style={{ color: "#475569", lineHeight: 1.7, flex: 1, margin: 0 }}>{plan.detail}</p>
                <a
                  href={plan.href}
                  target={plan.external ? "_blank" : undefined}
                  rel={plan.external ? "noopener noreferrer" : undefined}
                  style={ctaPrimaryStyle}
                >
                  {plan.label}
                </a>
              </article>
            ))}
          </div>
        </section>

        <CustomerTrustPanel
          title={publicHomeMessaging.trust.title}
          detail={publicHomeMessaging.trust.detail}
        />

        <ShellFooter />
      </div>
    </div>
  );
}
