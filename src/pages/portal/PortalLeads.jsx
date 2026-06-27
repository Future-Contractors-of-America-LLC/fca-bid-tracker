import { useCallback, useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import PortalApiStatusBanner from "../../components/portal/PortalApiStatusBanner";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { fetchPortalLeads, qualifyPortalLead } from "../../api/portalLeadsClient";
import { publishPortalPageContext } from "../../portalPageContext";
import { routeStateOverlays } from "../../systemState";
import {
  PortalAlert,
  PortalEmptyState,
  PortalEntityTable,
  PortalPageIntro,
  PortalQuickStats,
  PortalStatusBadge,
} from "../../components/portal/PortalPrimitives";
import { portalButtonPrimary, portalButtonSecondary, portalCardStyle, portalTokens } from "../../portalDesignTokens";

export default function PortalLeads() {
  const [leads, setLeads] = useState([]);
  const [source, setSource] = useState("loading");
  const [error, setError] = useState("");
  const [activeLeadId, setActiveLeadId] = useState("");
  const [qualifying, setQualifying] = useState(false);
  const [notice, setNotice] = useState("");

  const loadLeads = useCallback(async () => {
    setSource("loading");
    const result = await fetchPortalLeads();
    setLeads(result.leads);
    setSource(result.source);
    setError(result.error || "");
    if (result.leads.length && !activeLeadId) {
      setActiveLeadId(result.leads[0].leadId);
    }
  }, [activeLeadId]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const activeLead = useMemo(
    () => leads.find((entry) => entry.leadId === activeLeadId) || leads[0] || null,
    [activeLeadId, leads],
  );

  useEffect(() => {
    if (!activeLead?.leadId) {
      publishPortalPageContext(null);
      return undefined;
    }
    publishPortalPageContext({
      surface: "portal-leads",
      leadId: activeLead.leadId,
      targetObjectId: activeLead.leadId,
      targetObjectType: "Lead",
    });
    return () => publishPortalPageContext(null);
  }, [activeLead?.leadId]);

  const newCount = leads.filter((lead) => ["new", "under-review"].includes(lead.status)).length;
  const qualifiedCount = leads.filter((lead) => lead.status === "qualified").length;

  const tableRows = useMemo(
    () =>
      leads.map((lead) => ({
        id: lead.leadId,
        active: lead.leadId === activeLeadId,
        lead,
        company: lead.company,
        contact: lead.contact,
        serviceLine: lead.serviceLine,
        status: lead.status,
        sourceChannel: lead.sourceChannel,
        value: lead.estimatedValue ? `$${Number(lead.estimatedValue).toLocaleString()}` : "—",
      })),
    [activeLeadId, leads],
  );

  async function handleQualify() {
    if (!activeLead || activeLead.status === "qualified") return;
    setQualifying(true);
    setNotice("");
    try {
      await qualifyPortalLead(activeLead.leadId, {
        reason: `Qualified from portal leads board for ${activeLead.company}.`,
      });
      setNotice(`Lead ${activeLead.leadId} qualified and opportunity created.`);
      await loadLeads();
    } catch (qualifyError) {
      setNotice(qualifyError.message || "Qualification failed.");
    } finally {
      setQualifying(false);
    }
  }

  return (
    <PortalShell
      title="Leads board"
      subtitle="Govern every intake lead, qualify into opportunities, and hand off to bids and pipeline."
      activeHref="/portal/leads"
      currentJourney="lead"
      routeOverlay={routeStateOverlays.leads || routeStateOverlays.bids}
      primaryHref="/portal/bids"
      primaryLabel="Open qualification board"
    >
      <PortalPageIntro
        eyebrow="Growth spine"
        title="Unified leads command"
        detail="Review intake and job-board leads in one governed board. Qualify winners into opportunities, then route to bids and commercial pipeline."
      />

      <PortalApiStatusBanner status={source} error={error} onRetry={loadLeads} label="leads data" />

      {notice ? <PortalAlert tone={notice.includes("failed") ? "warning" : "success"}>{notice}</PortalAlert> : null}

      <PortalQuickStats
        items={[
          { label: "Total leads", value: leads.length, hint: "On tenant spine" },
          { label: "Awaiting review", value: newCount, hint: "New or under review" },
          { label: "Qualified", value: qualifiedCount, hint: "Ready for bid handoff" },
        ]}
      />

      {activeLead ? (
        <AuricruxInsightPanel
          title="Auricrux lead intelligence"
          targetObjectId={activeLead.leadId}
          targetObjectType="Lead"
          sourceRoute="/portal/leads"
          rationale={`Review qualification readiness for ${activeLead.company} before routing to bids.`}
          nextAction={
            activeLead.status === "qualified"
              ? "Route qualified opportunity into bid intake."
              : "Confirm budget, jurisdiction, and ownership — then qualify."
          }
        />
      ) : null}

      {leads.length === 0 && source !== "loading" ? (
        <PortalEmptyState
          title="No leads on the spine yet"
          detail="Intake and job-board submissions appear here once captured through governed API routes."
          primaryHref="/contact"
          primaryLabel="Open intake"
          secondaryHref="/job-board"
          secondaryLabel="View job board"
        />
      ) : (
        <PortalEntityTable
          columns={[
            { key: "company", label: "Company" },
            { key: "contact", label: "Contact" },
            { key: "serviceLine", label: "Service line" },
            {
              key: "status",
              label: "Status",
              render: (row) => <PortalStatusBadge status={row.status} active={row.active} />,
            },
            { key: "sourceChannel", label: "Source" },
            { key: "value", label: "Est. value" },
            {
              key: "select",
              label: "",
              render: (row) => (
                <button type="button" style={portalButtonSecondary} onClick={() => setActiveLeadId(row.id)}>
                  {row.active ? "Selected" : "Review"}
                </button>
              ),
            },
          ]}
          rows={tableRows}
          emptyTitle="No leads on the spine yet"
          emptyDetail="Intake and job-board submissions appear here once captured through governed API routes."
          emptyPrimaryHref="/contact"
          emptyPrimaryLabel="Open intake"
        />
      )}

      {activeLead ? (
        <article style={{ ...portalCardStyle, marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>{activeLead.company}</h3>
          <p style={{ color: portalTokens.body, lineHeight: 1.55 }}>
            {activeLead.projectIntent || "No project intent recorded."}
          </p>
          <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, margin: "12px 0" }}>
            <div>
              <dt style={{ fontSize: 12, color: portalTokens.muted }}>Contact</dt>
              <dd style={{ margin: 0 }}>{activeLead.contact}</dd>
            </div>
            <div>
              <dt style={{ fontSize: 12, color: portalTokens.muted }}>Location</dt>
              <dd style={{ margin: 0 }}>{activeLead.location}</dd>
            </div>
            <div>
              <dt style={{ fontSize: 12, color: portalTokens.muted }}>Opportunity</dt>
              <dd style={{ margin: 0 }}>{activeLead.opportunityId || "Not created yet"}</dd>
            </div>
          </dl>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              style={portalButtonPrimary}
              disabled={qualifying || activeLead.status === "qualified"}
              onClick={handleQualify}
            >
              {qualifying ? "Qualifying…" : activeLead.status === "qualified" ? "Already qualified" : "Qualify lead"}
            </button>
            <a href="/portal/bids" style={{ ...portalButtonSecondary, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              Open bids board
            </a>
            <a href="/portal/pipeline" style={{ ...portalButtonSecondary, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              Open pipeline
            </a>
          </div>
        </article>
      ) : null}
    </PortalShell>
  );
}
