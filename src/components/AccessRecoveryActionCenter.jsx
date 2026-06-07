import { resolveCustomerProduct, resolveWorkspaceEntryHref } from "../customerSession";
import { navigateTo } from "../navigation";

const shellStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 16,
  padding: 18,
  background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const cardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 12,
  padding: 14,
  background: "#fff",
};

const actionButtonStyle = (tone = "primary") => ({
  border: tone === "primary" ? "1px solid #1d4ed8" : "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
  background: tone === "primary" ? "#1d4ed8" : "#fff",
  color: tone === "primary" ? "#fff" : "#0f172a",
  font: "inherit",
});

const productLabels = {
  saas: "SaaS workspace",
  lms: "Academy / LMS",
  auricrux: "Auricrux guidance",
};

function resolveRecoveryChannels(product, enabledComms = {}) {
  if (product === "lms") {
    return {
      lecture: enabledComms.lecture === false,
      email: enabledComms.email === false,
    };
  }

  if (product === "auricrux") {
    return {
      teams: enabledComms.teams === false,
      conference: enabledComms.conference === false,
      phone: enabledComms.phone === false,
    };
  }

  return {
    email: enabledComms.email === false,
    sms: enabledComms.sms === false,
    phone: enabledComms.phone === false,
  };
}

export default function AccessRecoveryActionCenter({ requestedPath, session, setProductAccess, setCommsAccess, applyPlanPreset, refreshSyncStamp }) {
  const product = resolveCustomerProduct(requestedPath);
  const enabledComms = session?.enabledComms || { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true };
  const recoveryChannels = resolveRecoveryChannels(product, enabledComms);
  const missingChannelCount = Object.values(recoveryChannels).filter(Boolean).length;
  const selectedPlan = session?.selectedPlan || "startup";
  const needsProduct = product !== "public" && session?.enabledProducts?.[product] === false;

  function openRecoveredRoute() {
    navigateTo(resolveWorkspaceEntryHref(session, requestedPath));
  }

  function restoreRequestedProduct() {
    if (product !== "public") {
      setProductAccess(product, true);
    }

    Object.entries(recoveryChannels).forEach(([channel, needed]) => {
      if (needed) setCommsAccess(channel, true);
    });

    refreshSyncStamp(`Recovered ${productLabels[product] || "requested product"} access from access recovery center`);
    navigateTo(requestedPath);
  }

  function activateEnterpriseRecovery() {
    applyPlanPreset("enterprise");
    refreshSyncStamp("Enterprise recovery posture activated from access recovery center");
    navigateTo(requestedPath);
  }

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Live access recovery action center</div>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Repair blocked route access instead of stopping at a restricted-state explanation</h2>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 920 }}>
            These controls perform real session mutations at the exact moment a customer hits a blocked route. Auricrux can now restore the requested product layer, turn on the necessary communications lanes, or promote the workspace into a broader recovery posture without forcing a manual detour.
          </div>
        </div>
        <div style={{ ...cardStyle, minWidth: 240 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Restricted route target</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{productLabels[product] || "Requested product"}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{requestedPath}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 14 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Requested product status</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{needsProduct ? "Pending" : "Enabled"}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>{productLabels[product] || "Requested product"} is {needsProduct ? "not enabled for this session yet" : "available for this session"}.</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Recovery channels needed</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{missingChannelCount}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>Auricrux can enable the exact comms lanes needed for this route to stop dead-end access drift.</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Current plan posture</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{selectedPlan}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>A broader plan posture can repair blocked access across product and communications lanes together.</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Route-level recovery</div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
            Enable the blocked product plus its critical communications support, then reopen the requested route immediately.
          </div>
          <button type="button" onClick={restoreRequestedProduct} style={actionButtonStyle("primary")}>
            Restore Requested Access
          </button>
        </div>

        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Enterprise recovery posture</div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
            Promote this workspace into enterprise posture so product access and cross-channel communications are broadly available.
          </div>
          <button type="button" onClick={activateEnterpriseRecovery} style={actionButtonStyle()}>
            Activate Enterprise Recovery
          </button>
        </div>

        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Return to best enabled route</div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
            Open the best currently enabled workspace route if you want continuity without changing the active session configuration.
          </div>
          <button type="button" onClick={openRecoveredRoute} style={actionButtonStyle()}>
            Open Best Enabled Route
          </button>
        </div>
      </div>
    </div>
  );
}
