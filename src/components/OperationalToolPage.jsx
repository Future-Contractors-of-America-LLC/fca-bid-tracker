import { useEffect, useState } from "react";
import PortalShell from "./PortalShell";
import useWorkspaceState from "../hooks/useWorkspaceState";
import useCustomerSession from "../hooks/useCustomerSession";
import { routeStateOverlays } from "../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  marginTop: 6,
  marginBottom: 12,
  boxSizing: "border-box",
};

const buttonStyle = {
  background: "#1d4ed8",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 16px",
  fontWeight: 700,
  cursor: "pointer",
};

function useOperationalStore(storageKey, seed = []) {
  const [items, setItems] = useState(() => {
    if (typeof window === "undefined") return seed;
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : seed;
    } catch {
      return seed;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // best effort
    }
  }, [items, storageKey]);

  return [items, setItems];
}

export function createOperationalPortalPage({
  title,
  subtitle,
  activeHref,
  storageKey,
  itemLabel,
  seedItems,
  fields,
  journey = "lead",
}) {
  return function OperationalPortalPage() {
    const { state, refreshSyncStamp } = useWorkspaceState();
    const { session } = useCustomerSession();
    const companyName = session?.company || state?.tenant?.name || "Your company";
    const [items, setItems] = useOperationalStore(storageKey, seedItems);
    const [draft, setDraft] = useState(() => Object.fromEntries(fields.map((f) => [f.key, f.default || ""])));

    useEffect(() => {
      refreshSyncStamp(`${title} workspace active`);
    }, [refreshSyncStamp]);

    function addItem() {
      const required = fields.filter((f) => f.required);
      if (required.some((f) => !String(draft[f.key] || "").trim())) return;
      setItems((current) => [
        {
          id: `${storageKey}-${Date.now()}`,
          ...draft,
          status: "Open",
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);
      setDraft(Object.fromEntries(fields.map((f) => [f.key, f.default || ""])));
    }

    function completeItem(id) {
      setItems((current) => current.map((item) => (item.id === id ? { ...item, status: "Complete" } : item)));
    }

    return (
      <PortalShell
        title={`${companyName} - ${title}`}
        subtitle={subtitle}
        activeHref={activeHref}
        currentJourney={journey}
        routeOverlay={routeStateOverlays.platform}
        primaryHref="/portal/platform"
        primaryLabel="Back to dashboard"
      >
        <div style={{ ...cardStyle, marginBottom: 18, borderLeft: "4px solid #1d4ed8" }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Create {itemLabel}</h2>
          {fields.map((field) => (
            <div key={field.key}>
              <label style={{ fontWeight: 600, fontSize: 14 }}>{field.label}</label>
              {field.type === "select" ? (
                <select
                  style={inputStyle}
                  value={draft[field.key]}
                  onChange={(e) => setDraft((d) => ({ ...d, [field.key]: e.target.value }))}
                >
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  style={inputStyle}
                  value={draft[field.key]}
                  placeholder={field.placeholder || ""}
                  onChange={(e) => setDraft((d) => ({ ...d, [field.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
          <button type="button" style={buttonStyle} onClick={addItem}>Add {itemLabel}</button>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {items.length === 0 ? (
            <div style={cardStyle}>No {itemLabel.toLowerCase()} yet. Add your first item above.</div>
          ) : (
            items.map((item) => (
              <div key={item.id} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ color: item.status === "Complete" ? "#059669" : "#1d4ed8", fontWeight: 700, fontSize: 13 }}>
                      {item.status}
                    </div>
                    <strong>{item[fields[0]?.key] || itemLabel}</strong>
                  </div>
                  {item.status !== "Complete" ? (
                    <button type="button" style={{ ...buttonStyle, background: "#fff", color: "#1d4ed8", border: "1px solid #1d4ed8" }} onClick={() => completeItem(item.id)}>
                      Mark complete
                    </button>
                  ) : null}
                </div>
                {fields.slice(1).map((field) => (
                  item[field.key] ? (
                    <div key={field.key} style={{ color: "#475569", marginTop: 8, fontSize: 14 }}>
                      <strong>{field.label}:</strong> {item[field.key]}
                    </div>
                  ) : null
                ))}
              </div>
            ))
          )}
        </div>
      </PortalShell>
    );
  };
}
