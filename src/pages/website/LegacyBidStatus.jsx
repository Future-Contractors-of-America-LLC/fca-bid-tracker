import { useMemo } from "react";
import LegacyRouteBridge from "../../components/LegacyRouteBridge";

export default function LegacyBidStatus({ requestedPath = "/bid-status" }) {
  const targetHref = useMemo(() => {
    if (typeof window === "undefined") return "/bids/status.html";
    const search = window.location.search || "";
    return `/bids/status.html${search}`;
  }, []);

  return (
    <LegacyRouteBridge
      eyebrow="Bid status bridge"
      title="Opening customer bid status"
      subtitle="The bid-status route forwards into the customer-scoped Auricrux Central bid register. Pass ?customerId= or ?customer= to pre-filter."
      requestedPath={requestedPath}
      targetHref={targetHref}
      targetLabel="Open Bid Status"
      companionHref="/bid-entry"
      companionLabel="Open Bid Intake"
    />
  );
}
