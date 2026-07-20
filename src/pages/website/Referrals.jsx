import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import FounderJourneyStrip from "../../components/FounderJourneyStrip";
import PublicOperationsStrip from "../../components/PublicOperationsStrip";
import ProductProofSection from "../../components/ProductProofSection";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import PublicActionRail from "../../components/PublicActionRail";
import { cardStyle, ctaPrimaryStyle, pageShellStyle } from "../../publicShellStyles";
import { founderJourneyCtaSets, publicActionCatalog, publicRouteCtas, shellJourney } from "../../websiteShell";

const referralItems = [
  {
    label: "Revenue generation",
    value: "Referral motion is now visible on the public shell",
    detail: "FCA now treats testimonials, repeat introductions, and customer-driven growth as explicit product surfaces instead of hidden follow-up work.",
  },
  {
    label: "Customer loyalty",
    value: "Closeout can lead into advocacy",
    detail: "This route connects project completion and service continuity into referral capture, review requests, and repeat-work expansion.",
  },
  {
    label: "Operational continuity",
    value: "Growth loops stay inside the same system",
    detail: "Messages, platform visibility, and contact rollout remain attached so referrals do not break away from governed execution history.",
  },
];

const referralProof = [
  {
    title: "Open messages for follow-through",
    detail: "Referral requests and customer advocacy should stay connected to real communication continuity instead of manual side channels.",
    href: "/portal/messages",
    label: "Open Messages",
  },
  {
    title: "Review project proof first",
    detail: "Use the projects workspace to show real execution credibility before the referral conversation starts.",
    href: "/portal/projects",
    label: "Open Projects",
  },
  {
    title: "Keep rollout conversion attached",
    detail: "Move from referral narrative into contact and walkthrough motion so new leads enter the same FCA operating path immediately.",
    href: "/contact",
    label: "Open Contact & Rollout",
  },
  {
    title: "Show platform readiness",
    detail: "Use the platform dashboard to prove that referral-driven growth feeds into a real contractor platform rather than a disconnected sales promise.",
    href: "/portal/platform",
    label: "Open Platform Dashboard",
  },
];

export default function Referrals() {
  return (
    <div style={pageShellStyle}>
      <ShellHeader
        eyebrow="Referral and loyalty continuity"
        title="Referrals now behave like a real FCA growth surface"
        subtitle="This route turns testimonials, repeat introductions, and customer advocacy into a governed FCA revenue lane connected to projects, messages, walkthroughs, and rollout motion."
        primaryHref={publicRouteCtas.conversion.primaryHref}
        primaryLabel={publicRouteCtas.conversion.primaryLabel}
        secondaryHref={publicActionCatalog.messages.href}
        secondaryLabel={publicActionCatalog.messages.label}
        journey={shellJourney}
        currentJourney="conversion"
      />

      <FounderJourneyStrip
        currentJourney="conversion"
        title="Finished work should become the next growth engine"
        detail="FCA should turn successful delivery and service continuity into repeat introductions, stronger trust, and faster entry into the next qualified opportunity."
        ctaHref={founderJourneyCtaSets.contact.href}
        ctaLabel={founderJourneyCtaSets.contact.label}
      />

      <div style={{ marginTop: 24 }}>
        <PublicOperationsStrip
          eyebrow="Referral operating strip"
          title="Referral generation is now positioned as governed revenue continuity"
          detail="The public shell now includes a dedicated referral and loyalty surface so advocacy, reviews, and repeat introductions remain part of the same FCA lifecycle."
          statusLabel="Growth posture"
          statusValue="Referral lane active"
          items={referralItems}
          primaryHref="/portal/messages"
          primaryLabel="Open Messages"
          secondaryHref="/contact"
          secondaryLabel="Open Contact & Rollout"
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <ProductProofSection
          eyebrow="Referral product proof"
          title="Referral growth can now be demonstrated through live operating routes"
          detail="Use projects, messages, platform, and rollout surfaces to show how finished work converts into reviews, introductions, and real new-opportunity motion."
          highlights={referralProof}
        />
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>What FCA referral continuity should cover</h2>
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8, color: "#334155" }}>
          <li>Review and testimonial capture tied to real project outcomes</li>
          <li>Direct conversion of customer advocacy into guided walkthrough motion</li>
          <li>Message continuity for follow-up, thank-you, and referral handling</li>
          <li>Visibility into how new opportunities re-enter the FCA platform lifecycle</li>
        </ul>
        <a href="/portal/messages" style={{ ...ctaPrimaryStyle, marginTop: 16, display: "inline-flex" }}>Open Message Continuity</a>
      </div>

      <div style={{ marginTop: 24 }}>
        <CustomerTrustPanel
          title="Customers should see how FCA handles advocacy, not just delivery"
          detail="This route helps prove that FCA can convert successful execution into trusted referrals, repeat opportunity flow, and governed follow-through."
          items={[
            { title: "Project credibility", detail: "Referral asks should be backed by visible project and platform proof, not generic claims." },
            { title: "Follow-through channels", detail: "Customer advocacy and introductions should stay connected to messages, contact, and walkthrough operations." },
            { title: "Revenue continuity", detail: "Growth should flow back into the same platform and rollout path that handles every other qualified opportunity." },
          ]}
        />
      </div>

      <PublicActionRail
        title="Referral next actions"
        detail="Use project proof, message continuity, and rollout motion to turn finished work into customer advocacy and revenue-generating introductions."
      />

      <ShellFooter />
    </div>
  );
}
