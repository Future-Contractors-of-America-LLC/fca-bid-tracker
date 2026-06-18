import FcaBrandMark from "../../components/FcaBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import ExecutiveSignalBar from "../../components/ExecutiveSignalBar";
import CommercialReadinessPanel from "../../components/CommercialReadinessPanel";
import FounderJourneyStrip from "../../components/FounderJourneyStrip";
import PublicActionRail from "../../components/PublicActionRail";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import PublicOperationsStrip from "../../components/PublicOperationsStrip";
import ProductProofSection from "../../components/ProductProofSection";
import AuricruxCommsPanel from "../../components/AuricruxCommsPanel";
import ContactActionCenter from "../../components/ContactActionCenter";
import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";
import ExecutionTruthBanner from "../../components/ExecutionTruthBanner";
import PublicPackageRouteGroupsPanel from "../../components/PublicPackageRouteGroupsPanel";
import useCustomerSession from "../../hooks/useCustomerSession";
import { contactPaths, executiveSignalCtaSets, founderJourneyCtaSets, pricingTiers, publicActionCatalog, shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { publicContactMessaging } from "../../systemContinuity";
import { auricruxCommsChannels } from "../../systemState";
import { cardStyle, pageShellStyle, twoColumnGridStyle, ctaPrimaryStyle } from "../../publicShellStyles";

const checklistStyle = {
  margin: 0,
  paddingLeft: 20,
  lineHeight: 1.8,
  color: "#334155",
};

const contactContinuityItems = [
  { label: "Walkthrough scope", value: "Public page to live product flow", detail: "The contact route now makes the handoff into platform, portal, academy, and comms explicit before the conversation starts." },
  { label: "Customer confidence", value: "Review the real workspace first", detail: "This page keeps real product state visible so outreach is grounded in execution, not abstract promises." },
  { label: "Next action", value: "Startup, pilot, mid-range, growth, or enterprise review", detail: "The route closes toward a concrete pricing and rollout step instead of ending with a generic contact form posture." },
];

const contactProductProof = [
  { title: "Show the dashboard in the first call", detail: "Start walkthroughs from the unified platform dashboard so buyers immediately see the real product behind the conversation.", href: "/portal/platform", label: "Open Platform Dashboard" },
  { title: "Open the operating workspace", detail: "Use the portal route to prove projects, files, messages, bids, billing, support, admin, and comms are already part of one shell.", href: "/portal", label: "Open Portal Workspace" },
  { title: "Bring intake into the demo", detail: "Move into the bid route during the walkthrough so the customer sees real movement from entry into production flow.", href: "/bid-entry", label: "Open Bid Entry" },
  { title: "Keep training and channels in the same story", detail: "Open academy continuity before the conversation ends so rollout feels complete instead of fragmented.", href: "/academy", label: "Open Academy" },
];

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

      <FounderJourneyStrip
        currentJourney="conversion"
        title={publicContactMessaging.journey.title}
        detail={publicContactMessaging.journey.detail}
        ctaHref={founderJourneyCtaSets.contact.href}
        ctaLabel={founderJourneyCtaSets.contact.label}
      />

      <ExecutiveSignalBar mode="public" nextHref={executiveSignalCtaSets.contact.href} nextLabel={executiveSignalCtaSets.contact.label} />

      <div style={{ marginBottom: 24 }}>
        <AuricruxCommsPanel
          title="Contact is now connected to the full Auricrux communications stack"
          detail="Website conversion now speaks directly to chat, SMS, phone, email, Teams, conference, and lecture paths so the public site hands buyers into a real FCA operating and communications system."
          statusLabel="Public conversion comms"
          statusValue="Founder-demo channels active"
          items={auricruxCommsChannels}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <PublicOperationsStrip
          eyebrow="Contact continuity strip"
          title="Contact now behaves like a rollout handoff surface"
          detail="Instead of acting like a detached inquiry page, contact now carries shared operating context so buyers understand what happens next inside FCA."
          statusLabel="Conversation posture"
          statusValue="Guided walkthrough path active"
          items={contactContinuityItems}
          primaryHref="/portal/platform"
          primaryLabel="Open Platform Dashboard"
          secondaryHref="mailto:sales@futurecontractorsofamerica.com?subject=FCA%20Walkthrough%20Request"
          secondaryLabel="Schedule a Walkthrough"
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <PublicPackageRouteGroupsPanel
          eyebrow="Contact package route truth"
          title="Contact now shows the exact product route groups used in a walkthrough"
          detail="Walkthrough packaging now points to exact reachable SaaS, portal, Academy, Auricrux/comms, and revenue continuity routes so the sales conversation stays attached to real product state."
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <ExecutionTruthBanner
          title="Walkthrough activation is not yet governed lead intake"
          status="Demo access path only"
          source="Local authenticated walkthrough session activation"
          tone="warning"
          whatIsLive={[
            "Guided workspace preview activation for planning and demonstration.",
            "Plan-matched session posture across portal surfaces.",
            "Conversion routing into portal, billing, messaging, and admin demo paths.",
          ]}
          whatIsNotLiveYet={[
            "This route does not yet create a governed Lead record.",
            "No qualification decision or tracked intake object is created here yet.",
            "No lead-created audit event is emitted from this walkthrough activation path.",
          ]}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <ContactActionCenter session={session} login={login} />
      </div>

      <CommercialContinuityFeed title="Walkthrough and conversion memory" detail="Recent walkthrough activations, plan shifts, billing/comms continuity changes, and revenue-shaping mutations remain visible here so contact stays tied to real commercial movement instead of generic outreach." />

      <ProductProofSection
        eyebrow="Contact product proof"
        title="Contact now opens directly into a founder-demo product path"
        detail="This route now reinforces the exact dashboard, workspace, bid, academy, and communications movement that should happen during a live walkthrough."
        highlights={contactProductProof}
      />

      <div style={{ marginBottom: 24, marginTop: 24 }}>
        <CustomerTrustPanel
          eyebrow={publicContactMessaging.trust.eyebrow}
          title={publicContactMessaging.trust.title}
          detail={publicContactMessaging.trust.detail}
          items={[
            { title: "See the real workspace", detail: "Walk through the platform, portal, academy, and comms routes instead of a disconnected slide deck." },
            { title: "Focus on your team's fit", detail: "Use the conversation to match your team size, estimating flow, field coordination, rollout needs, communication preferences, and price tier to the right next step." },
            { title: "Leave with a practical plan", detail: "End with a clear Startup Workspace, Pilot Workspace, Team Workspace, Operations Workspace, Growth Platform, or Enterprise Rollout path instead of an open-ended discussion." },
          ]}
        />
      </div>

      <CommercialReadinessPanel
        title="Your walkthrough begins from real operating context"
        detail="Contact is framed as a customer-ready conversion surface that inherits the same approval, revenue, rollout readiness, product packaging, communications state, and real session activation shown across Auricrux, platform, portal, and academy routes."
        primaryHref={publicActionCatalog.walkthrough.href}
        primaryLabel={publicActionCatalog.walkthrough.label}
        secondaryHref={publicActionCatalog.platform.href}
        secondaryLabel={publicActionCatalog.platform.label}
      />

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Current customer pricing paths</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {pricingTiers.map((tier) => (
            <div key={tier.name} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#fff" }}>
              <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>{tier.name}</div>
              <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>{tier.price}</div>
              <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 8 }}>{tier.detail}</div>
              <div style={{ color: "#111827", lineHeight: 1.7, fontSize: 14 }}><strong>Products:</strong> {tier.products.join(" · ")}</div>
              <div style={{ color: "#111827", lineHeight: 1.7, fontSize: 14 }}><strong>Comms:</strong> {tier.comms.join(" · ")}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...twoColumnGridStyle, marginTop: 24 }}>
        <div style={{ display: "grid", gap: 16 }}>
          <WorkspaceSnapshotCard title={publicContactMessaging.snapshot.title} detail={publicContactMessaging.snapshot.detail} ctaHref={publicActionCatalog.platform.href} ctaLabel="Open Platform Dashboard" />

          <div style={{ ...cardStyle, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" }}>
            <h2 style={{ marginTop: 0 }}>What happens in a walkthrough</h2>
            <ol style={checklistStyle}>
              <li>Review the FCA platform story from the public site.</li>
              <li>Show persisted workspace continuity before entry.</li>
              <li>Open the platform dashboard to summarize tenant, project, support, academy, admin, comms, and revenue state.</li>
              <li>Transition into portal, academy, bid, and communications routes based on your team's fit.</li>
              <li>Review approvals, document-control posture, billing follow-through, field-readiness gaps, communication cadence, and plan pricing.</li>
              <li>Close on startup, pilot, mid-range, growth, or enterprise path, plus the next production action.</li>
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
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>{publicContactMessaging.immediate.title}</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
          {publicContactMessaging.immediate.detail} The route-local CTA cluster was removed here so contact can stay focused on the walkthrough options, current pricing paths, shared next actions, and live workspace activation already presented above.
        </p>
      </div>

      <PublicActionRail title={publicContactMessaging.actionRail.title} detail={publicContactMessaging.actionRail.detail} />

      <ShellFooter />
    </div>
  );
}
