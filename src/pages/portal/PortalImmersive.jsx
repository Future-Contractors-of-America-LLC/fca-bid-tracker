import { useCallback, useEffect, useState } from "react";

import PortalShell from "../../components/PortalShell";

import usePortalProjectId from "../../hooks/usePortalProjectId";

import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";

import ImmersiveVrViewport from "../../components/immersive/ImmersiveVrViewport";

import {

  fetchImmersiveSession,

  probeImmersiveVrSupport,

  recordImmersiveEvidence,

  startImmersiveLab,

} from "../../api/immersiveClient";

import { routeStateOverlays } from "../../systemState";



const card = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff" };

const button = {

  background: "#1d4ed8",

  color: "#fff",

  border: "none",

  borderRadius: 8,

  padding: "10px 14px",

  fontWeight: 700,

  cursor: "pointer",

};

const input = {

  width: "100%",

  padding: "10px 12px",

  borderRadius: 8,

  border: "1px solid #cbd5e1",

  marginTop: 6,

  marginBottom: 12,

  boxSizing: "border-box",

};

const scenarioTemplates = [
  {
    key: "mobilization",
    label: "Mobilization walk",
    note: "Run mobilization walk: verify access routes, staging zones, and safety boundaries.",
  },
  {
    key: "mep-clash",
    label: "MEP clash drill",
    note: "Run MEP clash drill: validate ceiling zones and resolve high-risk coordination points.",
  },
  {
    key: "turnover",
    label: "Client turnover prep",
    note: "Run turnover prep: verify punch completion and closeout evidence path.",
  },
];

function downloadImmersivePackage(name, content) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(href);
}



