import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import PublicOperationsStrip from "../../components/PublicOperationsStrip";
import ProductProofSection from "../../components/ProductProofSection";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import PublicActionRail from "../../components/PublicActionRail";
import { warrantyItems, warrantyProof } from "../../content/warrantyContent";
import { cardStyle, ctaPrimaryStyle, pageShellStyle } from "../../publicShellStyles";
import { publicActionCatalog, publicRouteCtas, shellJourney } from "../../websiteShell";

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
