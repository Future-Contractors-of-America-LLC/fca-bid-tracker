import FcaBrandMark from "../../components/FcaBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import CommercialReadinessPanel from "../../components/CommercialReadinessPanel";
import PublicActionRail from "../../components/PublicActionRail";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import PublicPackageRouteGroupsPanel from "../../components/PublicPackageRouteGroupsPanel";
import ContactActionCenter from "../../components/ContactActionCenter";
import ProductIllustration from "../../components/ProductIllustration";
import useCustomerSession from "../../hooks/useCustomerSession";
import { contactPaths, publicActionCatalog, shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { publicContactMessaging } from "../../systemContinuity";
import { FCA_ENTITY, formatPrincipalOffice } from "../../legal/entityInfo";
import { cardStyle, pageShellStyle, twoColumnGridStyle, ctaPrimaryStyle } from "../../publicShellStyles";

const checklistStyle = {
  margin: 0,
  paddingLeft: 20,
  lineHeight: 1.8,
  color: "#334155",
};

export default function Contact() {
  const { session, login } = useCustomerSession();

  return (
    <div style={pageShellStyle}>
      <ShellHeader
        eyebrow={publicContactMessaging.header.eyebrow}
        title={publicContactMessaging.header.title}
        subtitle={publicContactMessaging.header.subtitle}
        primaryHref={shellHeaderCtaSets.conversion.primaryHref}
        primaryLabel={shellHeaderCtaSets.conversion.primaryLabel}
        secondaryHref={shellHeaderCtaSets.conversion.secondaryHref}
        secondaryLabel={shellHeaderCtaSets.conversion.secondaryLabel}
        journey={shellJourney}
        currentJourney="conversion"
      />

      <div style={{ marginBottom: 20, display: "flex", justifyContent: "flex-end" }}><FcaBrandMark compact /></div>

      <div style={{ marginBottom: 24 }}>
        <ProductIllustration variant="contact" />
      </div>

      <div style={{ marginBottom: 24 }}>
        <ContactActionCenter session={session} login={login} />
      </div>

      <div style={{ marginBottom: 24, marginTop: 24 }}>
        <CustomerTrustPanel
          eyebrow={publicContactMessaging.trust.eyebrow}
          title={publicContactMessaging.trust.title}
          detail={publicContactMessaging.trust.detail}
          items={[
            { title: "See the real workspace", detail: "Walk through platform, portal, academy, and comms — not a slide deck." },
            { title: "Focus on your team's fit", detail: "Match team size, estimating flow, field coordination, and rollout needs to the right tier." },
            { title: "Leave with a practical plan", detail: "Startup through Enterprise — a concrete next step, not an open-ended discussion." },
          ]}
        />
      </div>

      <CommercialReadinessPanel
        title="Your walkthrough begins from real operating context"
        detail="Contact is a conversion surface tied to live product state across portal, academy, and comms."
        primaryHref={publicActionCatalog.walkthrough.href}
        primaryLabel={publicActionCatalog.walkthrough.label}
        secondaryHref={publicActionCatalog.platform.href}
        secondaryLabel={publicActionCatalog.platform.label}
      />

      <div style={{ ...twoColumnGridStyle, marginTop: 24 }}>
        <div style={{ display: "grid", gap: 16 }}>
          <WorkspaceSnapshotCard title={publicContactMessaging.snapshot.title} detail={publicContactMessaging.snapshot.detail} ctaHref={publicActionCatalog.platform.href} ctaLabel="Open Platform Dashboard" />

          <div style={{ ...cardStyle, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" }}>
            <h2 style={{ marginTop: 0 }}>What happens in a walkthrough</h2>
            <ol style={checklistStyle}>
              <li>Review the FCA platform story from the public site.</li>
              <li>Open the platform dashboard to summarize tenant, project, and support state.</li>
              <li>Transition into portal, academy, bid, and communications routes based on fit.</li>
              <li>Review approvals, document control, billing, field readiness, and plan pricing.</li>
              <li>Close on startup, pilot, growth, or enterprise path plus the next production action.</li>
            </ol>
          </div>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {contactPaths.map((path) => (
            <div key={path.title} style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>{path.title}</h3>
              <p style={{ color: "#4b5563", lineHeight: 1.6 }}>{path.detail}</p>
              <a href={path.cta} style={ctaPrimaryStyle}>{path.label}</a>
            </div>
          ))}

          <div style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>Pricing tiers</h3>
            <p style={{ color: "#4b5563", lineHeight: 1.6, marginBottom: 12 }}>
              Review rollout tiers and included products before your walkthrough.
            </p>
            <a href="/pricing" style={ctaPrimaryStyle}>View Pricing</a>
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Principal office</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 8 }}>
          <strong>{FCA_ENTITY.legalName}</strong>
          <br />
          {formatPrincipalOffice(false)}
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: 0, color: "#475569" }}>
          Legal and privacy inquiries:{" "}
          <a href={`mailto:${FCA_ENTITY.emails.legal}`}>{FCA_ENTITY.emails.legal}</a>
          {" · "}
          <a href="/legal/contractor-resources">Contractor legal resources</a>
        </p>
      </div>

      <PublicActionRail title={publicContactMessaging.actionRail.title} detail={publicContactMessaging.actionRail.detail} />

      <PublicPackageRouteGroupsPanel
        eyebrow="Product depth"
        title="What we walk through together"
        detail="Platform modules and route groups behind the FCA contractor platform."
      />

      <ShellFooter />
    </div>
  );
}
