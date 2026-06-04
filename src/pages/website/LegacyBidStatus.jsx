import LegacyRouteBridge from "../../components/LegacyRouteBridge";

export default function LegacyBidStatus({ requestedPath = "/bid-status" }) {
  return (
    <LegacyRouteBridge
      eyebrow="Bid status bridge"
      title="Redirecting to FCA bid status"
      subtitle="The shorthand bid-status route now forwards into the compatible FCA customer status surface so customer follow-through remains intact."
      requestedPath={requestedPath}
      targetHref="/fca-customer-status/index.html"
      targetLabel="Open Bid Status"
      companionHref="/bid-entry"
      companionLabel="Open Bid Intake"
    />
  );
}
