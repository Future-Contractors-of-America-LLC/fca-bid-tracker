import { useEffect, useState } from "react";
import PortalShell from "../../components/PortalShell";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import { fetchBillingSummary, fetchPortalInvoices } from "../../api/portalClient";
import { routeStateOverlays } from "../../systemState";

const cardStyle = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff" };

export default function PortalFinance() {
  const { state, refreshSyncStamp } = useWorkspaceState();
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    refreshSyncStamp("Finance workspace active");
    Promise.all([
      fetchPortalInvoices().catch(() => null),
      fetchBillingSummary().catch(() => null),
    ]).then(([inv, sum]) => {
      if (inv?.items) setInvoices(inv.items);
      if (sum) setSummary(sum);
    });
  }, [refreshSyncStamp]);

  return (
    <PortalShell
      title="Finance & Revenue"
      subtitle="Track invoices, payment status, and billing milestones for active jobs."
      activeHref="/portal/finance"
      currentJourney="lead"
      routeOverlay={routeStateOverlays.billing}
      primaryHref="/portal/billing"
      primaryLabel="Open billing"
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
        <div style={cardStyle}>
          <div style={{ color: "#64748b", fontSize: 13 }}>Outstanding</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{summary?.outstandingTotal || "$0"}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#64748b", fontSize: 13 }}>Collected (30d)</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{summary?.collectedLast30Days || "$0"}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#64748b", fontSize: 13 }}>Open invoices</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{invoices.filter((i) => i.status !== "Paid").length}</div>
        </div>
      </div>

      <h2 style={{ fontSize: 18 }}>Invoices</h2>
      <div style={{ display: "grid", gap: 12 }}>
        {invoices.length === 0 ? (
          <div style={cardStyle}>No invoices yet. Stage invoices from Billing or Project milestones.</div>
        ) : (
          invoices.map((inv) => (
            <div key={inv.id} style={cardStyle}>
              <strong>{inv.name || inv.subject || inv.id}</strong>
              <div style={{ color: "#475569", marginTop: 6 }}>{inv.amount || inv.total} · {inv.status || "Draft"}</div>
            </div>
          ))
        )}
      </div>
    </PortalShell>
  );
}
