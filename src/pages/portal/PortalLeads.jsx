import { useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import useLeadsWorkspace from "../../hooks/useLeadsWorkspace";
import useLeadsNextActions from "../../hooks/useLeadsNextActions";
import AuricruxLeadsHint from "../../components/leads/AuricruxLeadsHint";
import LeadsEcosystemHub from "../../components/leads/LeadsEcosystemHub";
import LeadQualificationChecklist from "../../components/leads/LeadQualificationChecklist";
import LeadAuditTrail from "../../components/leads/LeadAuditTrail";
import {
  CHECKLIST_FIELDS,
  formatLeadCurrency,
  formatLeadDate,
  PIPELINE_STAGES,
  STAGE_LABELS,
} from "../../utils/leadsModel";
import { routeStateOverlays } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const actionButtonStyle = {
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 600,
  padding: "10px 12px",
  cursor: "pointer",
};

const primaryButtonStyle = {
  ...actionButtonStyle,
  background: "#2563eb",
  borderColor: "#2563eb",
  color: "#fff",
};

const disabledButtonStyle = {
  ...primaryButtonStyle,
  opacity: 0.55,
  cursor: "not-allowed",
};

const inputStyle = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  padding: "10px 12px",
  font: "inherit",
};

const emptyForm = {
  company: "",
  projectName: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  trade: "general-construction",
  location: "",
  value: "",
  notes: "",
  budgetConfirmed: false,
  plansReceived: false,
  siteWalkComplete: false,
  decisionMakerIdentified: false,
};

