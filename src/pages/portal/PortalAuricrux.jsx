import { useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import AuricruxCommsPanel from "../../components/AuricruxCommsPanel";
import useCustomerSession from "../../hooks/useCustomerSession";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import { fetchAuricruxActions, submitAuricruxAction } from "../../api/auricruxActionsClient";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import PortalApiStatusBanner from "../../components/portal/PortalApiStatusBanner";
import { auricruxCommsChannels } from "../../systemState";
import { openAuricruxAssistant } from "../../auricruxAssistant";
import { FOUNDER_PROOF_PROJECT_ID } from "../../config/productionMode";
import { portalButtonPrimary, portalButtonSecondary, portalCardStyle, portalEyebrowStyle, portalTokens } from "../../portalDesignTokens";

const actionRouteMap = {
  Project: "/portal/projects",
  Bid: "/portal/bids",
  Invoice: "/portal/billing",
  File: "/portal/files",
  Message: "/portal/messages",
  Academy: "/portal/academy",
  Support: "/portal/support",
};

function normalizeGuidedAction(action) {
  if (typeof action === "string") {
    return {
      key: action,
      title: action,
      detail: "Suggested from your current workspace.",
      href: "/portal/projects",
      label: "Open projects",
    };
  }

  const href = actionRouteMap[action.targetObjectType] || "/portal/platform";
  const modeLabel = action.mode === "recommend" ? "Recommended" : action.mode === "validate" ? "Review" : "Action";

  return {
    key: `${action.mode}-${action.targetObjectType}-${action.targetObjectId}`,
    title: action.rationale,
    detail: `${modeLabel} · ${action.targetObjectType}${action.targetObjectId ? ` ${action.targetObjectId}` : ""}`,
    href,
    label: `Open ${action.targetObjectType.toLowerCase()}`,
  };
}

export default function PortalAuricrux() {
  const { session } = useCustomerSession();
  const { state } = useWorkspaceState();
  const { activeProject } = useProjectWorkspace();
  const [adviseBusy, setAdviseBusy] = useState(false);
  const [adviseError, setAdviseError] = useState("");
  const [adviseResult, setAdviseResult] = useState("");
  const actionsLoad = usePortalApiLoad(() => fetchAuricruxActions(), []);
  const liveActions = actionsLoad.data?.items || [];

  const guidedActions = useMemo(
    () => liveActions.map(normalizeGuidedAction),
    [liveActions],
  );

  const projectId = activeProject?.id || state.project?.id || FOUNDER_PROOF_PROJECT_ID;
  const usingLiveActions = actionsLoad.isLive && liveActions.length > 0;

  const enabledComms = session?.enabledComms || { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true };
  const commItems = auricruxCommsChannels.map((item) => ({
    ...item,
    value: `${item.value}${enabledComms[item.label.toLowerCase()] === false ? " · Not enabled" : ""}`,
    href: `/portal/messages#${item.label.toLowerCase()}`,
    ctaLabel: `Open ${item.label}`,
  }));

  async function adviseActiveProject() {
    if (adviseBusy) return;
    setAdviseBusy(true);
    setAdviseError("");
    setAdviseResult("");
    try {
      const payload = await submitAuricruxAction({
        mode: "recommend",
        capabilityId: "project-next-action",
        targetObjectType: "Project",
        targetObjectId: projectId,
        rationale: `Recommend the next construction action for ${projectId}.`,
        sourceRoute: "/portal/auricrux",
      });
      const guidance = payload?.guidance?.reply || payload?.guidance || payload?.rationale || "Auricrux action recorded.";
      setAdviseResult(typeof guidance === "string" ? guidance : JSON.stringify(guidance));
      await actionsLoad.reload();
    } catch (error) {
      setAdviseError(error.message || "Auricrux advise failed.");
    } finally {
      setAdviseBusy(false);
    }
  }

  return (
    <PortalShell
      title="Auricrux"
      subtitle={`Advise and act on ${projectId}.`}
      activeHref="/portal/auricrux"
    >
      <PortalApiStatusBanner
        status={actionsLoad.status}
        error={actionsLoad.error}
        onRetry={actionsLoad.reload}
        label="Auricrux actions"
      />

      <div style={{ ...portalCardStyle, marginBottom: 16, borderLeft: "4px solid #7c5313" }}>
        <div style={{ ...portalEyebrowStyle, color: "#7c5313" }}>Active job</div>
        <h2 style={{ marginTop: 8, marginBottom: 8 }}>{projectId}</h2>
        <p style={{ color: portalTokens.body, lineHeight: 1.6, marginTop: 0 }}>
          Ask Auricrux for the next move on this project, or open chat for a guided walkthrough.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={adviseActiveProject}
            disabled={adviseBusy}
            style={{ ...portalButtonPrimary, border: "none", cursor: adviseBusy ? "not-allowed" : "pointer", background: "#7c5313", opacity: adviseBusy ? 0.7 : 1 }}
          >
            {adviseBusy ? "Asking Auricrux..." : "Advise on this project"}
          </button>
          <button
            type="button"
            onClick={() => openAuricruxAssistant(`What should I do next on ${projectId}?`)}
            style={{ ...portalButtonPrimary, border: "none", cursor: "pointer" }}
          >
            Open chat
          </button>
          <a href="/portal/proof" style={portalButtonSecondary}>Proof path</a>
        </div>
        {adviseError ? <p style={{ color: "#b91c1c", marginTop: 10, marginBottom: 0 }}>{adviseError}</p> : null}
        {adviseResult ? (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#fffbeb", border: "1px solid #fde68a", color: portalTokens.body, lineHeight: 1.6 }}>
            {adviseResult}
          </div>
        ) : null}
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16, borderLeft: `4px solid ${usingLiveActions ? "#16a34a" : "#d97706"}` }}>
        <div style={{ ...portalEyebrowStyle, color: usingLiveActions ? "#166534" : "#92400e" }}>
          {usingLiveActions ? "Live recommendations" : "Waiting on live actions"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10, marginTop: 12 }}>
          {guidedActions.length === 0 ? (
            <p style={{ color: portalTokens.muted, margin: 0 }}>
              No recommendations yet. Use Advise on this project above.
            </p>
          ) : null}
          {guidedActions.slice(0, 6).map((action) => (
            <article key={action.key} style={{ border: `1px solid ${portalTokens.border}`, borderRadius: 12, padding: 14, background: portalTokens.panel }}>
              <div style={{ fontWeight: 700, marginBottom: 6, lineHeight: 1.45 }}>{action.title}</div>
              <div style={{ color: portalTokens.muted, fontSize: 12, marginBottom: 10 }}>{action.detail}</div>
              <a href={action.href} style={{ ...portalButtonPrimary, display: "inline-block", fontSize: 13, padding: "8px 12px" }}>
                {action.label}
              </a>
            </article>
          ))}
        </div>
      </div>

      <AuricruxCommsPanel
        title="Messages and channels"
        detail="Reach your team from one place."
        statusLabel="Channels"
        statusValue={`${Object.values(enabledComms).filter(Boolean).length} enabled`}
        items={commItems}
      />
    </PortalShell>
  );
}
