import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createLead,
  fetchLeads,
  qualifyLead,
  updateLead,
} from "../api/leadsClient";
import {
  buildLeadPayload,
  buildQualifyPayload,
  computeLeadMetrics,
  defaultChecklist,
  getLeadChecklist,
  groupLeadsByStage,
  isQualificationReady,
  normalizeLead,
} from "../utils/leadsModel";

function readLeadIdFromLocation() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("leadId") || "";
}

export default function useLeadsWorkspace() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState(readLeadIdFromLocation());
  const [busy, setBusy] = useState(false);
  const [checklist, setChecklist] = useState(defaultChecklist());

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await fetchLeads();
      const normalized = (payload.items || []).map(normalizeLead).filter(Boolean);
      setLeads(normalized);
    } catch (loadError) {
      setLeads([]);
      setError(loadError.message || "Unable to load leads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const fromQuery = readLeadIdFromLocation();
    if (fromQuery) setSelectedLeadId(fromQuery);
  }, []);

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.leadId === selectedLeadId) || null,
    [leads, selectedLeadId],
  );

  useEffect(() => {
    setChecklist(selectedLead ? getLeadChecklist(selectedLead) : defaultChecklist());
  }, [selectedLead]);

  const metrics = useMemo(() => computeLeadMetrics(leads), [leads]);
  const grouped = useMemo(() => groupLeadsByStage(leads), [leads]);
  const qualificationReady = useMemo(
    () => (selectedLead ? isQualificationReady(selectedLead, checklist) : false),
    [selectedLead, checklist],
  );

  const saveLead = useCallback(async (form) => {
    setBusy(true);
    setError("");
    try {
      const payload = buildLeadPayload(form);
      const result = await createLead(payload);
      const created = normalizeLead(result.item);
      setLeads((current) => [created, ...current]);
      setSelectedLeadId(created.leadId);
      return created;
    } catch (saveError) {
      setError(saveError.message || "Unable to save lead.");
      throw saveError;
    } finally {
      setBusy(false);
    }
  }, []);

  const patchLead = useCallback(async (leadId, updates) => {
    setBusy(true);
    setError("");
    try {
      const result = await updateLead(leadId, updates);
      const updated = normalizeLead(result.item);
      setLeads((current) => current.map((lead) => (lead.leadId === leadId ? updated : lead)));
      return updated;
    } catch (patchError) {
      setError(patchError.message || "Unable to update lead.");
      throw patchError;
    } finally {
      setBusy(false);
    }
  }, []);

  const saveChecklist = useCallback(async (lead, nextChecklist) => {
    setChecklist(nextChecklist);
    if (!lead) return null;
    return patchLead(lead.leadId, {
      checklist: nextChecklist,
      budgetStatus: nextChecklist.budgetConfirmed ? "confirmed" : lead.budgetStatus,
      ownershipStatus: nextChecklist.decisionMakerIdentified ? "verified" : lead.ownershipStatus,
      reason: "Qualification checklist updated.",
    });
  }, [patchLead]);

  const qualifySelectedLead = useCallback(async (lead, activeChecklist, reason = "") => {
    setBusy(true);
    setError("");
    try {
      const payload = buildQualifyPayload(lead, activeChecklist, reason);
      const result = await qualifyLead(lead.leadId, payload);
      const qualified = normalizeLead(result.lead);
      setLeads((current) => current.map((item) => (item.leadId === lead.leadId ? qualified : item)));
      return { lead: qualified, opportunity: result.opportunity || null };
    } catch (qualifyError) {
      setError(qualifyError.message || "Unable to qualify lead.");
      throw qualifyError;
    } finally {
      setBusy(false);
    }
  }, []);

  return {
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
    setChecklist,
    qualificationReady,
    refresh,
    saveLead,
    patchLead,
    saveChecklist,
    qualifySelectedLead,
  };
}