function filterLeads(leads, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return leads;
  return leads.filter((lead) =>
    [lead.company, lead.projectName, lead.contactEmail, lead.location, lead.trade, lead.source]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
}

export default function PortalLeads() {
  const leadsActions = useLeadsNextActions();
  const {
    leads,
    grouped,
    metrics,
    loading,
    error,
    busy,
    selectedLead,
    selectedLeadId,
    setSelectedLeadId,
    checklist,
    qualificationReady,
    refresh,
    saveLead,
    patchLead,
    saveChecklist,
    qualifySelectedLead,
  } = useLeadsWorkspace();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [statusMessage, setStatusMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastOpportunityId, setLastOpportunityId] = useState("");

  const filteredLeads = useMemo(() => filterLeads(leads, searchQuery), [leads, searchQuery]);
  const filteredGrouped = useMemo(() => {
    const map = {};
    PIPELINE_STAGES.forEach((stage) => {
      map[stage] = (grouped[stage] || []).filter((lead) => filteredLeads.some((item) => item.leadId === lead.leadId));
    });
    return map;
  }, [grouped, filteredLeads]);

  const canQualify = selectedLead && ["new", "under-review"].includes(selectedLead.status);
  const opportunityHref = selectedLead?.opportunityId || lastOpportunityId
    ? `/portal/opportunities/${encodeURIComponent(selectedLead?.opportunityId || lastOpportunityId)}`
    : null;

  async function handleCreateLead(event) {
    event.preventDefault();
    setStatusMessage("");
    try {
      await saveLead(form);
      setForm(emptyForm);
      setShowForm(false);
      setStatusMessage("Lead captured on the governed CRM spine.");
    } catch {
      // surfaced via hook
    }
  }

  async function handleAdvanceReview() {
    if (!selectedLead) return;
    setStatusMessage("");
    try {
      await patchLead(selectedLead.leadId, {
        status: "under-review",
        jurisdictionStatus: "pending",
        reason: "Moved to under-review for qualification checklist.",
      });
      setStatusMessage("Lead advanced to under-review.");
    } catch {
      // surfaced via hook
    }
  }

  async function handleChecklistChange(nextChecklist) {
    if (!selectedLead) return;
    try {
      await saveChecklist(selectedLead, nextChecklist);
    } catch {
      // surfaced via hook
    }
  }

  async function handleQualify() {
    if (!selectedLead || !qualificationReady) return;
    setStatusMessage("");
    try {
      const result = await qualifySelectedLead(selectedLead, checklist);
      const oppId = result.opportunity?.opportunityId || result.lead?.opportunityId;
      if (oppId) setLastOpportunityId(oppId);
      setStatusMessage(
        oppId
          ? `Lead qualified. Open opportunity ${oppId} to begin estimate handoff.`
          : "Lead qualified into governed opportunity.",
      );
    } catch {
      // surfaced via hook
    }
  }

  return (
    <PortalShell
      title="Lead Intelligence"
      subtitle="Governed intake, qualification checklists, scoring, and opportunity handoff on the CRM spine."
      activeHref="/portal/leads"
      journey="growth"
      routeOverlay={routeStateOverlays.leads}
    >
      <div style={{ display: "grid", gap: 16 }}>
        {(error || statusMessage) && (
          <div
            style={{
              ...cardStyle,
              borderColor: error ? "#fecaca" : "#bbf7d0",
              color: error ? "#991b1b" : "#166534",
            }}
          >
            {error || statusMessage}
            {opportunityHref && !error ? (
              <div style={{ marginTop: 10 }}>
                <a href={opportunityHref} style={{ color: "#2563eb", fontWeight: 700 }}>
                  Open qualified opportunity
                </a>
              </div>
            ) : null}
          </div>
        )}

        {leadsActions.error ? (
          <div style={{ ...cardStyle, borderColor: "#fecaca", color: "#991b1b" }}>{leadsActions.error}</div>
        ) : null}

        <AuricruxLeadsHint actions={leadsActions.items} loading={leadsActions.loading} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          {[
            { label: "Total leads", value: metrics.totalLeads },
            { label: "Active pipeline", value: metrics.activeLeads },
            { label: "Pipeline value", value: formatLeadCurrency(metrics.pipelineValue) },
            { label: "Avg Auricrux score", value: metrics.avgScore },
          ].map((metric) => (
            <div key={metric.label} style={cardStyle}>
              <div style={{ fontSize: 13, color: "#64748b" }}>{metric.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>{metric.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button type="button" style={primaryButtonStyle} onClick={() => setShowForm((open) => !open)}>
            {showForm ? "Close capture form" : "+ Capture lead"}
          </button>
          <button type="button" style={actionButtonStyle} onClick={refresh} disabled={loading || busy}>
            Refresh pipeline
          </button>
          <input
            style={{ ...inputStyle, maxWidth: 320 }}
            placeholder="Search company, project, email, location…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        {showForm ? (
          <form onSubmit={handleCreateLead} style={{ ...cardStyle, display: "grid", gap: 12 }}>
            <strong style={{ color: "#0f172a" }}>Manual lead capture</strong>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <label>
                Company
                <input style={inputStyle} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
              </label>
              <label>
                Project name
                <input style={inputStyle} value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} required />
              </label>
              <label>
                Contact email
                <input style={inputStyle} type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} required />
              </label>
              <label>
                Estimated value
                <input style={inputStyle} type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
              </label>
              <label>
                Jurisdiction
                <input style={inputStyle} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </label>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              <strong style={{ color: "#334155", fontSize: 14 }}>Initial qualification signals</strong>
              {CHECKLIST_FIELDS.map(({ key, label }) => (
                <label key={key} style={{ display: "flex", gap: 8, alignItems: "center", color: "#475569" }}>
                  <input
                    type="checkbox"
                    checked={Boolean(form[key])}
                    onChange={(event) => setForm({ ...form, [key]: event.target.checked })}
                  />
                  {label}
                </label>
              ))}
            </div>
            <button type="submit" style={primaryButtonStyle} disabled={busy}>
              Save lead
            </button>
          </form>
        ) : null}

        <LeadsEcosystemHub leadsActions={leadsActions.items} selectedLead={selectedLead} />

        {!loading && leads.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: "center", padding: 32 }}>
            <strong style={{ color: "#0f172a", fontSize: 18 }}>No governed leads yet</strong>
            <p style={{ color: "#64748b", lineHeight: 1.7 }}>
              Route website intake through <a href="/intake">/intake</a> or capture your first lead here.
            </p>
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(320px, 1fr)", gap: 16 }}>
          <div style={{ ...cardStyle, overflowX: "auto" }}>
            <strong style={{ color: "#0f172a" }}>Pipeline board</strong>
            {loading ? (
              <p style={{ color: "#64748b" }}>Loading leads…</p>
            ) : (
              <div style={{ display: "flex", gap: 12, marginTop: 12, minHeight: 320 }}>
                {PIPELINE_STAGES.map((stage) => (
                  <div key={stage} style={{ minWidth: 220, flex: "0 0 220px" }}>
                    <div style={{ fontWeight: 700, color: "#334155", marginBottom: 8 }}>
                      {STAGE_LABELS[stage]} ({(filteredGrouped[stage] || []).length})
                    </div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {(filteredGrouped[stage] || []).length === 0 ? (
                        <div style={{ color: "#94a3b8", fontSize: 13, padding: 8 }}>No leads in this stage.</div>
                      ) : null}
                      {(filteredGrouped[stage] || []).map((lead) => (
                        <button
                          key={lead.leadId}
                          type="button"
                          onClick={() => setSelectedLeadId(lead.leadId)}
                          style={{
                            textAlign: "left",
                            border: selectedLeadId === lead.leadId ? "2px solid #2563eb" : "1px solid #e2e8f0",
                            borderRadius: 12,
                            padding: 12,
                            background: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>{lead.company}</div>
                          <div style={{ fontSize: 13, color: "#64748b" }}>{lead.projectName}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                            Score {lead.auricruxScore} · {formatLeadCurrency(lead.value)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredLeads.length ? (
              <div style={{ marginTop: 20 }}>
                <strong style={{ color: "#0f172a" }}>Lead register</strong>
                <div style={{ overflowX: "auto", marginTop: 10 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ textAlign: "left", color: "#64748b" }}>
                        <th style={{ padding: 8 }}>Company</th>
                        <th style={{ padding: 8 }}>Stage</th>
                        <th style={{ padding: 8 }}>Score</th>
                        <th style={{ padding: 8 }}>Value</th>
                        <th style={{ padding: 8 }}>Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead) => (
                        <tr
                          key={lead.leadId}
                          style={{ borderTop: "1px solid #e2e8f0", cursor: "pointer" }}
                          onClick={() => setSelectedLeadId(lead.leadId)}
                        >
                          <td style={{ padding: 8, fontWeight: 700 }}>{lead.company}</td>
                          <td style={{ padding: 8 }}>{STAGE_LABELS[lead.status] || lead.status}</td>
                          <td style={{ padding: 8 }}>{lead.auricruxScore}</td>
                          <td style={{ padding: 8 }}>{formatLeadCurrency(lead.value)}</td>
                          <td style={{ padding: 8 }}>{formatLeadDate(lead.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div style={cardStyle}>
              <strong style={{ color: "#0f172a" }}>Lead detail</strong>
              {!selectedLead ? (
                <p style={{ color: "#64748b", marginTop: 12 }}>Select a lead from the pipeline board or register.</p>
              ) : (
                <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, color: "#0f172a" }}>{selectedLead.company}</div>
                    <div style={{ color: "#64748b" }}>{selectedLead.projectName}</div>
                  </div>
                  <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
                    <div>Contact: {selectedLead.contactEmail || "—"}</div>
                    <div>Location: {selectedLead.location || "—"}</div>
                    <div>Status: {STAGE_LABELS[selectedLead.status] || selectedLead.status}</div>
                    <div>Score: {selectedLead.auricruxScore} ({selectedLead.auricruxRisk} risk)</div>
                    <div>Updated: {formatLeadDate(selectedLead.updatedAt)}</div>
                    {selectedLead.raw?.sourceBidId ? (
                      <div>Source bid: {selectedLead.raw.sourceBidId}</div>
                    ) : null}
                  </div>
                  <div style={{ padding: 12, borderRadius: 10, background: "#f8fafc", color: "#334155", lineHeight: 1.6 }}>
                    {selectedLead.nextAction}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {canQualify ? (
                      <>
                        <button type="button" style={actionButtonStyle} onClick={handleAdvanceReview} disabled={busy}>
                          Advance review
                        </button>
                        <button
                          type="button"
                          style={qualificationReady ? primaryButtonStyle : disabledButtonStyle}
                          onClick={handleQualify}
                          disabled={busy || !qualificationReady}
                        >
                          Qualify lead
                        </button>
                      </>
                    ) : null}
                    {opportunityHref ? (
                      <a href={opportunityHref} style={{ ...actionButtonStyle, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                        Open opportunity
                      </a>
                    ) : null}
                    {selectedLead.status === "qualified" ? (
                      <a href="/portal/pipeline" style={{ ...actionButtonStyle, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                        Commercial pipeline
                      </a>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            {selectedLead && canQualify ? (
              <LeadQualificationChecklist
                checklist={checklist}
                lead={selectedLead}
                disabled={busy}
                onChange={handleChecklistChange}
              />
            ) : null}

            {selectedLead ? <LeadAuditTrail events={selectedLead.raw?.auditEvents || []} /> : null}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
