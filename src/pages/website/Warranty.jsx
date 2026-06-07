import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import FounderJourneyStrip from "../../components/FounderJourneyStrip";
import PublicOperationsStrip from "../../components/PublicOperationsStrip";
import ProductProofSection from "../../components/ProductProofSection";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import PublicActionRail from "../../components/PublicActionRail";
import { cardStyle, ctaPrimaryStyle, pageShellStyle } from "../../publicShellStyles";
import { founderJourneyCtaSets, publicActionCatalog, publicRouteCtas, shellJourney } from "../../websiteShell";

const warrantyItems = [
  {
    label: "Lifecycle continuity",
    value: "Post-handover support stays inside FCA",
    detail: "Warranty requests, service coordination, and resolution history now belong to the same operating system as bids, projects, billing, and support.",
  },
  {
    label: "Revenue protection",
    value: "Warranty becomes retention and repeat-work infrastructure",
    detail: "This surface frames warranty not as cost leakage, but as a controlled path into maintenance contracts, follow-on scopes, and customer retention.",
  },
  {
    label: "Operational artifact",
    value: "Service logs and handoff readiness stay visible",
    detail: "The route reinforces that FCA should capture service records, closeout continuity, and customer follow-through as governed artifacts.",
  },
];

const warrantyProof = [
  {
    title: "Open support continuity",
    detail: "Move from public warranty narrative into the live support workspace so service and escalation posture are shown in real operating context.",
    href: "/portal/support",
    label: "Open Support",
  },
  {
    title: "Review files and closeout readiness",
    detail: "Use the files workspace to reinforce how manuals, turnover records, and project artifacts should remain accessible after handoff.",
    href: "/portal/files",
    label: "Open Files",
  },
  {
    title: "Keep customer messaging attached",
    detail: "Move into the message workspace so warranty follow-through stays linked to real communication channels rather than disconnected inboxes.",
    href: "/portal/messages",
    label: "Open Messages",
  },
  {
    title: "Close toward recurring service",
    detail: "Use contact and walkthrough motion to position maintenance plans, post-occupancy service, and repeat-project conversation as the next governed step.",
    href: "/contact",
    label: "Open Contact & Rollout",
  },
];

export default function Warranty() {
  return (
    <div style={pageShellStyle}>
      <ShellHeader
        eyebrow="Warranty and service continuity"
        title="Warranty now behaves like a real FCA lifecycle product surface"
        subtitle="This route turns post-handover service into a governed FCA operating lane tied to support, files, messaging, repeat work, and customer retention."
        primaryHref={publicRouteCtas.conversion.primaryHref}
        primaryLabel={publicRouteCtas.conversion.primaryLabel}
        secondaryHref={publicActionCatalog.support.href}
        secondaryLabel={publicActionCatalog.support.label}
        journey={shellJourney}
        currentJourney="conversion"
      />

      <FounderJourneyStrip
        currentJourney="conversion"
        title="Warranty should extend the lifecycle instead of ending it"
        detail="FCA treats post-occupancy support, service coordination, and customer retention as an operating continuation rather than an afterthought."
        ctaHref={founderJourneyCtaSets.contact.href}
        ctaLabel={founderJourneyCtaSets.contact.label}
      />

      <div style={{ marginTop: 24 }}>
        <PublicOperationsStrip
          eyebrow="Warranty operating strip"
          title="Warranty is positioned as customer retention and recurring-service infrastructure"
          detail="The public shell now includes a dedicated warranty narrative so service continuity, maintenance opportunities, and customer confidence remain part of the FCA system story."
          statusLabel="Warranty posture"
          statusValue="Post-handover lane active"
          items={warrantyItems}
          primaryHref="/portal/support"
          primaryLabel="Open Support"
          secondaryHref="/contact"
          secondaryLabel="Open Contact & Rollout"
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <ProductProofSection
          eyebrow="Warranty product proof"
          title="Warranty can now be demonstrated through live operating routes"
          detail="Use support, files, messages, and rollout surfaces to show how FCA keeps post-handover service visible, trackable, and monetizable."
          highlights={warrantyProof}
        />
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>What FCA warranty continuity should cover</h2>
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8, color: "#334155" }}>
          <li>Dedicated post-occupancy service intake and response posture</li>
          <li>Access to closeout, as-built, and turnover artifacts</li>
          <li>Message continuity between customer, field, and operator lanes</li>
          <li>Escalation into maintenance, renewal, and repeat-project pathways</li>
        </ul>
        <a href="/portal/support" style={{ ...ctaPrimaryStyle, marginTop: 16, display: "inline-flex" }}>Open Support Workspace</a>
      </div>

      <div style={{ marginTop: 24 }}>
        <CustomerTrustPanel
          title="Customers should see service readiness before they need it"
          detail="This route helps prove that FCA can carry work beyond handover through service accountability, documentation continuity, and real follow-through channels."
          items={[
            { title: "Support continuity", detail: "Warranty requests should move into the same governed workspace as delivery and customer communications." },
            { title: "Document continuity", detail: "Closeout records, files, and handoff materials should remain accessible after the project is complete." },
            { title: "Recurring revenue readiness", detail: "Maintenance, repair, and repeat-work conversations should grow from service continuity rather than restart from scratch." },
          ]}
        />
      </div>

      <PublicActionRail
        title="Warranty next actions"
        detail="Use the support workspace, message continuity, and rollout surfaces to prove that FCA can extend customer value after handover and turn service posture into long-term retention."
      />

      <ShellFooter />
    </div>
  );
}
