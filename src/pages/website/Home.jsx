import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import PublicCtaRow from "../../components/PublicCtaRow";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import { homeCtaSets, publicRouteCtas, shellJourney } from "../../websiteShell";
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
  { value: "Field-ready crews", label: "Assign safety modules, trade credentials, and supervisor training on site." },
];

const capabilityCards = [
  {
    title: "Lead pipeline",
    detail: "Capture opportunities, qualify bids, and move work from first contact to signed contract.",
    href: "/intake",
    label: "Start intake",
  },
  {
    title: "Job sites",
    detail: "Track active projects, milestones, RFIs, and next actions from every job.",
    href: "/portal/platform",
    label: "View platform",
  },
  {
    title: "Plan room",
    detail: "Share drawings, specs, and submittals with your team and customers.",
    href: "/portal/files",
    label: "Open files",
  },
  {
    title: "Academy",
    detail: "Electrical apprenticeship pathways, safety programs, and supervisor credentials.",
    href: "/academy",
    label: "Browse training",
  },
  {
    title: "Billing",
    detail: "Invoices, payment status, and revenue follow-through in your customer portal.",
    href: "/portal/billing",
    label: "View billing",
  },
  {
    title: "Customer success",
    detail: "Branded communications and support cases tied to active work.",
    href: "/portal/support",
    label: "Contact support",
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

export default function Home() {
  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        eyebrow={publicHomeMessaging.header.eyebrow}
        title={publicHomeMessaging.header.title}
        subtitle={publicHomeMessaging.header.subtitle}
        primaryHref={publicRouteCtas.public.primaryHref}
        primaryLabel={publicRouteCtas.public.primaryLabel}
        secondaryHref={publicRouteCtas.public.secondaryHref}
        secondaryLabel={publicRouteCtas.public.secondaryLabel}
        journey={shellJourney}
        currentJourney="public"
      />

      <section style={{ ...heroCardStyle, marginBottom: 24 }}>
        <div style={{ color: "#1d4ed8", fontWeight: 700, marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: 13 }}>
          Commercial contractor operating system
        </div>
        <h2 style={{ marginTop: 0, fontSize: "clamp(1.5rem, 3vw, 2rem)", lineHeight: 1.2 }}>
          Compete with PlanHub-class lead flow, Procore-class job control, and enterprise-grade training
        </h2>
        <p style={{ color: "#334155", lineHeight: 1.7, maxWidth: 760, marginTop: 12 }}>
          FCA Contractor Command connects your sales pipeline, field delivery, plan room, billing, and workforce readiness so your team works from one operating picture.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
          <a href="/intake" style={ctaPrimaryStyle}>Get started</a>
          <a href="/login" style={ctaSecondaryStyle}>Sign in</a>
          <a href="/pricing" style={ctaSecondaryStyle}>Compare plans</a>
        </div>
      </section>

      <section style={{ ...responsiveGrid(200), marginBottom: 24 }}>
        {proofPoints.map((point) => (
          <article key={point.value} style={cardStyle}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#1d4ed8", marginBottom: 8 }}>{point.value}</div>
            <p style={{ color: "#475569", lineHeight: 1.7 }}>{point.label}</p>
          </article>
        ))}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 8 }}>Everything your contracting business needs</h2>
        <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: 16, maxWidth: 720 }}>
          Each module connects to the same company workspace on web and mobile.
        </p>
        <div style={responsiveGrid(280)}>
          {capabilityCards.map((item) => (
            <article key={item.title} style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>{item.title}</h3>
              <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: 16 }}>{item.detail}</p>
              <a href={item.href} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>{item.label}</a>
            </article>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 16 }}>Plans for every stage of growth</h2>
        <div style={responsiveGrid(260)}>
          {programCards.map((plan) => (
            <article key={plan.tier} style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ color: "#64748b", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em" }}>{plan.tier}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>{plan.price}</div>
              </div>
              <p style={{ color: "#475569", lineHeight: 1.7, flex: 1 }}>{plan.detail}</p>
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

      <div style={{ marginTop: 24 }}>
        <PublicCtaRow actions={homeCtaSets.productionClose} />
      </div>

      <ShellFooter />
    </div>
  );
}
