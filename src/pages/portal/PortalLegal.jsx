import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import {
  complianceChecklist,
  documentTemplates,
  emptyAgreement,
  emptyLicense,
  emptyLienWaiver,
  licenseTypes,
} from "../../contractorLegal/contractorLegalCatalog";
import {
  daysUntilExpiry,
  expiryTone,
  hydrateContractorLegalState,
  readContractorLegalState,
  writeContractorLegalState,
} from "../../contractorLegal/contractorLegalStorage";
import { routeStateOverlays } from "../../systemState";
import { FCA_ENTITY, formatPrincipalOffice } from "../../legal/entityInfo";

const card = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const input = {
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "10px 12px",
  font: "inherit",
  background: "#fff",
  color: "#0f172a",
};

const btn = {
  border: "1px solid #2563eb",
  background: "#2563eb",
  color: "#fff",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
};

const btnSecondary = { ...btn, background: "#eff6ff", color: "#1d4ed8" };

const sectionTitle = { marginTop: 0, color: "#0f172a" };

export default function PortalLegal() {
  const [state, setState] = useState(() => readContractorLegalState());
  const [apiBacked, setApiBacked] = useState(false);

  useEffect(() => {
    let active = true;
    hydrateContractorLegalState()
      .then((workspace) => {
        if (!active) return;
        setState(workspace);
        setApiBacked(Boolean(workspace?.backingSource));
      })
      .catch(() => {
        if (active) setApiBacked(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    writeContractorLegalState(state);
  }, [state]);

  const completedCount = state.checklist.filter((c) => c.completed).length;
  const checklistPct = Math.round((completedCount / state.checklist.length) * 100);

  const templatesByCategory = useMemo(() => {
    const map = {};
    documentTemplates.forEach((t) => {
      if (!map[t.category]) map[t.category] = [];
      map[t.category].push(t);
    });
    return map;
  }, []);

  function updateChecklist(id, patch) {
    setState((s) => ({
      ...s,
      checklist: s.checklist.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }

  return (
    <PortalShell
      title="Contractor Legal Command"
      subtitle="Entity, licenses, agreements, lien waivers, and compliance for your jobs."
      routeOverlay={routeStateOverlays.legal}
      activeHref="/portal/legal"
      currentJourney="coordination"
      primaryHref="/portal/files"
      primaryLabel="Open Files"
    >
      <div style={{ display: "grid", gap: 20 }}>
        <div style={{ ...card, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" }}>
          <h2 style={sectionTitle}>Legal readiness overview</h2>
          <p style={{ color: "#475569", lineHeight: 1.7 }}>
            FCA reference entity: <strong>{FCA_ENTITY.legalName}</strong> — {formatPrincipalOffice(false)}. Use this
            workspace to track <em>your</em> contractor entity, Virginia DPOR credentials, insurance, agreements, and lien
            waiver discipline before customer delivery.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 12 }}>
            <div style={{ padding: 12, borderRadius: 10, background: "#fff", border: "1px solid #dbe3ef", minWidth: 140 }}>
              <div style={{ fontSize: 12, color: "#64748b" }}>Compliance checklist</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{checklistPct}%</div>
            </div>
            <div style={{ padding: 12, borderRadius: 10, background: "#fff", border: "1px solid #dbe3ef", minWidth: 140 }}>
              <div style={{ fontSize: 12, color: "#64748b" }}>Licenses & COIs</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{state.licenses.length}</div>
            </div>
            <div style={{ padding: 12, borderRadius: 10, background: "#fff", border: "1px solid #dbe3ef", minWidth: 140 }}>
              <div style={{ fontSize: 12, color: "#64748b" }}>Active agreements</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{state.agreements.length}</div>
            </div>
            <div style={{ padding: 12, borderRadius: 10, background: "#fff", border: "1px solid #dbe3ef", minWidth: 140 }}>
              <div style={{ fontSize: 12, color: "#64748b" }}>Lien waivers tracked</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{state.lienWaivers.length}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
            <a href="/academy/programs/contractor-business-formation-legal/modules/1" style={btnSecondary}>
              Business Formation Academy
            </a>
            <a href="/academy/programs/contractor-construction-law-essentials/modules/1" style={btnSecondary}>
              Construction Law Essentials
            </a>
            <a href="/academy/programs/virginia-dpor-residential-license-prep/modules/1" style={btnSecondary}>
              Virginia DPOR Prep
            </a>
            <a href="/portal/files" style={btnSecondary}>
              File spine (store executed docs)
            </a>
            <a href="/legal/contractor-resources" style={btnSecondary}>
              Public template index
            </a>
          </div>
        </div>

        <div style={card}>
          <h2 style={sectionTitle}>Your business entity</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <label>
              <div style={{ fontSize: 13, marginBottom: 4 }}>Legal entity name</div>
              <input
                style={input}
                value={state.entityName}
                onChange={(e) => setState((s) => ({ ...s, entityName: e.target.value }))}
                placeholder="Your Company LLC"
              />
            </label>
            <label>
              <div style={{ fontSize: 13, marginBottom: 4 }}>Entity type</div>
              <select
                style={input}
                value={state.entityType}
                onChange={(e) => setState((s) => ({ ...s, entityType: e.target.value }))}
              >
                <option value="LLC">LLC</option>
                <option value="S-Corp">S-Corp</option>
                <option value="C-Corp">C-Corp</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
              </select>
            </label>
            <label>
              <div style={{ fontSize: 13, marginBottom: 4 }}>State of formation</div>
              <input
                style={input}
                value={state.stateOfFormation}
                onChange={(e) => setState((s) => ({ ...s, stateOfFormation: e.target.value }))}
              />
            </label>
          </div>
        </div>

        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <h2 style={sectionTitle}>License & insurance vault</h2>
            <button type="button" style={btn} onClick={() => setState((s) => ({ ...s, licenses: [...s.licenses, emptyLicense()] }))}>
              Add credential
            </button>
          </div>
          {state.licenses.length === 0 ? (
            <p style={{ color: "#64748b" }}>Add Virginia DPOR licenses, trade licenses, OSHA cards, and insurance COIs.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {state.licenses.map((lic, index) => {
                const days = daysUntilExpiry(lic.expires);
                return (
                  <div key={lic.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                      <select
                        style={input}
                        value={lic.typeId}
                        onChange={(e) => {
                          const next = [...state.licenses];
                          next[index] = { ...lic, typeId: e.target.value };
                          setState((s) => ({ ...s, licenses: next }));
                        }}
                      >
                        {licenseTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <input
                        style={input}
                        placeholder="License / policy #"
                        value={lic.number}
                        onChange={(e) => {
                          const next = [...state.licenses];
                          next[index] = { ...lic, number: e.target.value };
                          setState((s) => ({ ...s, licenses: next }));
                        }}
                      />
                      <input
                        style={input}
                        type="date"
                        value={lic.expires}
                        onChange={(e) => {
                          const next = [...state.licenses];
                          next[index] = { ...lic, expires: e.target.value };
                          setState((s) => ({ ...s, licenses: next }));
                        }}
                      />
                      <div style={{ display: "flex", alignItems: "center", fontWeight: 700, color: expiryTone(days) }}>
                        {days === null ? "No expiry set" : days < 0 ? `Expired ${Math.abs(days)}d ago` : `${days}d remaining`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={card}>
          <h2 style={sectionTitle}>Document template library</h2>
          <p style={{ color: "#64748b", lineHeight: 1.7 }}>
            Counsel-reviewed templates live in <code>docs/legal/contractor/</code>. Register executed copies on{" "}
            <a href="/portal/files">Files</a> using the suggested category labels.
          </p>
          {Object.entries(templatesByCategory).map(([category, items]) => (
            <div key={category} style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 15, color: "#0f172a" }}>{category}</h3>
              <div style={{ display: "grid", gap: 10 }}>
                {items.map((t) => (
                  <div key={t.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 12 }}>
                    <div style={{ fontWeight: 700 }}>{t.title}</div>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{t.summary}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                      {t.jurisdiction} — File as: {t.fileCategory} — Template: <code>{t.docPath}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <h2 style={sectionTitle}>Agreements tracker</h2>
            <button type="button" style={btn} onClick={() => setState((s) => ({ ...s, agreements: [...s.agreements, emptyAgreement()] }))}>
              Add agreement
            </button>
          </div>
          {state.agreements.length === 0 ? (
            <p style={{ color: "#64748b" }}>Track owner contracts, subcontracts, and change orders.</p>
          ) : (
            state.agreements.map((agr, index) => (
              <div key={agr.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 12, marginTop: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
                  <input
                    style={input}
                    placeholder="Title"
                    value={agr.title}
                    onChange={(e) => {
                      const next = [...state.agreements];
                      next[index] = { ...agr, title: e.target.value };
                      setState((s) => ({ ...s, agreements: next }));
                    }}
                  />
                  <input
                    style={input}
                    placeholder="Counterparty"
                    value={agr.counterparty}
                    onChange={(e) => {
                      const next = [...state.agreements];
                      next[index] = { ...agr, counterparty: e.target.value };
                      setState((s) => ({ ...s, agreements: next }));
                    }}
                  />
                  <select
                    style={input}
                    value={agr.status}
                    onChange={(e) => {
                      const next = [...state.agreements];
                      next[index] = { ...agr, status: e.target.value };
                      setState((s) => ({ ...s, agreements: next }));
                    }}
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="executed">Executed</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <h2 style={sectionTitle}>Lien waiver tracker</h2>
            <button type="button" style={btn} onClick={() => setState((s) => ({ ...s, lienWaivers: [...s.lienWaivers, emptyLienWaiver()] }))}>
              Add waiver
            </button>
          </div>
          <p style={{ fontSize: 13, color: "#64748b" }}>
            Link waivers to <a href="/portal/billing">Billing</a> progress and final payments. Use conditional waivers until funds clear.
          </p>
          {state.lienWaivers.map((lw, index) => (
            <div key={lw.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 12, marginTop: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
                <select
                  style={input}
                  value={lw.type}
                  onChange={(e) => {
                    const next = [...state.lienWaivers];
                    next[index] = { ...lw, type: e.target.value };
                    setState((s) => ({ ...s, lienWaivers: next }));
                  }}
                >
                  <option value="conditional">Conditional</option>
                  <option value="unconditional">Unconditional</option>
                </select>
                <input
                  style={input}
                  placeholder="Payee"
                  value={lw.payee}
                  onChange={(e) => {
                    const next = [...state.lienWaivers];
                    next[index] = { ...lw, payee: e.target.value };
                    setState((s) => ({ ...s, lienWaivers: next }));
                  }}
                />
                <input
                  style={input}
                  placeholder="Amount"
                  value={lw.amount}
                  onChange={(e) => {
                    const next = [...state.lienWaivers];
                    next[index] = { ...lw, amount: e.target.value };
                    setState((s) => ({ ...s, lienWaivers: next }));
                  }}
                />
                <select
                  style={input}
                  value={lw.status}
                  onChange={(e) => {
                    const next = [...state.lienWaivers];
                    next[index] = { ...lw, status: e.target.value };
                    setState((s) => ({ ...s, lienWaivers: next }));
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="signed">Signed</option>
                  <option value="funded">Funded</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <div style={card}>
          <h2 style={sectionTitle}>Compliance checklist</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {state.checklist.map((item) => {
              const meta = complianceChecklist.find((c) => c.id === item.id);
              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    padding: 12,
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    background: item.completed ? "#f0fdf4" : "#fff",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={(e) => updateChecklist(item.id, { completed: e.target.checked })}
                    style={{ marginTop: 4 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{meta?.label || item.id}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{meta?.category}</div>
                    {meta?.academyLink ? (
                      <a href={meta.academyLink} style={{ fontSize: 13, color: "#1d4ed8" }}>
                        Open Academy lesson
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
