import { useEffect, useState } from "react";
import PortalShell from "./PortalShell";
import useWorkspaceState from "../hooks/useWorkspaceState";
import useCustomerSession from "../hooks/useCustomerSession";
import useProjectWorkspace from "../hooks/useProjectWorkspace";
import { publishPortalPageContext } from "../portalPageContext";
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

function readProjectIdFromLocation() {
  if (typeof window === "undefined") return "";
  try {
    const params = new URLSearchParams(window.location.search);
    return (params.get("projectId") || "").trim();
  } catch {
    return "";
  }
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
  apiHandlers = null,
  projectScoped = false,
}) {
  return function OperationalPortalPage() {
    const { state, refreshSyncStamp } = useWorkspaceState();
    const { session } = useCustomerSession();
    const { projects, activeProject } = useProjectWorkspace();
    const [selectedProjectId, setSelectedProjectId] = useState(() => {
      const fromQuery = projectScoped ? readProjectIdFromLocation() : "";
      return fromQuery || activeProject?.id || projects[0]?.id || "";
    });
    const companyName = session?.company || state?.tenant?.name || "Your company";
    const [localItems, setLocalItems] = useOperationalStore(storageKey, seedItems);
    const [apiItems, setApiItems] = useState([]);
    const [backingSource, setBackingSource] = useState(apiHandlers ? "loading" : "localStorage");
    const [loadError, setLoadError] = useState("");
    const [actionError, setActionError] = useState("");
    const [actionNotice, setActionNotice] = useState("");
    const [busy, setBusy] = useState(false);
    const [draft, setDraft] = useState(() => Object.fromEntries(fields.map((f) => [f.key, f.default || ""])));

    const items = apiHandlers ? apiItems : localItems;

    useEffect(() => {
      if (!projectScoped) return;
      const fromQuery = readProjectIdFromLocation();
      if (fromQuery) {
        setSelectedProjectId(fromQuery);
        return;
      }
      if (activeProject?.id) setSelectedProjectId(activeProject.id);
      else if (!selectedProjectId && projects[0]?.id) setSelectedProjectId(projects[0].id);
    }, [activeProject?.id, projects, projectScoped, selectedProjectId]);

    useEffect(() => {
      if (!projectScoped) return undefined;
      publishPortalPageContext({
        surface: "field-ops",
        projectId: selectedProjectId || activeProject?.id || "",
        pipelineStep: null,
      });
      return () => publishPortalPageContext(null);
    }, [activeProject?.id, projectScoped, selectedProjectId]);

    async function reloadApiItems() {
      if (!apiHandlers?.fetchItems) return;
      const params = projectScoped && selectedProjectId ? { projectId: selectedProjectId } : {};
      const payload = await apiHandlers.fetchItems(params);
      setApiItems(payload.items || []);
      setBackingSource(payload.backingSource || "auricrux-central-table-store");
    }

    useEffect(() => {
      refreshSyncStamp(`${title} workspace active`);
      if (!apiHandlers?.fetchItems) return undefined;
      let active = true;
      setLoadError("");
      reloadApiItems()
        .catch((error) => {
          if (!active) return;
          setLoadError(error.message || `Unable to load ${itemLabel.toLowerCase()} data. API unreachable — local queue active.`);
          setApiItems(localItems);
          setBackingSource("localStorage-fallback");
        });
      return () => {
        active = false;
      };
    }, [refreshSyncStamp, selectedProjectId]);

    async function addItem() {
      const required = fields.filter((f) => f.required);
      if (required.some((f) => !String(draft[f.key] || "").trim())) return;
      setActionError("");
      setBusy(true);
      try {
        if (apiHandlers?.createItem) {
          const body = projectScoped && selectedProjectId
            ? { ...draft, projectId: selectedProjectId }
            : draft;
          await apiHandlers.createItem(body);
          await reloadApiItems();
        } else {
          setLocalItems((current) => [
            {
              id: `${storageKey}-${Date.now()}`,
              ...draft,
              status: "Open",
              createdAt: new Date().toISOString(),
            },
            ...current,
          ]);
        }
        setDraft(Object.fromEntries(fields.map((f) => [f.key, f.default || ""])));
      } catch (error) {
        setActionError(error.message || `Unable to create ${itemLabel.toLowerCase()}.`);
      } finally {
        setBusy(false);
      }
    }

    async function completeItem(id) {
      setActionError("");
      setActionNotice("");
      setBusy(true);
      try {
        if (apiHandlers?.completeItem) {
          const result = await apiHandlers.completeItem(id);
          await reloadApiItems();
          const posting = result?.jobCostPosting;
          if (posting?.jobCost?.actualCost) {
            setActionNotice(`Task closed. Job cost actual updated to ${posting.jobCost.actualCost}.`);
          } else if (posting?.lineItem?.amount) {
            setActionNotice(`Task closed. Posted ${posting.lineItem.amount} to job cost.`);
          }
        } else {
          setLocalItems((current) => current.map((item) => (item.id === id ? { ...item, status: "Complete" } : item)));
        }
      } catch (error) {
        setActionError(error.message || `Unable to complete ${itemLabel.toLowerCase()}.`);
      } finally {
        setBusy(false);
      }
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
        {apiHandlers ? (
          <div style={{ ...cardStyle, marginBottom: 18, background: "#f8fafc" }}>
            <div style={{ color: "#475569" }}><strong>Data source:</strong> {backingSource}</div>
            {projectScoped ? (
              <div style={{ marginTop: 12 }}>
                <label style={{ fontWeight: 600, fontSize: 14 }}>Project</label>
                <select
                  style={inputStyle}
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  {projects.length === 0 ? <option value="">No projects available</option> : null}
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>{project.name || project.id}</option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
        ) : null}

        {loadError ? (
          <div style={{ ...cardStyle, marginBottom: 18, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b" }}>
            {loadError}
          </div>
        ) : null}

        {actionError ? (
          <div style={{ ...cardStyle, marginBottom: 18, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b" }}>
            {actionError}
          </div>
        ) : null}
        {actionNotice ? (
          <div style={{ ...cardStyle, marginBottom: 18, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534" }}>
            {actionNotice}
          </div>
        ) : null}

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
          <button type="button" style={buttonStyle} onClick={addItem} disabled={busy}>
            {busy ? "Saving..." : `Add ${itemLabel}`}
          </button>
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
                    <button type="button" style={{ ...buttonStyle, background: "#fff", color: "#1d4ed8", border: "1px solid #1d4ed8" }} onClick={() => completeItem(item.id)} disabled={busy}>
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
