import LegacyRouteBridge from "../../components/LegacyRouteBridge";

export default function LegacyBidEntry({ requestedPath = "/bid-entry" }) {
  return (
    <LegacyRouteBridge
      eyebrow="Bid intake bridge"
      title="Redirecting to FCA bid intake"
      subtitle="The shorthand bid-entry route now forwards into the compatible FCA customer intake surface so button flows continue to work."
      requestedPath={requestedPath}
      targetHref="/fca-customer-entry/index.html"
      targetLabel="Open Bid Intake"
      companionHref="/bid-status"
      companionLabel="Open Bid Status"
    />
  );
}