export default function PortalImmersive() {

  const { projectId, hasProject } = usePortalProjectId();

  const [session, setSession] = useState(null);

  const [vrSupport, setVrSupport] = useState(null);

  const [vrMode, setVrMode] = useState("field-overlay-lab");

  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");

  const [notice, setNotice] = useState("");
  const [scenarioKey, setScenarioKey] = useState("mobilization");



  const reload = useCallback(async () => {

    if (!hasProject) {

      setSession(null);

      setLoading(false);

      return;

    }

    setLoading(true);

    setError("");

    try {

      const [payload, support] = await Promise.all([

        fetchImmersiveSession(projectId),

        probeImmersiveVrSupport(),

      ]);

      setSession(payload.session || null);

      setVrSupport(support);

      setVrMode(payload.session?.vrMode || support.recommendedMode || "field-overlay-lab");

    } catch (err) {

      setError(err.message || "Unable to load immersive session.");

    } finally {

      setLoading(false);

    }

  }, [hasProject, projectId]);



  useEffect(() => {

    reload();

  }, [reload]);



  async function handleStartLab() {

    if (!hasProject) return;

    setBusy(true);

    setError("");

    setNotice("");

    try {

      const item = await startImmersiveLab(projectId, {

        vrMode,

        labType: vrMode === "immersive-vr" ? "vr-field-overlay" : "field-overlay",

      });

      setSession(item);

      setNotice(`Immersive lab started (${item.vrMode || vrMode}).`);

    } catch (err) {

      setError(err.message || "Unable to start immersive lab.");

    } finally {

      setBusy(false);

    }

  }



  async function handleRecordEvidence(event) {

    event.preventDefault();

    if (!hasProject || !session?.sessionId || !note.trim()) return;

    setBusy(true);

    setError("");

    setNotice("");

    try {

      const updated = await recordImmersiveEvidence(projectId, session.sessionId, {

        note: note.trim(),

        vrMode,

        evidenceType: vrMode === "immersive-vr" ? "vr-overlay-capture" : "field-overlay-note",

      });

      setSession(updated);

      setNote("");

      setNotice("VR / field overlay evidence recorded on project spine.");

    } catch (err) {

      setError(err.message || "Unable to record immersive evidence.");

    } finally {

      setBusy(false);

    }

  }

  async function applyScenarioTemplate() {
    const template = scenarioTemplates.find((item) => item.key === scenarioKey);
    if (!template) return;
    setNote(template.note);
    setNotice(`Scenario loaded: ${template.label}.`);
  }

  function exportVrPrepPackage() {
    if (!session?.sessionId) return;
    const payload = {
      projectId,
      sessionId: session.sessionId,
      vrMode,
      status: session.status || "started",
      evidenceCount: (session.evidence || []).length,
      evidence: session.evidence || [],
      exportedAt: new Date().toISOString(),
    };
    const fileName = `${projectId}-${session.sessionId}-vr-prep-package.json`.replace(/[^a-zA-Z0-9_-]+/g, "-").toLowerCase();
    downloadImmersivePackage(fileName, JSON.stringify(payload, null, 2));
    setNotice("VR prep package exported.");
  }



  const designHref = hasProject

    ? `/portal/design?projectId=${encodeURIComponent(projectId)}`

    : "/portal/design";

  const academyHref = "/academy/catalog?query=deg-ctin-410";



  return (

    <PortalShell

      title="Immersive & VR Labs"

      subtitle="Field overlay labs, WebXR sessions, and construction simulation tied to active projects."

      activeHref="/portal/immersive"

      currentJourney="job"

      routeOverlay={routeStateOverlays.design}

      primaryHref={designHref}

      primaryLabel="Open Design Workspace"

    >

      <AuricruxInsightPanel

        title="Auricrux Immersive Intelligence"

        targetObjectId={projectId}

        sourceRoute="/portal/immersive"

        rationale="VR and field overlay evidence should link to plan sets, RFIs, and closeout artifacts."

        nextAction="Complete cert-bim-field-operations lab evidence before mobilization sign-off."

        actionHref={academyHref}

        actionLabel="Open VR/AR academy track"

        tone="blue"

        liveRecommend={hasProject}

      />



      {!hasProject ? (

        <div style={card}>Select an active project from <a href="/portal/projects">Projects</a> to start an immersive lab.</div>

      ) : null}



      {hasProject ? (

        <>

          <div style={{ ...card, marginBottom: 16 }}>

            <div style={{ fontWeight: 800, marginBottom: 8 }}>VR readiness</div>

            {vrSupport ? (

              <div style={{ color: "#475569", lineHeight: 1.8 }}>

                <div>WebXR: <strong>{vrSupport.webXr ? "supported" : "not available"}</strong></div>

                <div>Immersive VR: <strong>{vrSupport.immersiveVr ? "headset ready" : "desktop simulation"}</strong></div>

                <div>Recommended mode: <strong>{vrSupport.recommendedMode}</strong></div>

              </div>

            ) : (

              <div style={{ color: "#64748b" }}>Probing device VR capabilities…</div>

            )}

          </div>



          <div style={{ marginBottom: 16 }}>

            <ImmersiveVrViewport

              active={hasProject}

              vrMode={vrMode}

              onVrModeChange={setVrMode}

            />

          </div>



          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>

            <button type="button" style={button} disabled={busy} onClick={handleStartLab}>

              {busy ? "Starting…" : session ? "Restart lab session" : "Start immersive lab"}

            </button>

            <a href={designHref} style={{ ...button, textDecoration: "none", background: "#e2e8f0", color: "#0f172a" }}>Design workspace</a>

            <a href={`/portal/field-supervision?projectId=${encodeURIComponent(projectId)}`} style={{ ...button, textDecoration: "none", background: "#ecfdf5", color: "#166534" }}>Field supervision</a>

          </div>



          {loading ? <div style={card}>Loading immersive session…</div> : null}



          {session ? (

            <div style={{ ...card, marginBottom: 16 }}>

              <div style={{ fontWeight: 800, marginBottom: 8 }}>Active session — {session.sessionId}</div>

              <div style={{ color: "#475569", lineHeight: 1.8 }}>

                <div>Mode: <strong>{session.vrMode || vrMode}</strong></div>

                <div>Status: <strong>{session.status || "started"}</strong></div>

                <div>Evidence items: <strong>{(session.evidence || []).length}</strong></div>

              </div>

              <form onSubmit={handleRecordEvidence} style={{ marginTop: 14 }}>

                <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  <select
                    value={scenarioKey}
                    onChange={(event) => setScenarioKey(event.target.value)}
                    style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px", fontWeight: 700 }}
                    aria-label="VR scenario template"
                  >
                    {scenarioTemplates.map((item) => (
                      <option key={item.key} value={item.key}>{item.label}</option>
                    ))}
                  </select>
                  <button type="button" onClick={applyScenarioTemplate} style={{ ...button, background: "#e2e8f0", color: "#0f172a" }}>
                    Load scenario
                  </button>
                  <button type="button" onClick={exportVrPrepPackage} style={{ ...button, background: "#eff6ff", color: "#1d4ed8" }}>
                    Export VR prep package
                  </button>
                </div>

                <label>

                  Record field overlay / VR evidence

                  <input

                    value={note}

                    onChange={(event) => setNote(event.target.value)}

                    placeholder="Describe overlay alignment, clash, or QC observation"

                    style={input}

                    required

                  />

                </label>

                <button type="submit" disabled={busy || !note.trim()} style={{ ...button, background: "#166534" }}>

                  {busy ? "Saving…" : "Record evidence"}

                </button>

              </form>

              {(session.evidence || []).length ? (

                <div style={{ marginTop: 14, display: "grid", gap: 8 }}>

                  {(session.evidence || []).map((item) => (

                    <div key={item.evidenceId} style={{ fontSize: 14, color: "#334155" }}>

                      - {item.note} <span style={{ color: "#64748b" }}>({item.vrMode || session.vrMode})</span>

                    </div>

                  ))}

                </div>

              ) : null}

            </div>

          ) : null}

        </>

      ) : null}



      {notice ? <div style={{ ...card, color: "#166534", borderColor: "#bbf7d0", background: "#f0fdf4", marginBottom: 16 }}>{notice}</div> : null}

      {error ? <div style={{ ...card, color: "#991b1b", borderColor: "#fecaca", background: "#fef2f2" }}>{error}</div> : null}

    </PortalShell>

  );

}

