import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import PortalSliceAuricrux from "../../components/portal/PortalSliceAuricrux";
import useCustomerSession from "../../hooks/useCustomerSession";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import { openAuricruxAssistant } from "../../auricruxAssistant";
import {
  portalButtonPrimary,
  portalButtonSecondary,
  portalCardStyle,
  portalEyebrowStyle,
  portalInputStyle,
  portalTokens,
} from "../../portalDesignTokens";

const STORAGE_KEY = "fca_plan_room_sets_v1";

function readSets() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Construction plan room (not commercial SaaS packages).
 * Sets feed Design + Files; Auricrux can brief any set.
 */
export default function PortalPlans() {
  const { session } = useCustomerSession();
  const projectApi = useProjectWorkspace();
  const activeProject = projectApi?.activeProject || projectApi?.project || null;
  const [sets, setSets] = useState(() => {
    const existing = readSets();
    if (existing.length) return existing;
    return [
      {
        id: "set-seed-1",
        name: "IFC Architectural / Structural Issued for Construction",
        revision: "Rev C",
        format: "PDF plan set",
        discipline: "Architectural + Structural",
        status: "Current",
        notes: "Seed set — replace with your issued package",
        linkedProjectId: "",
        updatedAt: new Date().toISOString(),
      },
    ];
  });
  const [draft, setDraft] = useState({
    name: "",
    revision: "",
    format: "PDF",
    discipline: "Architectural",
    status: "Current",
    notes: "",
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
    } catch {
      // best effort
    }
  }, [sets]);

  const projectLabel = activeProject?.name || activeProject?.title || session?.company || "Active job";

  const formats = useMemo(
    () => ["PDF", "PDF + image sheets", "IFC published views", "RVT exported sheets", "DWG plot sheets", "SharePoint link"],
    [],
  );

  function addSet(event) {
    event.preventDefault();
    if (!draft.name.trim()) return;
    setSets((prev) => [
      {
        id: `set-${Date.now()}`,
        ...draft,
        name: draft.name.trim(),
        linkedProjectId: activeProject?.id || "",
        updatedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setDraft({ name: "", revision: "", format: "PDF", discipline: "Architectural", status: "Current", notes: "" });
  }

  return (
    <PortalShell
      title="Plan room"
      subtitle="Issue packages, revisions, and formats for every job — open in Design, brief with Auricrux, keep evidence in Files."
      activeHref="/portal/plans"
      currentJourney="coordination"
      primaryHref="/portal/design"
      primaryLabel="Open design workspace"
      showRouteOverlay={false}
    >
      <PortalSliceAuricrux
        title="Auricrux Plan Briefing"
        targetObjectType="PlanSet"
        targetObjectId={sets[0]?.id || "PLAN-ROOM"}
        sourceRoute="/portal/plans"
        rationale="Plan room must make drawing packages obvious, versioned, and automatable."
        nextAction="Upload or register the current IFC/PDF set, then ask Auricrux for a field briefing."
        actionHref="/portal/design"
        actionLabel="Markup in Design"
        liveRecommend
      />

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Formats FCA handles in the plan spine</div>
        <p style={{ color: portalTokens.body, lineHeight: 1.55 }}>
          PDF / image sheets for markup and takeoff · IFC & RVT via published views or exported sheets · DWG plot sheets ·
          SharePoint-hosted packages · photo overlays from Field Supervision. Native Revit/Navisworks authoring still happens
          in those tools; FCA is the contractor OS that owns versions, briefings, RFIs, and field proof.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a href="/portal/design" style={portalButtonPrimary}>Design & takeoff</a>
          <a href="/portal/files" style={portalButtonSecondary}>Document control</a>
          <a href="/portal/immersive" style={portalButtonSecondary}>Immersive / VR review</a>
          <button
            type="button"
            style={{ ...portalButtonSecondary, cursor: "pointer" }}
            onClick={() => openAuricruxAssistant(`Brief the current plan set for ${projectLabel}. Highlight conflicts, RFI risks, and takeoff priorities.`)}
          >
            Auricrux plan briefing
          </button>
        </div>
      </div>

      <form onSubmit={addSet} style={{ ...portalCardStyle, marginBottom: 16, display: "grid", gap: 10 }}>
        <div style={{ fontWeight: 800 }}>Register plan / model package</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <input
            required
            placeholder="Package name"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            style={portalInputStyle}
          />
          <input
            placeholder="Revision"
            value={draft.revision}
            onChange={(e) => setDraft((d) => ({ ...d, revision: e.target.value }))}
            style={portalInputStyle}
          />
          <select
            value={draft.format}
            onChange={(e) => setDraft((d) => ({ ...d, format: e.target.value }))}
            style={portalInputStyle}
          >
            {formats.map((format) => <option key={format} value={format}>{format}</option>)}
          </select>
          <input
            placeholder="Discipline"
            value={draft.discipline}
            onChange={(e) => setDraft((d) => ({ ...d, discipline: e.target.value }))}
            style={portalInputStyle}
          />
          <select
            value={draft.status}
            onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
            style={portalInputStyle}
          >
            {["Current", "Superseded", "For review", "As-built"].map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <textarea
          placeholder="Notes (issue purpose, sheet count, model LOD…)"
          value={draft.notes}
          onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
          style={{ ...portalInputStyle, minHeight: 72 }}
        />
        <button type="submit" style={{ ...portalButtonPrimary, border: "none", cursor: "pointer", width: "fit-content" }}>
          Add to plan room
        </button>
      </form>

      <div style={{ display: "grid", gap: 12 }}>
        {sets.map((set) => (
          <article key={set.id} style={portalCardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={portalEyebrowStyle}>{set.status} · {set.format}</div>
                <h3 style={{ margin: "6px 0" }}>{set.name}</h3>
                <div style={{ color: portalTokens.body, fontSize: 14, lineHeight: 1.5 }}>
                  {set.revision ? `${set.revision} · ` : ""}{set.discipline}
                  {set.notes ? ` — ${set.notes}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
                <a href="/portal/design" style={portalButtonPrimary}>Open in Design</a>
                <a href="/portal/files" style={portalButtonSecondary}>Attach evidence</a>
                <button
                  type="button"
                  style={{ ...portalButtonSecondary, cursor: "pointer" }}
                  onClick={() => openAuricruxAssistant(`Teach this plan set: ${set.name}. Revision ${set.revision || "n/a"}. Format ${set.format}.`)}
                >
                  Teach / brief
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </PortalShell>
  );
}
