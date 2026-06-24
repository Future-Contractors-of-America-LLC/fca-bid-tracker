import { useState } from "react";
import { createNativePlanSet } from "../../api/designWorkspaceClient";

const TEMPLATES = [
  { id: "multi", label: "Multi-discipline (G/A/S/M/E)" },
  { id: "architectural", label: "Architectural set" },
  { id: "electrical", label: "Electrical set" },
];

export default function PlanCreationPanel({ projectId, onCreated, busy = false }) {
  const [name, setName] = useState("New FCA Plan Set");
  const [template, setTemplate] = useState("multi");
  const [error, setError] = useState("");

  async function handleCreate() {
    setError("");
    try {
      const result = await createNativePlanSet(projectId, { name, template });
      onCreated?.(result?.file?.fileId || result?.manifest?.fileId);
    } catch (createError) {
      setError(createError.message || "Unable to create plan set.");
    }
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ fontWeight: 700 }}>Create native plan set</div>
      <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
        Author a blank FCA FCAS sheet set — no external PDF or DWG required. FCAS is the source of truth.
      </p>
      <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
        Plan set name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px" }}
        />
      </label>
      <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
        Template
        <select
          value={template}
          onChange={(event) => setTemplate(event.target.value)}
          style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px" }}
        >
          {TEMPLATES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      {error ? <div style={{ color: "#b91c1c", fontSize: 13 }}>{error}</div> : null}
      <button
        type="button"
        disabled={busy || !name.trim()}
        onClick={handleCreate}
        style={{
          border: "1px solid #2563eb",
          background: "#2563eb",
          color: "#fff",
          borderRadius: 10,
          padding: "10px 12px",
          fontWeight: 700,
          cursor: busy ? "wait" : "pointer",
        }}
      >
        Create FCAS plan set
      </button>
    </div>
  );
}
